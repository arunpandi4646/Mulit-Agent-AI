# NeuroCode Backend — OpenRouter

This backend uses [OpenRouter](https://openrouter.ai/) for multi-agent AI code generation.

## Setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Set your OpenRouter API key and model:

```env
OPENROUTER_API_KEY=your_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=qwen/qwen3-coder:free
LLM_PROVIDER=openrouter
OFFLINE_MODE=false
```

3. Start the API:

```powershell
cd backend
python main.py
```

Or from the project root: `npm start`

## Test OpenRouter

```powershell
cd backend
python test_openrouter.py
```

## Offline mode

Set `OFFLINE_MODE=true` in `.env` to run without cloud inference (stub responses).
