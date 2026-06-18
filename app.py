import logging
from datetime import datetime
from typing import List, Dict, Generator

import gradio as gr
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import uvicorn

from config import Config
from utils import figures_manager, get_system_prompt, get_example_question, validate_user_input

logging.basicConfig(level=logging.INFO if Config.DEBUG_MODE else logging.WARNING)
logger = logging.getLogger(__name__)

client = OpenAI(base_url=Config.BASE_URL, api_key=Config.NVIDIA_API_KEY)


# ── Helpers ────────────────────────────────────────────────────────────────────

def _display(api_messages: List[Dict]) -> List[Dict]:
    """Strip system message for Chatbot display."""
    return [m for m in api_messages if m["role"] != "system"]


def _error_reply(exc: Exception) -> str:
    msg = str(exc).lower()
    if "rate limit" in msg:
        return "I must pause — the connection is overwhelmed. Please try again shortly."
    if "api key" in msg or "auth" in msg or "401" in msg:
        return "The connection is interrupted. Please check your API key in token.env."
    if "model" in msg:
        return f"The requested model is unavailable. Check DEFAULT_MODEL in token.env."
    return "A disruption has occurred. Please try again."


# ── Core functions ──────────────────────────────────────────────────────────────

def on_figure_select(figure_name: str):
    """Show figure bio when dropdown changes."""
    if not figure_name:
        return gr.update(value="")
    data = figures_manager.get_figure_data(figure_name)
    if not data:
        return gr.update(value="")
    era = data.get("era", "")
    bio = data.get("bio", "")
    return gr.update(value=f"**{figure_name}**  ·  *{era}*\n\n{bio}")


def start_chat(figure_name: str):
    """Initialize conversation state for the selected figure."""
    if not figure_name:
        return [], [], "Select a figure to begin.", ""
    system_prompt = get_system_prompt(figure_name)
    api_messages = [{"role": "system", "content": system_prompt}]
    example = get_example_question(figure_name)
    status = f"Conversation started with **{figure_name}**."
    hint = f"💡 Try asking: *{example}*"
    return api_messages, [], status, hint


def stream_reply(
    figure: str, user_input: str, api_messages: List[Dict]
) -> Generator:
    """Stream a reply from the historical figure."""
    if not figure:
        yield "", _display(api_messages), api_messages, "Select a figure first."
        return
    if not user_input or not user_input.strip():
        yield "", _display(api_messages), api_messages, ""
        return

    is_valid, error = validate_user_input(user_input)
    if not is_valid:
        yield user_input, _display(api_messages), api_messages, f"⚠ {error}"
        return

    # Auto-initialize system prompt if Start Chat was never clicked
    if not api_messages:
        api_messages = [{"role": "system", "content": get_system_prompt(figure)}]

    # Build updated message list
    api_messages = list(api_messages)
    api_messages.append({"role": "user", "content": user_input.strip()})
    api_messages.append({"role": "assistant", "content": ""})
    yield "", _display(api_messages), api_messages, ""

    try:
        stream = client.chat.completions.create(
            model=Config.DEFAULT_MODEL,
            messages=api_messages[:-1],  # exclude empty assistant placeholder
            max_tokens=Config.MAX_TOKENS,
            temperature=Config.TEMPERATURE,
            top_p=Config.TOP_P,
            stream=True,
        )
        for chunk in stream:
            delta = (chunk.choices[0].delta.content or "") if chunk.choices else ""
            if delta:
                api_messages[-1]["content"] += delta
                yield "", _display(api_messages), api_messages, ""

    except Exception as e:
        logger.error(f"Stream error: {e}")
        api_messages[-1]["content"] = _error_reply(e)
        yield "", _display(api_messages), api_messages, "Connection error."


def clear_chat():
    return [], [], "Chat cleared. Select a figure to begin.", ""


