import os
import random
import shutil
from pathlib import Path
from typing import Dict, List


CLASS_MAP = {
    "PD": "dysgraphia",
    "LPD": "typical",
}


def _list_images(folder: Path) -> List[Path]:
    exts = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    return [p for p in folder.rglob("*") if p.suffix.lower() in exts]


def _ensure_split_dirs(target_root: Path) -> None:
    for split in ["train", "val", "test"]:
        for class_name in CLASS_MAP.values():
            (target_root / split / class_name).mkdir(parents=True, exist_ok=True)


def _copy_files(files: List[Path], destination: Path) -> None:
    destination.mkdir(parents=True, exist_ok=True)
    for src in files:
        dst = destination / src.name
        stem = src.stem
        suffix = src.suffix
        i = 1
        while dst.exists():
            dst = destination / f"{stem}_{i}{suffix}"
            i += 1
        shutil.copy2(src, dst)


def prepare_dataset_splits(
    source_root: str,
    target_root: str,
    train_ratio: float = 0.7,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    seed: int = 42,
) -> Dict[str, int]:
    if abs((train_ratio + val_ratio + test_ratio) - 1.0) > 1e-6:
        raise ValueError("train_ratio + val_ratio + test_ratio must equal 1.0")

    source = Path(source_root)
    target = Path(target_root)

    _ensure_split_dirs(target)
    rng = random.Random(seed)

    summary: Dict[str, int] = {}

    for source_class, target_class in CLASS_MAP.items():
        class_folder = source / source_class
        if not class_folder.exists():
            raise FileNotFoundError(f"Missing source class folder: {class_folder}")

        images = _list_images(class_folder)
        if not images:
            raise ValueError(f"No images found in {class_folder}")

        rng.shuffle(images)

        n_total = len(images)
        n_train = int(n_total * train_ratio)
        n_val = int(n_total * val_ratio)

        train_files = images[:n_train]
        val_files = images[n_train:n_train + n_val]
        test_files = images[n_train + n_val:]

        _copy_files(train_files, target / "train" / target_class)
        _copy_files(val_files, target / "val" / target_class)
        _copy_files(test_files, target / "test" / target_class)

        summary[f"{target_class}_total"] = n_total
        summary[f"{target_class}_train"] = len(train_files)
        summary[f"{target_class}_val"] = len(val_files)
        summary[f"{target_class}_test"] = len(test_files)

    return summary
