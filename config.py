import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent / "token.env")


class Config:
    NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "YOUR_NVIDIA_API_KEY_HERE")
    BASE_URL = "https://integrate.api.nvidia.com/v1"
    DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "meta/llama-3.1-70b-instruct")
    MAX_TOKENS = int(os.getenv("MAX_TOKENS", 600))
    TEMPERATURE = float(os.getenv("TEMPERATURE", 0.75))
    TOP_P = float(os.getenv("TOP_P", 0.95))
    DEBUG_MODE = os.getenv("DEBUG_MODE", "False").strip().lower() == "true"
    PORT = int(os.getenv("PORT", 7860))
    FIGURES_JSON_PATH = "figures.json"
