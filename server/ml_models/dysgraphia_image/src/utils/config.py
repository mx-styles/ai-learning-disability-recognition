import os
from typing import Any, Dict

import yaml


def load_config(config_path: str) -> Dict[str, Any]:
    with open(config_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

    data_cfg = config.setdefault("data", {})
    raw_root = data_cfg.get("raw_root", "data/raw")
    processed_root = data_cfg.get("processed_root", "data/processed")

    if not os.path.isabs(raw_root):
        data_cfg["raw_root"] = os.path.normpath(os.path.join(root, raw_root))
    if not os.path.isabs(processed_root):
        data_cfg["processed_root"] = os.path.normpath(os.path.join(root, processed_root))

    artifacts = config.setdefault("artifacts", {})
    for key, default_path in {
        "checkpoints": "artifacts/checkpoints",
        "exported": "artifacts/exported",
        "reports": "artifacts/reports",
    }.items():
        value = artifacts.get(key, default_path)
        if not os.path.isabs(value):
            value = os.path.normpath(os.path.join(root, value))
        artifacts[key] = value
        os.makedirs(value, exist_ok=True)

    return config
