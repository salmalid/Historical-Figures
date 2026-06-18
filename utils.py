import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from config import Config

logger = logging.getLogger(__name__)


class HistoricalFiguresManager:
    def __init__(self, filepath: str = None):
        self.filepath = filepath or Config.FIGURES_JSON_PATH
        self._figures_dict: Dict[str, Any] = {}
        self._figure_options: List[str] = []
        self.load_figures()

    def load_figures(self) -> None:
        filepath = Path(self.filepath)
        if not filepath.exists():
            raise FileNotFoundError(f"Figures file not found: {filepath}")

        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        if not isinstance(data, dict):
            raise ValueError("figures.json must be a JSON object (dict)")

        required = {"description", "example_q"}
        for name, figure in data.items():
            missing = required - set(figure.keys())
            if missing:
                raise ValueError(f"Figure '{name}' is missing fields: {missing}")

        self._figures_dict = data
        self._figure_options = list(data.keys())
        logger.info(f"Loaded {len(self._figures_dict)} historical figures")

    @property
    def figures_dict(self) -> Dict[str, Any]:
        return self._figures_dict

    @property
    def figure_options(self) -> List[str]:
        return self._figure_options

    def get_figure_data(self, name: str) -> Optional[Dict[str, Any]]:
        return self._figures_dict.get(name)

    def figure_exists(self, name: str) -> bool:
        return name in self._figures_dict

    def get_system_prompt(self, name: str) -> str:
        if not self.figure_exists(name):
            raise ValueError(f"Figure '{name}' not found. Available: {', '.join(self._figure_options[:5])}...")

        description = self._figures_dict[name]["description"]

        return f"""{description}

---
RULES FOR THIS CONVERSATION:
- Stay completely in character as {name} at all times. Never break character.
- Never acknowledge being an AI or a language model.
- Do not reference events, inventions, or people from after your lifetime.
- If asked about something you could not know, respond as your historical self would: with curiosity, your era's reasoning, or honest limitation.
- Speak in first person as if you are truly alive in your time.
- Keep responses focused and authentic — quality over length."""

    def get_example_question(self, name: str) -> str:
        if not self.figure_exists(name):
            raise ValueError(f"Figure '{name}' not found")
        return self._figures_dict[name]["example_q"]

    def reload_figures(self) -> None:
        self.load_figures()


def validate_user_input(user_input: str) -> Tuple[bool, str]:
    if not user_input or not user_input.strip():
        return False, "Message cannot be empty."
    if len(user_input) > 1000:
        return False, "Message too long (max 1000 characters)."
    return True, ""


# Global manager — initialized once at import
try:
    figures_manager = HistoricalFiguresManager()
    get_system_prompt = figures_manager.get_system_prompt
    get_example_question = figures_manager.get_example_question
except Exception as e:
    logger.error(f"Failed to initialize figures manager: {e}")
    raise