def export_chat(api_messages: List[Dict], figure: str):
    """Write conversation to a timestamped text file and return the path."""
    if len(api_messages) <= 1:
        return gr.update(visible=False)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_name = figure.replace(" ", "_").replace("(", "").replace(")", "")
    filename = f"chat_{safe_name}_{timestamp}.txt"

    lines = [
        f"Historical Chatbot — Conversation with {figure}",
        f"Exported: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "=" * 52,
        "",
    ]
    for msg in api_messages[1:]:
        role = "You" if msg["role"] == "user" else figure
        lines.append(f"{role}:")
        lines.append(msg["content"])
        lines.append("-" * 30)
        lines.append("")

    with open(filename, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    return gr.update(visible=True, value=filename)


# ── UI ──────────────────────────────────────────────────────────────────────────

CSS = """
.gradio-container { max-width: 1200px !important; margin: 0 auto !important; }
footer { display: none !important; }
#figure-info { background: var(--block-background-fill); border-radius: 8px; padding: 12px 16px; }
#send-btn { min-width: 90px; }
"""

with gr.Blocks(css=CSS, title="Historical Chatbot") as demo:

    gr.HTML("""
        <div style="text-align:center; padding: 20px 0 8px;">
            <h1 style="margin:0; font-size:2rem;">🏛️ Historical Chatbot</h1>
            <p style="margin:4px 0 0; opacity:.7;">Chat with history's greatest minds — in their own words</p>
        </div>
    """)

    with gr.Row():
        # ── Left panel ──
        with gr.Column(scale=1, min_width=280):
            figure_dropdown = gr.Dropdown(
                label="Historical Figure",
                choices=figures_manager.figure_options,
                interactive=True,
            )
            start_btn = gr.Button("Start Chat", variant="primary")
            figure_info = gr.Markdown(elem_id="figure-info")
            gr.HTML("<hr style='margin:12px 0; opacity:.3;'>")
            hint = gr.Markdown()
            gr.HTML("<hr style='margin:12px 0; opacity:.3;'>")
            clear_btn = gr.Button("Clear Chat", variant="secondary")
            export_btn = gr.Button("Export Chat")
            export_file = gr.File(label="Download", visible=False)

        # ── Right panel ──
        with gr.Column(scale=3):
            chatbot_ui = gr.Chatbot(
                label="Conversation",
                height=520,
                type="messages",
                show_copy_button=True,
            )
            with gr.Row():
                user_input = gr.Textbox(
                    placeholder="Ask your question…",
                    show_label=False,
                    scale=5,
                    container=False,
                )
                send_btn = gr.Button("Send", variant="primary", scale=1, elem_id="send-btn")

    status = gr.Markdown()

    # ── State ──
    history_state = gr.State([])

    # ── Events ──
    figure_dropdown.change(
        fn=on_figure_select,
        inputs=[figure_dropdown],
        outputs=[figure_info],
    )

    start_btn.click(
        fn=start_chat,
        inputs=[figure_dropdown],
        outputs=[history_state, chatbot_ui, status, hint],
    )

    for trigger in [send_btn.click, user_input.submit]:
        trigger(
            fn=stream_reply,
            inputs=[figure_dropdown, user_input, history_state],
            outputs=[user_input, chatbot_ui, history_state, status],
        )

    clear_btn.click(
        fn=clear_chat,
        outputs=[history_state, chatbot_ui, status, hint],
    )

    export_btn.click(
        fn=export_chat,
        inputs=[history_state, figure_dropdown],
        outputs=[export_file],
    )


# ── REST API (for React frontend) ──────────────────────────────────────────────

class ChatRequest(BaseModel):
    figure: str       # exact name, e.g. "Ibn Khaldun"
    message: str
    history: list     # [{role: "user"|"figure", text: "...", ts: number}]


api = FastAPI()
api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@api.post("/chat")
async def chat_endpoint(req: ChatRequest):
    figure_name = req.figure
    # fallback: match by slugified id (e.g. "ibn-khaldun" → "Ibn Khaldun")
    if not figures_manager.figure_exists(figure_name):
        for name in figures_manager.figure_options:
            slug = name.lower().replace(" ", "-").replace("(", "").replace(")", "").replace("/", "-")
            if slug == req.figure.lower():
                figure_name = name
                break

    if not figures_manager.figure_exists(figure_name):
        return {"reply": f"Figure '{req.figure}' not found."}

    messages = [{"role": "system", "content": get_system_prompt(figure_name)}]
    for msg in req.history:
        role = "user" if msg.get("role") == "user" else "assistant"
        text = msg.get("text", "").strip()
        if text:
            messages.append({"role": role, "content": text})
    messages.append({"role": "user", "content": req.message})

    try:
        response = client.chat.completions.create(
            model=Config.DEFAULT_MODEL,
            messages=messages,
            max_tokens=Config.MAX_TOKENS,
            temperature=Config.TEMPERATURE,
            top_p=Config.TOP_P,
            stream=False,
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        logger.error(f"Chat API error: {e}")
        return {"reply": _error_reply(e)}


# Mount Gradio at /gradio, REST API at root
app = gr.mount_gradio_app(api, demo, path="/gradio")

if __name__ == "__main__":
    print(f"Gradio UI  → http://localhost:{Config.PORT}/gradio")
    print(f"Chat API   → http://localhost:{Config.PORT}/chat")
    uvicorn.run(app, host="0.0.0.0", port=Config.PORT, log_level="info" if Config.DEBUG_MODE else "warning")
