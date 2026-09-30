# NEXORA Country-Aware Phone Input Update

## Registration behavior
- User selects an African country.
- NEXORA displays that country's dialing code as a fixed prefix (for example `+254` for Kenya).
- User enters only the national/mobile digits.
- The browser strips spaces, punctuation and leading zeroes from the national part.
- The full international number is assembled before submission.
- The server normalizes the number and stores it without the leading `+` (for example `254712345678`).
- The server validates the selected country against the phone country code and rejects mismatches.
- Kenya keeps the existing strict mobile format (`7xxxxxxxx` or `1xxxxxxxx` after +254).
- Other currently listed African countries use a conservative 6–12 national-digit validation and E.164 maximum length.

## Why this is preferable
1. Users do not have to know or type country dialing codes.
2. A user cannot accidentally submit `+254` twice.
3. Country selection and phone country are checked server-side.
4. The stored phone format is consistent for duplicate detection and payment routing.
5. Kenya payment routing remains Co-op Paybill; other countries remain disabled until their payment method is activated.

## Example
Kenya selected -> prefix `+254` -> user enters `712345678` -> stored as `254712345678`.
Ghana selected -> prefix `+233` -> user enters the national digits -> stored as `233...`.


## Important Render deployment note
The browser frontend and API are deployed separately. If the frontend shows the country selector but registration still returns an old message such as `Invalid Kenyan phone number`, the live API is running an older server build. Redeploy the `server` code from this ZIP to the NEXORA API service. The updated API exposes `/api/version` and returns `countryAwareRegistration: true` so the frontend/backend versions can be checked.
