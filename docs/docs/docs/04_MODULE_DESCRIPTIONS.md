# MODULE DESCRIPTIONS

The DeciMindAI system is divided into several logical modules, each responsible for a specific domain of the application's functionality. This modular approach ensures maintainability and allows for parallel development.

## 4.1 FRONT END MODULES (NEXT.JS)

### 4.1.1 Authentication & Session Module
Handles user login, token persistence, and session lifecycle management.

*   **Key Files**: `use-auth.ts`, `firebase.ts`, `layout.tsx`.
*   **Responsibility**: Validating credentials against Firebase Auth, storing session tokens securely in browser context, and managing the `UserSession` state across all pages.

### 4.1.2 Chat & AI Interaction Module
Manages the real-time AI communication channel with the Genkit backend.

*   **Key Files**: `chat-flow.ts`, `ChatInterface.tsx`, `MessageBubble.tsx`.
*   **Responsibility**: Sending structured prompts to Genkit Flows, receiving streamed AI responses, rendering academic markdown with tables and headings, and managing the chat history state.

### 4.1.3 PPT Generator Module
The core UI for interactive presentation creation.

*   **Responsibility**: Rendering the live slide carousel preview, capturing user PPT prompt inputs, triggering Genkit-based slide data generation, and exporting the final `.pptx` file using PptxGenJS.

### 4.1.4 Settings & Administration Module
Provides a comprehensive interface for system configuration.

*   **Key Files**: `settings/page.tsx`, `use-auth.ts`.
*   **Responsibility**: Managing account preferences, theme/wallpaper settings, AI mode preferences, and user profile management.
*   **Access Control**: Enforcing role-based access control (RBAC) to restrict administrative settings and visibility based on the user's Firebase Auth role.


### 4.1.5 Document & OCR Hub Module
Dedicated logic for multimodal document input and academic export.

*   **Key Files**: `api/ocr/route.ts`, `api/summarize-pdf/route.ts`.
*   **Responsibility**: Handling image and PDF uploads, calling OCR.space API for text extraction, chunking content for AI summarization, and providing UI feedback for processing progress and completion.

## 4.2 BACK END MODULES (GENKIT / NEXT.JS API)

### 4.2.1 AI Flow Orchestration Hub
The central broker for all AI generation tasks.


*   **Responsibility**: Routing user queries between the Study Flow, Think Flow, PPT Flow, and Quiz Flow based on intent-parsed prompt wrappers (e.g., `[Study:]`, `[Think:]`).

### 4.2.2 Identity & Access Management (IAM)
The gatekeeper of the system.

*   **Responsibility**: Managing Firebase Auth tokens, validating user sessions, and enforcing role-based permissions (RBAC) for advanced feature access.

### 4.2.3 Document Generation API
Endpoints for academic asset synthesis.

*   **Responsibility**: Providing routes for PPT generation, quiz creation, PDF export, and DOCX synthesis from Genkit-produced structured JSON.

### 4.2.4 OCR & PDF Processing Module
A high-performance text extraction pipeline.

*   **Responsibility**: Bypassing the limitations of text-only AI by converting visual academic materials into machine-readable text for downstream AI summarization and query generation.


{section break}