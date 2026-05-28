import os

DEFAULT_MODEL = "qwen/qwen3-coder:free"


def _resolve_model() -> str:
    return (os.getenv("LLM_MODEL") or DEFAULT_MODEL).strip()


class LLMClient:
    """OpenRouter-compatible LLM client (OpenAI SDK)."""

    def __init__(self):
        self.offline_mode = os.environ.get("OFFLINE_MODE", "").strip().lower() in (
            "1",
            "true",
            "yes",
        )
        self.api_key = os.environ.get("OPENROUTER_API_KEY", "").strip()
        self.base_url = os.environ.get(
            "OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"
        ).strip()
        self.model = _resolve_model()
        self._client = None

        if not self.offline_mode and self.api_key:
            try:
                from openai import OpenAI  # lazy import so offline mode works without openai
            except Exception as e:
                raise RuntimeError(
                    "Python package 'openai' is not installed. Run: pip install -r backend/requirements.txt"
                ) from e

            self._client = OpenAI(api_key=self.api_key, base_url=self.base_url)

    @property
    def is_ready(self) -> bool:
        return self.offline_mode or self._client is not None

    def query(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> str:
        model = _resolve_model()

        if self.offline_mode:
            return (
                f"[Offline mode] Processed request locally.\n\n"
                f"System: {system_prompt[:120]}...\n"
                f"User: {user_prompt[:500]}"
            )

        if not self._client:
            raise RuntimeError(
                "OPENROUTER_API_KEY is not set. Add it to backend/.env"
            )

        print("Using model:", os.getenv("LLM_MODEL"), flush=True)

        completion = self._client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        content = completion.choices[0].message.content or ""
        print("[✓] AI response completed", flush=True)
        return content


def get_completion(prompt: str) -> str:
    client = LLMClient()
    return client.query("You are a helpful assistant.", prompt)


def get_completion_with_system(prompt: str, system_prompt: str) -> str:
    client = LLMClient()
    return client.query(system_prompt, prompt)
