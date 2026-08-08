---
name: Awaz Khata product spec constraints
description: Hackathon product-spec direction for the voice ledger — storage rule and spoken-confirmation wording
---
- Ledger storage must stay a JSON file: the user's product spec explicitly forbids introducing a database. Do not propose or implement a Postgres migration.
- Spoken save confirmations are conversational per spec: «جی، میں نے سن لیا اور … کھاتے میں ڈال دیے ہیں», built server-side ONLY after the save succeeds — never wording that implies success before the backend confirms.
- The spec also calls for an immediate client-side spoken acknowledgement («جی، میں نے سن لیا۔») right after recording stops; if that gets implemented in the mobile app, split the ack prefix out of the backend templates to avoid the user hearing "میں نے سن لیا" twice.

**Why:** The user uploaded a full product spec (attached_assets/Pasted--UPDATE-EXISTING-PROJECT-Awaz-Khata-*.txt) that is the authoritative direction for the hackathon demo; it overrode an earlier "کامیابی سے محفوظ" confirmation style and vetoed a planned database migration.

**How to apply:** Read that spec file before changing backend storage, voice-flow wording, or the mobile voice pipeline.
