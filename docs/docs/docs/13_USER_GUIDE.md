# USER GUIDE

Welcome to DeciMindAI. This guide will help you navigate the features of your high-performance AI-powered academic study and productivity platform.

## 13.1 GETTING STARTED

1.  **Login**: Sign in using your Google account or email/password credentials via Firebase Auth.
2.  **Create a Chat**: Click "New Chat" to start a fresh academic session. Your chat history is automatically saved to the cloud.
3.  **Select a Mode**: Choose your AI interaction mode by using the appropriate prompt wrapper, or let the system auto-detect your intent.

## 13.2 AI MODE CONTROLS

Once logged in, use the prompt wrappers in the chat input to access advanced AI features:

*   **Study Mode**: Wrap your prompt like `[Study: Explain Cloud Computing Architecture]` to receive a fully structured "13-mark" academic answer with Introduction, numbered sections, Comparison Table, Flow Summary, and Conclusion.
*   **Think Mode**: Wrap your prompt like `[Think: How do Neural Networks learn?]` to trigger a deep, step-by-step chain-of-thought reasoning response. Ideal for system design and mathematical analysis.
*   **PPT Generation**: 
    *   Use the **PPT Mode** tab or wrap like `[PPT: Create a 10-slide deck on AI]`.
    *   Review slides in the live **Embla Carousel** preview.
    *   Click "Download PPTX" to export a fully editable PowerPoint file.
*   **Quiz Mode**: 
    *   Wrap like `[Quiz: Generate 10 medium questions on Operating Systems]`.
    *   The quiz engine will display MCQ questions with a live score tracker.
    *   View your final score with a **Recharts** visual breakdown by category.

## 13.3 ADVANCED SETTINGS

Access the Settings menu (Gear icon on the home screen) to customize your study experience.

### 13.3.1 Appearance
*   **Chat Wallpaper**: Upload a custom background image to personalize your study workspace.
*   **Theme**: Toggle between Light, Dark, or System-default themes for comfortable long-study sessions.

### 13.3.2 Document Hub
*   **OCR Upload**: Upload a photo of handwritten notes or a textbook page. The system extracts text and optionally generates study questions from the content.
*   **PDF Summarizer**: Upload a large PDF (e.g., a 100-page textbook chapter). The system summarizes key sections and generates study points.

### 13.3.3 Administrator Tools (Admin/Educator Only)
*   **Session Management**: View and manage all active student sessions and chat histories.
*   **Feature Matrix**: Control which users have access to advanced PPT generation or Quiz Builder features.
*   **Export Sessions**: Use the "Export History" button to download a full session summary as a structured PDF report.
*   **Update Catalog**: Manage the feature availability settings for different user tiers across the institution.

## 13.4 TROUBLESHOOTING

*   **Slow Response**: Try breaking your query into smaller parts or ensure you are on a high-speed Wi-Fi or wired connection to reduce Groq API latency.
*   **Permission Denied**: Contact your administrator to ensure your account has been assigned the correct role in the "Permission Matrix" for advanced features.
*   **PPT Export Failed**: Ensure your browser supports the File System Access API (Chrome v86+ or Edge v86+) if the download dialog does not appear automatically.

{section break}