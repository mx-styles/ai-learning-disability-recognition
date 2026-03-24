import os
from flask import Blueprint, jsonify, request


dysgraphia_image_bp = Blueprint("dysgraphia_image", __name__)

_MODEL_CACHE = {
    "path": None,
    "handwriting_preprocess": None,
    "predictor": None,
}


def _default_model_path() -> str:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(
        base_dir,
        "ml_models",
        "dysgraphia_image",
        "artifacts",
        "exported",
        "dysgraphia_image_model.pt",
    )


def _get_predictor(model_path: str, threshold: float, handwriting_preprocess: bool):
    from ml_models.dysgraphia_image.src.inference.predictor import DysgraphiaImagePredictor

    if (
        _MODEL_CACHE["predictor"] is None
        or _MODEL_CACHE["path"] != model_path
        or _MODEL_CACHE["handwriting_preprocess"] != handwriting_preprocess
    ):
        _MODEL_CACHE["predictor"] = DysgraphiaImagePredictor(
            model_path=model_path,
            threshold=threshold,
            handwriting_preprocess=handwriting_preprocess,
        )
        _MODEL_CACHE["path"] = model_path
        _MODEL_CACHE["handwriting_preprocess"] = handwriting_preprocess
    else:
        _MODEL_CACHE["predictor"].threshold = threshold
    return _MODEL_CACHE["predictor"]


@dysgraphia_image_bp.route("/predict", methods=["POST"])
def predict_dysgraphia_image():
    if "image" not in request.files:
        return jsonify({"error": "Missing image file in multipart form data"}), 400

    image_file = request.files["image"]
    if image_file.filename == "":
        return jsonify({"error": "Empty image filename"}), 400

    try:
        threshold = float(request.form.get("threshold", 0.8))
    except ValueError:
        return jsonify({"error": "Invalid threshold value"}), 400

    handwriting_preprocess = str(request.form.get("handwriting_preprocess", "false")).lower() in {
        "1",
        "true",
        "yes",
        "on",
    }

    model_path = request.form.get("model_path", _default_model_path())

    if not os.path.exists(model_path):
        return jsonify({"error": f"Model file not found: {model_path}"}), 404

    image_bytes = image_file.read()
    predictor = _get_predictor(
        model_path=model_path,
        threshold=threshold,
        handwriting_preprocess=handwriting_preprocess,
    )
    result = predictor.predict_from_bytes(image_bytes)

    return jsonify(
        {
            "task_type": "dysgraphia_image",
            "model_path": model_path,
            "result": result,
        }
    )
