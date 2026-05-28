# SECURITY AND NETWORK ARCHITECTURE

An AI-powered academic platform is a high-value target for attackers. DeciMindAI implements a multi-layered security model to ensure the confidentiality, integrity, and availability of every user session and academic data asset.

## 7.1 END-TO-END ENCRYPTION (E2EE)

DeciMindAI uses **Firebase Security Rules** and **TLS 1.3 encryption** for all real-time data in transit.

### 7.1.1 Key Handshake
1.  **Initial Secure Channel**: The Firebase Realtime Database connection is protected by **TLS 1.3** on the WebSocket transport layer.
2.  **Secret Generation**: Firebase Auth generates a cryptographically secure ID Token (JWT) upon user login using RS256 asymmetric key signing.
3.  **Encrypted Exchange**: These tokens are transmitted over the TLS-protected Firebase connection and validated server-side before any data read/write is permitted.
4.  **Zero-Knowledge Relay**: Since the Groq API only sees the structured prompt payload, and user personal data is stored only in Firebase under the user's own node, the AI inference server itself cannot access the user's identity.

### 7.1.2 The Firebase Security Advantage
We chose Firebase Security Rules because they provide **Data-Level Authorization**.

*   **Tamper Detection**: If a malicious actor tries to modify a single field of a Firebase database record (e.g., changing a user's role from "student" to "administrator"), the security rules will reject the write and log the violation automatically.
*   **Performance**: Firebase Security Rules are evaluated server-side on Google's infrastructure, allowing us to validate thousands of concurrent data access requests in under 1ms without additional latency for the end user.

{section break}

## 7.2 NETWORK RESILIENCE STRATEGIES

The Groq API is "rate-limited" by design. DeciMindAI adds a custom token management layer.

### 7.2.1 Negative Acknowledgments (Context Truncation)
Instead of sending the full conversation history for every request (which exceeds the token limit), the system only sends the last N messages as context if the conversation grows beyond a threshold.

*   *Example*: User has 50 messages in a chat session. The system sends only the last 10 messages as context for the next Groq inference call.
*   *Result*: This minimizes token usage while ensuring that the most recent academic context is always preserved.

### 7.2.2 Adaptive Token Limit Control (ATC)
The system continuously monitors the **token count per API request**.
*   If token count > 7,000, the system increases the context truncation window (sending fewer historical messages).
*   If the PDF content > 5,000 tokens, the system activates the chunked summarization pipeline to split content across multiple Groq inference calls.

## 7.3 AUTHENTICATION AND AUTHORIZATION (RBAC)

The Firebase Auth service implements a robust **Role-Based Access Control (RBAC)** model.

### 7.3.1 Firebase JWT Claims
The Firebase ID Token issued at login contains specific custom claims:
```json
{
  "sub": "user_firebase_uid",
  "role": "educator",
  "exp": 1672531200,
  "perms": ["access_quiz_builder", "manage_sessions"]
}
```
The Next.js API routes check these claims for every protected request. For example, a user without the `manage_sessions` permission cannot access the `/api/admin/sessions` endpoint.

{section break}

### 7.3.2 Firebase Database Security
The Firebase database uses a validated security rules schema for all queries to prevent **Unauthorized Data Access**. Sensitive fields like API keys are never stored in the client-side code; they are injected at build time via `.env.local` variables and only exposed to server-side Next.js API routes.

## 7.4 FIREWALL AND NAT TRAVERSAL

DeciMindAI's cloud infrastructure must work through various network environments.

### 7.4.1 Vercel Edge Network Integration
*   **CDN Distribution**: All static Next.js assets are served through Vercel's global CDN, ensuring < 50ms Time-to-First-Byte (TTFB) for users worldwide.
*   **Edge Functions**: When a direct serverless function is too slow, DeciMindAI can fall back to Vercel Edge Runtime for instant global execution.

### 7.4.2 Port 443 HTTPS Fallback
In some environments, all non-standard port traffic is blocked. DeciMindAI routes all API traffic exclusively over HTTPS (TCP Port 443) to ensure 100% network compatibility in corporate and educational institution networks.

{section break}
