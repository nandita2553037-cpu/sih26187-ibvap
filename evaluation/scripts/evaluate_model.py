from pathlib import Path
import csv
import cv2
from ultralytics import YOLO

ROOT = Path(__file__).resolve().parents[2]
IMAGE_DIR = ROOT / 'evaluation' / 'project_data' / 'images'
LABEL_DIR = ROOT / 'evaluation' / 'project_data' / 'labels'
RESULT_DIR = ROOT / 'evaluation' / 'results'
RESULT_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = ROOT / 'yolov8n.pt'
CONFIDENCE_VALUES = [0.25, 0.40, 0.50, 0.60, 0.70]
IOU_MATCH = 0.50
CLASS_IDS = {0, 1, 2, 3, 5, 7}


def read_labels(label_path):
    items = []
    if not label_path.exists():
        return items
    for line in label_path.read_text(encoding='utf-8').splitlines():
        parts = line.strip().split()
        if len(parts) != 5:
            continue
        cls, cx, cy, w, h = map(float, parts)
        items.append((int(cls), cx, cy, w, h))
    return items


def yolo_to_xyxy(item, width, height):
    cls, cx, cy, w, h = item
    x1 = (cx - w / 2) * width
    y1 = (cy - h / 2) * height
    x2 = (cx + w / 2) * width
    y2 = (cy + h / 2) * height
    return cls, x1, y1, x2, y2


def iou(a, b):
    _, ax1, ay1, ax2, ay2 = a
    _, bx1, by1, bx2, by2 = b
    ix1, iy1 = max(ax1, bx1), max(ay1, by1)
    ix2, iy2 = min(ax2, bx2), min(ay2, by2)
    iw, ih = max(0.0, ix2 - ix1), max(0.0, iy2 - iy1)
    inter = iw * ih
    area_a = max(0.0, ax2 - ax1) * max(0.0, ay2 - ay1)
    area_b = max(0.0, bx2 - bx1) * max(0.0, by2 - by1)
    union = area_a + area_b - inter
    return inter / union if union > 0 else 0.0


def main():
    image_paths = sorted(IMAGE_DIR.glob('*.jpg'))
    if not image_paths:
        raise SystemExit(f'No JPG images found in {IMAGE_DIR}')
    model = YOLO(str(MODEL_PATH))
    rows = []
    for conf in CONFIDENCE_VALUES:
        tp = fp = fn = 0
        for image_path in image_paths:
            image = cv2.imread(str(image_path))
            if image is None:
                continue
            height, width = image.shape[:2]
            gt = [yolo_to_xyxy(x, width, height) for x in read_labels(LABEL_DIR / f'{image_path.stem}.txt')]
            predictions = []
            results = model.predict(image, conf=conf, classes=sorted(CLASS_IDS), verbose=False)
            for result in results:
                if result.boxes is None:
                    continue
                for box in result.boxes:
                    cls = int(box.cls[0])
                    x1, y1, x2, y2 = [float(v) for v in box.xyxy[0].tolist()]
                    predictions.append((cls, x1, y1, x2, y2))
            matched_gt = set()
            matched_pred = set()
            candidates = []
            for pi, pred in enumerate(predictions):
                for gi, truth in enumerate(gt):
                    if pred[0] == truth[0]:
                        overlap = iou(pred, truth)
                        if overlap >= IOU_MATCH:
                            candidates.append((overlap, pi, gi))
            for _, pi, gi in sorted(candidates, reverse=True):
                if pi not in matched_pred and gi not in matched_gt:
                    matched_pred.add(pi)
                    matched_gt.add(gi)
            tp += len(matched_pred)
            fp += len(predictions) - len(matched_pred)
            fn += len(gt) - len(matched_gt)
        precision = tp / (tp + fp) if (tp + fp) else 0.0
        recall = tp / (tp + fn) if (tp + fn) else 0.0
        f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) else 0.0
        rows.append({'confidence': conf, 'tp': tp, 'fp': fp, 'fn': fn, 'precision': round(precision, 6), 'recall': round(recall, 6), 'f1': round(f1, 6)})
    output = RESULT_DIR / 'project_threshold_results.csv'
    with output.open('w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    print(f'Evaluated images: {len(image_paths)}')
    print(f'Results saved to: {output}')
    for row in rows:
        print(row)


if __name__ == '__main__':
    main()
