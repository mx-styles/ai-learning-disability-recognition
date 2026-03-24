import json
import os
from dataclasses import dataclass
from typing import Dict, Tuple

import torch
import torch.nn as nn
from sklearn.metrics import classification_report, confusion_matrix, f1_score

from src.data.dataset import build_dataloaders
from src.models.model_factory import build_model


@dataclass
class TrainConfig:
    raw_root: str
    image_size: Tuple[int, int] = (224, 224)
    batch_size: int = 16
    epochs: int = 12
    learning_rate: float = 1e-4
    weight_decay: float = 1e-4
    model_name: str = "convnextv2_base"
    num_classes: int = 2
    threshold: float = 0.5
    checkpoint_dir: str = "artifacts/checkpoints"
    export_dir: str = "artifacts/exported"
    report_dir: str = "artifacts/reports"


class DysgraphiaImageTrainer:
    def __init__(self, cfg: TrainConfig):
        self.cfg = cfg
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        self.train_loader, self.val_loader, self.test_loader, self.class_to_idx = build_dataloaders(
            raw_root=cfg.raw_root,
            image_size=cfg.image_size,
            batch_size=cfg.batch_size,
            num_workers=2,
        )

        self.idx_to_class = {idx: name for name, idx in self.class_to_idx.items()}

        self.model = build_model(model_name=cfg.model_name, num_classes=cfg.num_classes).to(self.device)
        self.loss_fn = nn.CrossEntropyLoss()
        self.optimizer = torch.optim.AdamW(
            self.model.parameters(), lr=cfg.learning_rate, weight_decay=cfg.weight_decay
        )
        self.scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(self.optimizer, T_max=cfg.epochs)

    def _run_epoch(self, train: bool) -> Dict[str, float]:
        loader = self.train_loader if train else self.val_loader
        self.model.train(train)

        total_loss = 0.0
        all_labels = []
        all_preds = []

        for images, labels in loader:
            images = images.to(self.device)
            labels = labels.to(self.device)

            with torch.set_grad_enabled(train):
                logits = self.model(images)
                loss = self.loss_fn(logits, labels)

                if train:
                    self.optimizer.zero_grad()
                    loss.backward()
                    torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
                    self.optimizer.step()

            total_loss += loss.item() * images.size(0)
            preds = torch.argmax(logits, dim=1)

            all_labels.extend(labels.detach().cpu().numpy().tolist())
            all_preds.extend(preds.detach().cpu().numpy().tolist())

        avg_loss = total_loss / len(loader.dataset)
        f1 = f1_score(all_labels, all_preds, average="macro")
        acc = (torch.tensor(all_labels) == torch.tensor(all_preds)).float().mean().item()

        return {
            "loss": float(avg_loss),
            "f1_macro": float(f1),
            "accuracy": float(acc),
        }

    def train(self) -> Dict[str, float]:
        os.makedirs(self.cfg.checkpoint_dir, exist_ok=True)
        os.makedirs(self.cfg.export_dir, exist_ok=True)

        best_val_f1 = -1.0
        best_checkpoint_path = os.path.join(self.cfg.checkpoint_dir, "best_convnextv2_dysgraphia.pt")

        history = []

        for epoch in range(1, self.cfg.epochs + 1):
            train_metrics = self._run_epoch(train=True)
            val_metrics = self._run_epoch(train=False)
            self.scheduler.step()

            epoch_row = {
                "epoch": epoch,
                "train": train_metrics,
                "val": val_metrics,
            }
            history.append(epoch_row)

            if val_metrics["f1_macro"] > best_val_f1:
                best_val_f1 = val_metrics["f1_macro"]
                torch.save(
                    {
                        "model_state_dict": self.model.state_dict(),
                        "class_to_idx": self.class_to_idx,
                        "model_name": self.cfg.model_name,
                        "image_size": self.cfg.image_size,
                    },
                    best_checkpoint_path,
                )

            print(
                f"Epoch {epoch}/{self.cfg.epochs} | "
                f"train_loss={train_metrics['loss']:.4f}, train_f1={train_metrics['f1_macro']:.4f} | "
                f"val_loss={val_metrics['loss']:.4f}, val_f1={val_metrics['f1_macro']:.4f}"
            )

        with open(os.path.join(self.cfg.report_dir, "train_history.json"), "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2)

        self._load_checkpoint(best_checkpoint_path)
        test_metrics = self.evaluate_test_set()

        exported_path = os.path.join(self.cfg.export_dir, "dysgraphia_image_model.pt")
        torch.save(
            {
                "model_state_dict": self.model.state_dict(),
                "class_to_idx": self.class_to_idx,
                "model_name": self.cfg.model_name,
                "image_size": self.cfg.image_size,
            },
            exported_path,
        )

        return {
            "best_val_f1": float(best_val_f1),
            **test_metrics,
            "best_checkpoint": best_checkpoint_path,
            "exported_model": exported_path,
        }

    def _load_checkpoint(self, checkpoint_path: str) -> None:
        state = torch.load(checkpoint_path, map_location=self.device)
        self.model.load_state_dict(state["model_state_dict"])

    def evaluate_test_set(self) -> Dict[str, float]:
        self.model.eval()
        all_labels = []
        all_preds = []

        with torch.no_grad():
            for images, labels in self.test_loader:
                images = images.to(self.device)
                labels = labels.to(self.device)
                logits = self.model(images)
                preds = torch.argmax(logits, dim=1)

                all_labels.extend(labels.detach().cpu().numpy().tolist())
                all_preds.extend(preds.detach().cpu().numpy().tolist())

        report = classification_report(
            all_labels,
            all_preds,
            target_names=[self.idx_to_class[i] for i in sorted(self.idx_to_class.keys())],
            output_dict=True,
            zero_division=0,
        )
        conf = confusion_matrix(all_labels, all_preds).tolist()

        os.makedirs(self.cfg.report_dir, exist_ok=True)
        with open(os.path.join(self.cfg.report_dir, "test_classification_report.json"), "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)
        with open(os.path.join(self.cfg.report_dir, "test_confusion_matrix.json"), "w", encoding="utf-8") as f:
            json.dump(conf, f, indent=2)

        return {
            "test_accuracy": float(report["accuracy"]),
            "test_f1_macro": float(report["macro avg"]["f1-score"]),
        }
