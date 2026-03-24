import argparse
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from src.inference.predictor import DysgraphiaImagePredictor


def main():
    parser = argparse.ArgumentParser(description="Run dysgraphia image inference")
    parser.add_argument("--image", required=True, help="Path to handwriting image")
    parser.add_argument(
        "--model",
        default=os.path.join(PROJECT_ROOT, "artifacts", "exported", "dysgraphia_image_model.pt"),
        help="Path to trained model checkpoint",
    )
    parser.add_argument("--threshold", default=0.8, type=float)
    parser.add_argument(
        "--handwriting-preprocess",
        action="store_true",
        help="Apply handwriting-specific preprocessing before inference",
    )
    parser.add_argument(
        "--debug-save-preprocessed",
        default="",
        help="Optional output path to save the image after preprocessing and before tensor transform",
    )
    args = parser.parse_args()

    predictor = DysgraphiaImagePredictor(
        model_path=args.model,
        threshold=args.threshold,
        handwriting_preprocess=args.handwriting_preprocess,
    )
    result = predictor.predict_image(args.image, debug_save_path=args.debug_save_preprocessed)

    print("Prediction:")
    for key, value in result.items():
        print(f"  {key}: {value}")


if __name__ == "__main__":
    main()
