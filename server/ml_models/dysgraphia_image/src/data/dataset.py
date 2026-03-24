from typing import Tuple

from torchvision import datasets, transforms
from torch.utils.data import DataLoader


IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)


def build_transforms(image_size: Tuple[int, int], training: bool):
    if training:
        return transforms.Compose(
            [
                transforms.Resize((image_size[0] + 24, image_size[1] + 24)),
                transforms.RandomResizedCrop(image_size, scale=(0.75, 1.0)),
                transforms.RandomHorizontalFlip(p=0.3),
                transforms.RandomRotation(degrees=6),
                transforms.ColorJitter(brightness=0.15, contrast=0.15),
                transforms.ToTensor(),
                transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
            ]
        )

    return transforms.Compose(
        [
            transforms.Resize(image_size),
            transforms.ToTensor(),
            transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
        ]
    )


def build_dataloaders(raw_root: str, image_size=(224, 224), batch_size: int = 16, num_workers: int = 2):
    train_dataset = datasets.ImageFolder(
        root=f"{raw_root}/train",
        transform=build_transforms(image_size, training=True),
    )
    val_dataset = datasets.ImageFolder(
        root=f"{raw_root}/val",
        transform=build_transforms(image_size, training=False),
    )
    test_dataset = datasets.ImageFolder(
        root=f"{raw_root}/test",
        transform=build_transforms(image_size, training=False),
    )

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=num_workers)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=num_workers)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=num_workers)

    return train_loader, val_loader, test_loader, train_dataset.class_to_idx
