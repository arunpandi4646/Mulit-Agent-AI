# APPENDIX {-}

## A. Installation Guide
*   **Frontend**: Requires Node.js 18+. Run `npm install` then `npm run dev` in the project root directory.
*   **AI Server**: Requires Google Genkit CLI. Run `genkit start` to launch the Genkit Developer UI for flow testing.
*   **Environment**: Create `.env.local` with `GROQ_API_KEY`, `OCR_API_KEY`, and all `NEXT_PUBLIC_FIREBASE_*` variables.

## B. Glossary of Terms
*   **JWT**: JSON Web Token (used for secure Firebase authentication).
*   **LPU**: Language Processing Unit (Groq's hardware for sub-second AI inference).
*   **Genkit Flow**: A typed, schema-validated AI pipeline for structured content generation.
*   **Zod Schema**: A TypeScript-first schema definition used to validate and enforce AI JSON output structure.

## C. System Requirements
*   **Client**: Dual-core CPU, 4GB RAM, Any modern browser (Chrome, Edge, Firefox latest).
*   **Development**: Quad-core CPU, 8GB RAM, Node.js 18+, VS Code.
*   **Network**: 5 Mbps download recommended for real-time AI inference and Firebase sync.

{section break}
