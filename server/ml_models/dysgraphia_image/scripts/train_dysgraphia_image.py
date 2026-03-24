import argparse
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from src.data.prepare_splits import prepare_dataset_splits
from src.training.trainer import DysgraphiaImageTrainer, TrainConfig
from src.utils.config import load_config


def main():
    parser = argparse.ArgumentParser(description="Train dysgraphia image classifier")
    parser.add_argument(
        "--config",
        default=os.path.join(PROJECT_ROOT, "configs", "baseline.yaml"),
        help="Path to YAML config",
    )
    parser.add_argument(
        "--prepare-splits",
        action="store_true",
        help="Prepare train/val/test splits from source_dataset before training",
    )
    args = parser.parse_args()

    cfg = load_config(args.config)

    raw_root = cfg["data"]["raw_root"]
    source_root = os.path.join(raw_root, "source_dataset")

    if args.prepare_splits:
        summary = prepare_dataset_splits(
            source_root=source_root,
            target_root=raw_root,
            train_ratio=0.7,
            val_ratio=0.15,
            test_ratio=0.15,
            seed=cfg["experiment"].get("seed", 42),
        )
        print("Prepared dataset splits:")
        for key, value in summary.items():
            print(f"  {key}: {value}")

    trainer = DysgraphiaImageTrainer(
        TrainConfig(
            raw_root=raw_root,
            image_size=tuple(cfg["data"].get("image_size", [224, 224])),
            batch_size=int(cfg["data"].get("batch_size", 16)),
            epochs=int(cfg["training"].get("epochs", 12)),
            learning_rate=float(cfg["training"].get("learning_rate", 1e-4)),
            weight_decay=float(cfg["training"].get("weight_decay", 1e-4)),
            model_name=cfg["model"].get("architecture", "convnextv2_base.fcmae_ft_in22k_in1k"),
            num_classes=int(cfg["model"].get("num_classes", 2)),
            threshold=float(cfg["inference"].get("threshold", 0.5)),
            checkpoint_dir=cfg["artifacts"]["checkpoints"],
            export_dir=cfg["artifacts"]["exported"],
            report_dir=cfg["artifacts"]["reports"],
        )
    )

    results = trainer.train()
    print("Training complete.")
    for key, value in results.items():
        print(f"  {key}: {value}")


if __name__ == "__main__":
    main()
