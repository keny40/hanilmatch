"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import ProfilePhotoStrip from "../../../components/ProfilePhotoStrip";
import {
  createProfile,
  createProfilePhotoPresign,
  getMyProfile,
  getMyProfilePhotos,
  registerProfilePhoto,
  updateProfile,
  uploadProfilePhoto,
  formatAgeGroup,
} from "../../../lib/api";
import { AppLocale, getBrowserLocale, translate } from "../../../lib/i18n";

const maxProfilePhotos = 3;
type ProfilePhotoPreview = { id: string; file_url: string };
const matchPurposeOptions = [
  "언어교환",
  "친구",
  "문화교류",
  "여행정보",
  "비즈니스 네트워킹",
];
const languageLevelOptions = ["입문", "초급", "중급", "고급", "원어민 수준"];

export default function ProfileOnboardingPage() {
  const router = useRouter();
  const [age, setAge] = useState("28");
  const [ageGroupPreview, setAgeGroupPreview] = useState("25-29");
  const [nationality, setNationality] = useState("KR");
  const [gender, setGender] = useState("male");
  const [occupation, setOccupation] = useState("");
  const [location, setLocation] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [learningLanguage, setLearningLanguage] = useState("");
  const [languageLevel, setLanguageLevel] = useState("초급");
  const [matchPurpose, setMatchPurpose] = useState(matchPurposeOptions[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("travel, culture, language exchange");
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [photos, setPhotos] = useState<ProfilePhotoPreview[]>([]);
  const [pendingPhotoFiles, setPendingPhotoFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locale, setLocale] = useState<AppLocale>("ko");

  useEffect(() => {
    setLocale(getBrowserLocale());
    void (async () => {
      try {
        const profile = await getMyProfile();
        const existingPhotos = await getMyProfilePhotos();
        setAge(String(profile.age));
        setAgeGroupPreview(formatAgeGroup(profile.age_group));
        setNationality(profile.nationality ?? "KR");
        setGender(profile.gender ?? "male");
        setOccupation(profile.occupation ?? "");
        setLocation(profile.location ?? "");
        setNativeLanguage(profile.native_language ?? "");
        setLearningLanguage(profile.learning_language ?? "");
        setLanguageLevel(profile.language_level ?? "초급");
        setMatchPurpose(profile.match_purpose ?? matchPurposeOptions[0]);
        setPhoneNumber(profile.phone_number ?? "");
        setBio(profile.bio ?? "");
        setInterests(profile.interests.join(", "));
        setPhotos(existingPhotos.map((photo) => ({ id: photo.id, file_url: photo.file_url })));
        setMode("edit");
      } catch (error) {
        const message = error instanceof Error ? error.message : translate(locale, "profile.lookupFailed");
        if (message === "Could not validate credentials") {
          router.replace("/login");
          return;
        }
        setMode("create");
      }
    })();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setStatusMessage(translate(locale, "profile.savingProfile"));

    if (!nationality || !gender || !age || !nativeLanguage.trim() || !learningLanguage.trim() || !(matchPurpose.trim() || bio.trim())) {
      setLoading(false);
      setStatusMessage("");
      setError(translate(locale, "profile.requiredMissing"));
      return;
    }

    if (!((nationality === "KR" && gender === "male") || (nationality === "JP" && gender === "female"))) {
      setLoading(false);
      setStatusMessage("");
      setError(translate(locale, "profile.mvpPairRequired"));
      return;
    }

    if (!occupation.trim()) {
      setLoading(false);
      setStatusMessage("");
      setError("직업/분야를 입력해 주세요.");
      return;
    }

    const payload = {
      age: Number(age),
      nationality,
      gender,
      occupation,
      location,
      native_language: nativeLanguage,
      learning_language: learningLanguage,
      language_level: languageLevel,
      match_purpose: matchPurpose,
      phone_number: phoneNumber,
      bio,
      interests: interests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      if (mode === "edit") {
        await updateProfile(payload);
      } else {
        await createProfile(payload);
      }

      if (pendingPhotoFiles.length) {
        setUploading(true);
        setStatusMessage(translate(locale, "profile.uploadingPhoto"));
        try {
          const uploadedPhotos: ProfilePhotoPreview[] = [];
          for (const [index, file] of pendingPhotoFiles.entries()) {
            const photo = await uploadSelectedProfilePhoto(file, photos.length + index);
            uploadedPhotos.push({ id: photo.id, file_url: photo.file_url });
          }
          setPhotos((current) => [...current, ...uploadedPhotos]);
          setPendingPhotoFiles([]);
        } catch (photoError) {
          console.error("Profile photo upload failed after profile save:", photoError);
          setError(translate(locale, "profile.partialPhotoFailure"));
          setSuccess("");
          return;
        } finally {
          setUploading(false);
        }
      }

      setSuccess(translate(locale, "profile.saved"));
      window.setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } catch (submitError) {
      console.error("Profile save failed:", submitError);
      setError(translate(locale, "profile.saveFailed"));
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  }

  function handleAgeChange(nextAge: string) {
    setAge(nextAge);
    const parsed = Number(nextAge);
    if (!Number.isNaN(parsed) && parsed >= 18) {
      let preview = "45+";
      if (parsed <= 24) preview = "18-24";
      else if (parsed <= 29) preview = "25-29";
      else if (parsed <= 34) preview = "30-34";
      else if (parsed <= 39) preview = "35-39";
      else if (parsed <= 44) preview = "40-44";
      setAgeGroupPreview(preview);
    }
  }

  async function uploadSelectedProfilePhoto(file: File, displayOrder: number) {
    if ((process.env.NEXT_PUBLIC_STORAGE_BACKEND ?? "local") === "s3") {
      const presign = await createProfilePhotoPresign(file.name, file.type || "application/octet-stream");
      await fetch(presign.upload_url, {
        method: presign.method,
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      return registerProfilePhoto(presign.file_url, displayOrder);
    }
    return uploadProfilePhoto(file, displayOrder);
  }

  async function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    if (photos.length + pendingPhotoFiles.length + files.length > maxProfilePhotos) {
      setError(translate(locale, "profile.photoLimit"));
      event.target.value = "";
      return;
    }

    setPendingPhotoFiles((current) => [...current, ...files]);
    setError("");
    event.target.value = "";
  }

  return (
    <main className="shell section">
      <section className="panel onboarding-shell">
        <div className="onboarding-copy">
          <span className="eyebrow">{translate(locale, "profile.eyebrow")}</span>
          <h1>{translate(locale, "profile.title")}</h1>
          <p>{translate(locale, "profile.hero")}</p>
          <div className="onboarding-notes">
            <div className="note-card">
              <strong>{translate(locale, "profile.signalTitle")}</strong>
              <p>{translate(locale, "profile.signalBody")}</p>
            </div>
            <div className="note-card">
              <strong>{translate(locale, "profile.contextTitle")}</strong>
              <p>{translate(locale, "profile.contextBody")}</p>
            </div>
          </div>
        </div>
        <div className="auth-card">
          <h2 style={{ marginTop: 0 }}>{mode === "edit" ? translate(locale, "profile.updateTitle") : translate(locale, "profile.createTitle")}</h2>
          <form onSubmit={handleSubmit}>
            <h3>기본 정보</h3>
            <label className="field">
              <span>{translate(locale, "profile.nationality")}</span>
              <select value={nationality} onChange={(event) => setNationality(event.target.value)} required>
                <option value="KR">{translate(locale, "profile.nationalityKr")}</option>
                <option value="JP">{translate(locale, "profile.nationalityJp")}</option>
              </select>
            </label>
            <label className="field">
              <span>{translate(locale, "profile.gender")}</span>
              <select value={gender} onChange={(event) => setGender(event.target.value)} required>
                <option value="male">{translate(locale, "profile.genderMale")}</option>
                <option value="female">{translate(locale, "profile.genderFemale")}</option>
              </select>
            </label>
            <label className="field">
              <span>{translate(locale, "profile.age")}</span>
              <input type="number" min="18" max="120" value={age} onChange={(event) => handleAgeChange(event.target.value)} required />
            </label>
            <p className="helper">{translate(locale, "profile.ageGroupSaved", { group: ageGroupPreview })}</p>
            <label className="field">
              <span>직업/분야</span>
              <input value={occupation} onChange={(event) => setOccupation(event.target.value)} required />
            </label>
            <label className="field">
              <span>거주 지역</span>
              <input value={location} onChange={(event) => setLocation(event.target.value)} />
            </label>

            <h3>언어 정보</h3>
            <label className="field">
              <span>{translate(locale, "profile.nativeLanguage")}</span>
              <input value={nativeLanguage} onChange={(event) => setNativeLanguage(event.target.value)} required />
            </label>
            <label className="field">
              <span>{translate(locale, "profile.learningLanguage")}</span>
              <input value={learningLanguage} onChange={(event) => setLearningLanguage(event.target.value)} required />
            </label>
            <label className="field">
              <span>언어 수준</span>
              <select value={languageLevel} onChange={(event) => setLanguageLevel(event.target.value)}>
                {languageLevelOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <h3>매칭 목적</h3>
            <label className="field">
              <span>매칭 목적</span>
              <select value={matchPurpose} onChange={(event) => setMatchPurpose(event.target.value)}>
                {matchPurposeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <h3>소개/관심사/사진</h3>
            <label className="field">
              <span>{translate(locale, "profile.bio")}</span>
              <textarea
                rows={5}
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder={translate(locale, "profile.bioPlaceholder")}
                required
              />
            </label>
            <label className="field">
              <span>{translate(locale, "profile.interests")}</span>
              <input
                value={interests}
                onChange={(event) => setInterests(event.target.value)}
                placeholder={translate(locale, "profile.interestsPlaceholder")}
                required
              />
            </label>
            <label className="field">
              <span>{translate(locale, "profile.photo")}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                disabled={photos.length + pendingPhotoFiles.length >= maxProfilePhotos || loading}
              />
            </label>
            <p className="helper">{translate(locale, "profile.photoLimit")}</p>
            {uploading ? <p className="helper">{translate(locale, "profile.uploadingPhoto")}</p> : null}
            {pendingPhotoFiles.length ? (
              <p className="helper">
                {translate(locale, "profile.selectedPhotos")}: {pendingPhotoFiles.map((file) => file.name).join(", ")}
              </p>
            ) : null}
            <ProfilePhotoStrip photos={photos} alt="Profile" />

            <h3>비공개 인증 정보</h3>
            <label className="field">
              <span>전화번호</span>
              <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
            </label>
            <p className="helper">전화번호는 본인 확인 및 안전 관리를 위한 비공개 정보이며, 상대방에게 공개되지 않습니다.</p>
            <div className="actions">
              <button className="button button-primary" type="submit" disabled={loading}>
                {loading ? statusMessage || translate(locale, "profile.savingProfile") : mode === "edit" ? translate(locale, "profile.updateButton") : translate(locale, "profile.createButton")}
              </button>
              <Link className="button button-secondary" href="/dashboard">
                {translate(locale, "profile.back")}
              </Link>
            </div>
          </form>
          {error ? <p className="error">{error}</p> : null}
          {success ? <p className="success">{success}</p> : null}
        </div>
      </section>
    </main>
  );
}
