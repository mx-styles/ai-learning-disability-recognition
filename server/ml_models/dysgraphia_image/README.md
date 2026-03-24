# Dysgraphia Image Model Workspace

This workspace contains a complete training and inference pipeline for handwriting-image dysgraphia classification.

## Dataset In Project

The dataset has been copied to:

- `data/raw/source_dataset/PD`
- `data/raw/source_dataset/LPD`
- `data/raw/source_dataset/image_sentences.csv`

The split-preparation script maps classes as:

- `PD -> dysgraphia`
- `LPD -> typical`

## Structure

- `configs/` - experiment settings (model/data/training)
- `data/raw/` - source + split images (`train`, `val`, `test`)
- `data/processed/` - optional normalized/preprocessed outputs
- `src/data/` - split and dataloader code
- `src/models/` - model factory (`timm` transfer learning)
- `src/training/` - training/evaluation logic
- `src/inference/` - inference predictor
- `src/utils/` - config helper
- `artifacts/checkpoints/` - best checkpoints during training
- `artifacts/exported/` - exported deployable model
- `artifacts/reports/` - training history + test metrics
- `scripts/` - command-line entry points

## Recommended Model

Current default uses `convnextv2_base.fcmae_ft_in22k_in1k` transfer learning, a high-performing modern image backbone for strong baseline accuracy on handwriting images.

## Install (Server Environment)

From `server/`:

```bash
pip install -r ml_models/dysgraphia_image/requirements_dysgraphia_image.txt
```

## Train

From `server/ml_models/dysgraphia_image/`:

```bash
python scripts/train_dysgraphia_image.py --prepare-splits
```

This will:

1. Create `train/val/test` splits from `source_dataset`
2. Train the model
3. Save best checkpoint to `artifacts/checkpoints/`
4. Export model to `artifacts/exported/dysgraphia_image_model.pt`
5. Save reports to `artifacts/reports/`

## Inference (CLI)

```bash
python scripts/predict_dysgraphia_image.py --image <path_to_image>
```

## Inference (API)

Endpoint:

- `POST /api/dysgraphia-image/predict`

Form fields:

- `image` (required, file)
- `threshold` (optional, default `0.5`)
- `model_path` (optional, defaults to exported model path)
