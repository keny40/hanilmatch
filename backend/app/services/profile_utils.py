def calculate_age_group(age: int) -> str:
    if age < 18:
        return "under_18"
    if age <= 24:
        return "18_24"
    if age <= 29:
        return "25_29"
    if age <= 34:
        return "30_34"
    if age <= 39:
        return "35_39"
    if age <= 44:
        return "40_44"
    return "45_plus"
