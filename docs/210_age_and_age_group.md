# Age And Age Group

## Current rule

- `age` is stored as the real numeric age
- `age_group` is stored automatically from `age`

## Mapping

- `18_24`
- `25_29`
- `30_34`
- `35_39`
- `40_44`
- `45_plus`

## Where it is used

- DB schema: `profiles.age`, `profiles.age_group`
- backend save/update logic auto-calculates `age_group`
- frontend onboarding shows an age-group preview
- dashboard and profile detail show both age and age group
