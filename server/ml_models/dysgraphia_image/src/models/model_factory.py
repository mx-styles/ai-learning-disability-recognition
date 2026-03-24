from typing import Optional

import timm
import torch.nn as nn


# Strong baseline for handwriting images using transfer learning.
def build_model(model_name: str = "convnextv2_base", num_classes: int = 2, dropout: Optional[float] = 0.2):
    model = timm.create_model(
        model_name,
        pretrained=True,
        num_classes=num_classes,
        drop_rate=dropout or 0.0,
    )

    # Some models expose reset_classifier for clean replacement.
    if hasattr(model, "reset_classifier"):
        model.reset_classifier(num_classes=num_classes)

    return model
