"use client";

import { useEffect, useState } from "react";

import { buildAssetUrl } from "../lib/api";

type ProfilePhoto = {
  id: string;
  file_url: string;
};

type ProfilePhotoStripProps = {
  photos: ProfilePhoto[];
  alt?: string;
  className?: string;
};

export default function ProfilePhotoStrip({ photos, alt = "Profile photo", className = "" }: ProfilePhotoStripProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hoverSide, setHoverSide] = useState<"left" | "right">("right");

  useEffect(() => {
    if (!previewUrl) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreviewUrl(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewUrl]);

  if (!photos.length) {
    return null;
  }

  function updateHoverSide(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const previewWidth = 320;
    const gap = 16;
    const rightSpace = window.innerWidth - rect.right;
    setHoverSide(rightSpace < previewWidth + gap && rect.left > rightSpace ? "left" : "right");
  }

  return (
    <>
      <div className={`photo-strip ${className}`.trim()}>
        {photos.slice(0, 3).map((photo, index) => {
          const src = buildAssetUrl(photo.file_url);
          return (
            <button
              className="photo-preview-trigger"
              key={photo.id}
              type="button"
              onClick={() => setPreviewUrl(src)}
              onFocus={(event) => updateHoverSide(event.currentTarget)}
              onMouseEnter={(event) => updateHoverSide(event.currentTarget)}
              aria-label={`${alt} ${index + 1}`}
            >
              <img className="photo-thumb" src={src} alt={`${alt} ${index + 1}`} />
              <span className={`photo-hover-preview photo-hover-preview-${hoverSide}`} aria-hidden="true">
                <img src={src} alt="" />
              </span>
            </button>
          );
        })}
      </div>

      {previewUrl ? (
        <div className="photo-modal" role="dialog" aria-modal="true" onClick={() => setPreviewUrl(null)}>
          <div className="photo-modal-card" onClick={(event) => event.stopPropagation()}>
            <button
              className="photo-modal-close"
              type="button"
              onClick={() => setPreviewUrl(null)}
              aria-label="Close preview"
            >
              &times;
            </button>
            <img src={previewUrl} alt={alt} />
          </div>
        </div>
      ) : null}
    </>
  );
}
