# API DOCUMENTATION

This document details the RESTful and WebSocket APIs used for AI generation, authentication, and document management in DeciMindAI.

## 11.1 AUTHENTICATION APIS

### POST `/api/auth/session`
Validates a Firebase ID token and creates a server-side session.
- **Request**: `{ "idToken": "firebase_jwt_token" }`
- **Response**: `{ "success": true, "sessionCookie": "...", "user": { "uid": "...", "role": "..." } }`

### POST `/api/auth/update-wallpaper`
Updates the user's chat wallpaper preference in Firebase.
- **Authorization**: Bearer Token
- **Request**: `{ "wallpaper": "base64_image_string" }`

## 11.2 AI GENERATION APIS (Core Features)

### POST `/api/chat`
Processes a user chat message through the appropriate Genkit AI flow.
- **Authorization**: Bearer Token
- **Request**: `{ "message": "[Study: Explain Cloud Computing]", "chatId": "...", "history": [...] }`
- **Response**: `{ "success": true, "response": { "type": "study", "topic": "...", "body": [...] } }`

### POST `/api/generate-ppt`
Generates a structured slide deck from a user's PPT prompt.
- **Request**: `{ "prompt": "Create a 10-slide PPT on Machine Learning" }`
- **Response**: `{ "slides": [ { "title": "...", "bullets": [...], "imageKeyword": "..." }, ... ] }`

### POST `/api/generate-quiz`
Generates a customizable quiz based on a topic and difficulty level.
- **Request**: `{ "topic": "Operating Systems", "difficulty": "medium", "count": 10 }`
- **Response**: `{ "questions": [ { "question": "...", "options": [...], "correctAnswer": "..." } ] }`

## 11.3 DOCUMENT PROCESSING APIS

### POST `/api/ocr`
Extracts text from an uploaded image using the OCR.space API.
- **Authorization**: Bearer Token
- **Request**: `multipart/form-data` with `image` field
- **Response**: `{ "extractedText": "..." }`

### POST `/api/summarize-pdf`
Parses and summarizes an uploaded PDF document using Groq AI.
- **Response**: `{ "summary": "...", "keyPoints": [...] }`

## 11.4 SIGNALING MESSAGES (FIREBASE REALTIME DATABASE)

Session data synchronization occurs over Firebase's WebSocket channel under the `chats/{userId}/{chatId}` path.

### New Message Write
```json
{
  "role": "user",
  "content": "[Study: Explain Cloud Architecture]",
  "timestamp": 1716720000000,
  "mode": "study"
}
```

### AI Response Stored
```json
{
  "role": "assistant",
  "content": "...",
  "isStudyResponse": true,
  "studyData": { "topic": "...", "body": [...], "flowSummary": [...] },
  "timestamp": 1716720002000
}
```

{section break}