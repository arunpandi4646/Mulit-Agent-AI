# METHODOLOGY

The development of DeciMindAI followed a rigorous engineering methodology, combining iterative software design with specialized research into AI orchestration, structured JSON generation, and multi-format document synthesis. This section outlines the systematic approach used to build, optimize, and validate the DeciMindAI platform.

## 5.1 SYSTEM WORKFLOW DESCRIPTION

The operational workflow of DeciMindAI is a high-speed loop that ensures minimal "query-to-deliverable" latency. The workflow is divided into three distinct phases: **Session Initialization**, **AI Processing & Interaction**, and **Document Rendering & Synchronization**.

### 5.1.1 Session Initialization (The Handshake)
*   **Authentication**: The user authenticates with Firebase Auth using Google Sign-In or email/password. Firebase issues a JSON Web Token (JWT) which is used for all subsequent API requests. This token is stored in the React session context for session persistence.
*   **Chat Session Creation**: The user opens an existing chat or creates a new session. The system generates a unique `CHAT_ID` in Firebase Realtime Database under the authenticated `USER_ID` node.
*   **Genkit Flow Initialization**: The system initializes the appropriate Genkit Flow based on the user's input mode. All flows share a common Groq LLM configuration with the `llama-3.3-70b-versatile` model.
*   **Context Injection**: Both the user's new message and the last N messages from Firebase are injected as context into the Genkit prompt to maintain conversational continuity.

### 5.1.2 AI Processing & Interaction (The Hot Path)
Once the session is established, the system enters a high-performance AI generation loop:

1.  **Intent Detection Loop**: The system parses the user's message for mode-specific wrappers (`[Study:]`, `[Think:]`, `[PPT:]`, `[Quiz:]`).
2.  **Flow Routing**: The query is routed to the correct Genkit Flow (e.g., `studyFlow`, `thinkFlow`, `pptFlow`).
3.  **Schema Validation**: The Zod schema for the target flow is applied to ensure a perfectly structured JSON output.
4.  **Groq LPU Inference**: The Groq SDK sends the prompt to Llama 3.3 70B on LPU™ hardware, receiving a response at 300+ tokens/sec.
5.  **Rendering**: The structured JSON is parsed and rendered as interactive React components in the chat interface.


## 5.2 STEP-BY-STEP IMPLEMENTATION DETAILS

### 5.2.1 Backend Implementation (Genkit AI Flow)
The server uses a **Genkit Flow-Based Orchestration Hub**. Every incoming AI request is typed with a Zod schema:
```typescript
const studyOutputSchema = z.object({
  topic: z.string(),
  introduction: z.string(),
  body: z.array(z.object({ heading: z.string(), content: z.string() })),
  comparisonTable: z.array(z.object({ aspect: z.string(), valueA: z.string(), valueB: z.string() })).optional(),
  flowSummary: z.array(z.string()),
  conclusion: z.string(),
});
```
The Genkit flow's main handler uses an `ai.generate()` call with strict output schema, ensuring high-throughput structured generation without JSON parsing errors.

### 5.2.2 OCR & PDF Processing Implementation (Next.js API)
We implemented a **Chunked Text Extraction Pipeline** in the Next.js API layer to manage large academic documents.
```typescript
async function processLargePdf(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  const fullText = data.text;
  const chunks = chunkText(fullText, MAX_TOKENS_PER_CHUNK);
  const summaries = await Promise.all(chunks.map(chunk => summarizeChunk(chunk)));
  return summaries.join('\n\n');
}
```
This ensures that large university textbooks and research papers can be processed and summarized without hitting Groq's token per minute (TPM) limits.

### 5.2.3 Next.js State Management Implementation
We used **React Context and Custom Hooks** to handle the authentication and chat state.
```typescript
const useChatSession = (chatId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  useEffect(() => {
    const chatRef = ref(db, `chats/${userId}/${chatId}/messages`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      setMessages(Object.values(snapshot.val() || {}));
    });
    return () => unsubscribe();
  }, [chatId]);
  return { messages };
};
```
This clean separation of logic and UI allows the Chat Interface to reactively show new AI messages, streaming indicators, and error states without complex callback nesting.

## 5.3 NETWORK PROTOCOL & ENCRYPTION DETAILS

### 5.3.1 Custom Genkit Prompt Format
The structured prompt is formatted with a clear academic instruction header followed by the payload.

*   **Mode Header (1 line)**: `[Study:]`, `[Think:]`, `[PPT:]`, or `[Quiz:]` triggers the correct flow.
*   **Context Window (N messages)**: The last 10 messages are injected as conversation history.
*   **Schema Constraint (1 block)**: The Zod output schema is injected as a JSON template for the LLM to follow.

### 5.3.2 Firebase Security Rules Implementation
We use **Firebase Realtime Database Security Rules** which provide **Data-Level Authorization**.

*   **User Isolation**: Each user can only read/write their own chat data under `chats/{userId}/**`, preventing unauthorized cross-user data access.
*   **Session Validation**: For extremely long sessions, Firebase automatically refreshes ID tokens every 1 hour via the secure Firebase Auth channel.

{section break}

## 5.4 TOOLS AND TECHNOLOGIES USED

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **UI Framework** | Next.js 15 | Provides a consistent server-side rendering and App Router architecture across all OSs. |
| **AI Orchestration** | Google Genkit | The flow-based architecture is tuned for structured, schema-validated AI output generation. |
| **AI Inference** | Groq SDK (Llama 3.3) | Allows for zero-latency LPU-accelerated inference at 300+ tokens/sec. |
| **Security** | Firebase Auth | The most secure user authentication service with JWT, OAuth, and MFA support. |
| **Logging** | Next.js Console / Vercel Logs | Structured, high-speed logging for production debugging. |
| **Testing** | Jest / Vitest | Comprehensive unit testing for the AI flow and API logic. |

: System Technology Stack Rationale

{section break}
