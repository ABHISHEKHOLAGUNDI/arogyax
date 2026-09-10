# ArogyaX — Architecture Documentation

## System Overview

ArogyaX is a multilingual, AI-powered patient case-taking system designed for AYUSH
(Ayurveda, Yoga, Unani, Siddha, Homeopathy) outpatient departments.

### Core Principle

> ArogyaX collects, extracts, structures, summarizes, and flags patient information.
> **The physician remains responsible for all clinical assessment.**

## Data Flow

### Patient Intake Flow

```
1. Patient arrives at kiosk/tablet
2. Selects language (English / Hindi)
3. Gives consent for data collection
4. Enters basic demographics
5. Describes chief complaint (text or voice)
6. AI asks adaptive follow-up questions
7. Patient uploads medical documents
8. AI extracts document information
9. Patient reviews all entered information
10. Case is submitted to doctor queue
```

### AI Processing Flow

```
Patient Response
    ↓
Frontend (React)
    ↓ (HTTPS POST)
Cloudflare Worker (Hono)
    ↓ (stores raw response)
D1 Database
    ↓ (sends to AI)
OpenAI API
    ↓ (structured JSON response)
Zod Validation
    ↓ (stores structured case)
D1 Database
    ↓ (returns next question)
Frontend (displays to patient)
```

### Document Processing Flow

```
Document (PDF/Image)
    ↓
Frontend (file upload)
    ↓ (multipart POST)
Cloudflare Worker
    ↓ (stores file)
R2 Object Storage
    ↓ (analyzes document)
OpenAI Vision API
    ↓ (structured extraction)
Zod Validation
    ↓ (stores metadata)
D1 Database
    ↓ (available in)
Doctor Dashboard
```

## Security Architecture

- OpenAI API key stored exclusively in Worker secrets
- Frontend NEVER directly calls OpenAI
- JWT-based authentication for doctor/admin routes
- Input validation via Zod at API boundary
- File validation (MIME type + size limits)
- CORS restricted to known origins
- Audit logging for all mutations

## AI Safety Constraints

The AI system is bound by strict rules:
- MUST NOT diagnose diseases
- MUST NOT prescribe medications
- MUST NOT provide treatment recommendations
- MUST identify red flags only for "doctor review"
- MUST preserve uncertainty (never invent data)
- MUST distinguish patient-reported vs document-extracted data

## Cloudflare Services

| Service | Purpose |
|---------|---------|
| Workers | API backend, AI orchestration |
| D1      | Relational data (patients, visits, cases) |
| R2      | Document/image file storage |
| Pages   | Static frontend hosting (production) |
