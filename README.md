# Historical Minds

Chat with history's greatest thinkers — Socrates, Cleopatra, Tesla, Rumi, and more — powered by LLaMA 3.1 via the NVIDIA NIM API.

Each figure has a detailed character profile built from their actual works, documented speech patterns, and historical context. The model responds in first person, in character, without breaking the fourth wall.

---

## Stack

**Backend** — Python
- FastAPI — REST `/chat` endpoint consumed by the frontend
- Gradio — secondary UI at `/gradio` for quick testing
- NVIDIA NIM API (LLaMA 3.1 70B) via OpenAI-compatible client

**Frontend** — React + TypeScript
- Vite + Tailwind CSS v4
- shadcn/ui components
- Typewriter streaming effect on responses

---

## Figures

Ibn Khaldun · Socrates · Cleopatra VII · Leonardo da Vinci · Napoleon Bonaparte · Marcus Aurelius · Rumi · Nikola Tesla · Frederick Douglass · Maryam (Mary)

---

## Setup

### Backend

```bash
cd historical-chatbot
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

Copy `token.env` and add your key:
```
NVIDIA_API_KEY=your_key_here
DEFAULT_MODEL=meta/llama-3.1-70b-instruct
MAX_TOKENS=600
TEMPERATURE=0.75
PORT=7860
```

Get a free API key at [build.nvidia.com](https://build.nvidia.com).

```bash
python app.py
```

- REST API → `http://localhost:7860/chat`
- Gradio UI → `http://localhost:7860/gradio`

### Frontend

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Calls the backend at `http://localhost:7860/chat`.

---

## Project Structure

```
├── app.py              # FastAPI + Gradio server
├── config.py           # Environment config
├── utils.py            # Figure manager, system prompt builder
├── figures.json        # Character profiles (descriptions, bios, example questions)
├── requirements.txt
├── src/
│   ├── main.tsx
│   ├── styles.css
│   └── components/
│       ├── historical-minds.tsx   # Main app component
│       └── ui/                    # shadcn components
├── index.html
├── vite.config.ts
└── package.json
```

---

## Adding a Figure

Add an entry to `figures.json`:

```json
"Figure Name": {
  "era": "Time period and region",
  "bio": "2-3 sentence bio shown in the UI",
  "description": "Full character profile for the system prompt — voice, philosophy, speech patterns, sample phrases",
  "example_q": "A question that shows off their character"
}
```

Restart the backend. The figure appears automatically in both interfaces.

---

## License

MIT
