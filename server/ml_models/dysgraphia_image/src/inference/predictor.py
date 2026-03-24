import os
from typing import Dict, Tuple

import torch
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from torchvision import transforms

from src.models.model_factory import build_model


IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)


class DysgraphiaImagePredictor:
    def __init__(
        self,
        model_path: str,
        threshold: float = 0.8,
        handwriting_preprocess: bool = False,
    ):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        checkpoint = torch.load(model_path, map_location=self.device)

        self.class_to_idx = checkpoint["class_to_idx"]
        self.idx_to_class = {idx: cls for cls, idx in self.class_to_idx.items()}
        self.image_size = tuple(checkpoint.get("image_size", (224, 224)))
        model_name = checkpoint.get("model_name", "convnextv2_base")

        self.model = build_model(model_name=model_name, num_classes=len(self.class_to_idx))
        self.model.load_state_dict(checkpoint["model_state_dict"])
        self.model.to(self.device)
        self.model.eval()

        self.threshold = threshold
        self.handwriting_preprocess = handwriting_preprocess

        self.transform = transforms.Compose(
            [
                transforms.Resize(self.image_size),
                transforms.ToTensor(),
                transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
            ]
        )

    def _preprocess_handwriting(self, image: Image.Image) -> Image.Image:
        # Enhance stroke contrast while preserving original polarity.
        gray = image.convert("L")
        gray = ImageOps.autocontrast(gray)
        gray = gray.filter(ImageFilter.MedianFilter(size=3))
        gray = ImageEnhance.Contrast(gray).enhance(1.35)
        return gray.convert("RGB")

    def _predict_from_pil(self, image: Image.Image, debug_save_path: str = "") -> Dict[str, float]:
        if self.handwriting_preprocess:
            image = self._preprocess_handwriting(image)

        if debug_save_path:
            os.makedirs(os.path.dirname(debug_save_path), exist_ok=True)
            image.save(debug_save_path)

        tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=1).squeeze(0)

        dysgraphia_idx = self.class_to_idx.get("dysgraphia", 1)
        dysgraphia_probability = float(probs[dysgraphia_idx].item())

        predicted_class = "dysgraphia" if dysgraphia_probability >= self.threshold else "typical"
        risk_label = "at_risk" if predicted_class == "dysgraphia" else "not_at_risk"

        return {
            "predicted_class": predicted_class,
            "dysgraphia_probability": dysgraphia_probability,
            "risk_label": risk_label,
            "threshold": self.threshold,
            "handwriting_preprocess": self.handwriting_preprocess,
            "debug_image_path": debug_save_path or None,
        }

    def predict_image(self, image_path: str, debug_save_path: str = "") -> Dict[str, float]:
        image = Image.open(image_path).convert("RGB")
        return self._predict_from_pil(image, debug_save_path=debug_save_path)

    def predict_from_bytes(self, image_bytes: bytes, debug_save_path: str = "") -> Dict[str, float]:
        from io import BytesIO

        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        return self._predict_from_pil(image, debug_save_path=debug_save_path)
