"""Integrated Role 1 + Role 2 video pipeline for SIH26187."""

import argparse
import json
from pathlib import Path

import cv2
import numpy as np
from ultralytics import YOLO

from tracking.zone_processor import ZoneProcessor


TARGET_CLASSES = {
    0: "person",
    1: "bicycle",
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck",
}

# Reference coordinates for a 640x480 camera view. Calibrate these later.
REFERENCE_ZONE = [(120, 300), (520, 300), (620, 470), (60, 470)]


def scale_zone(zone, width, height):
    return [(int(x * width / 640), int(y * height / 480)) for x, y in zone]


def main():
    parser = argparse.ArgumentParser(description="Role 1 detection + Role 2 zone analysis")
    parser.add_argument("--input", required=True, help="Input video path")
    parser.add_argument("--output", default="detection/output/role2_integrated.mp4")
    parser.add_argument("--events", default="detection/output/role2_events.jsonl")
    parser.add_argument("--model", default="yolov8n.pt")
    parser.add_argument("--confidence", type=float, default=0.40)
    parser.add_argument("--loiter-seconds", type=float, default=5.0)
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        raise FileNotFoundError(f"Input video not found: {input_path}")

    output_path = Path(args.output)
    events_path = Path(args.events)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    events_path.parent.mkdir(parents=True, exist_ok=True)

    model = YOLO(args.model)
    capture = cv2.VideoCapture(str(input_path))
    if not capture.isOpened():
        raise RuntimeError(f"Could not open video: {input_path}")

    width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = capture.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    zone = scale_zone(REFERENCE_ZONE, width, height)
    zone_processor = ZoneProcessor(zone=zone, loiter_seconds=args.loiter_seconds)
    zone_array = np.array(zone, dtype=np.int32)

    writer = cv2.VideoWriter(
        str(output_path), cv2.VideoWriter_fourcc(*"mp4v"), fps, (width, height)
    )
    frame_number = 0

    with events_path.open("w", encoding="utf-8") as events_file:
        while True:
            ok, frame = capture.read()
            if not ok:
                break
            frame_number += 1
            timestamp_seconds = frame_number / fps

            # Role 1: YOLO detection + ByteTrack IDs.
            result = model.track(
                frame,
                persist=True,
                conf=args.confidence,
                classes=list(TARGET_CLASSES),
                tracker="bytetrack.yaml",
                verbose=False,
            )[0]

            # Role 2: consume Role 1's tracked result; no second model is run.
            events, inside_by_track = zone_processor.process_ultralytics_result(
                result, timestamp_seconds, class_names=TARGET_CLASSES
            )
            for event in events:
                events_file.write(json.dumps(event) + "\n")

            cv2.polylines(frame, [zone_array], True, (0, 0, 255), 3)
            cv2.putText(
                frame, "RESTRICTED ZONE", zone[0], cv2.FONT_HERSHEY_SIMPLEX,
                0.7, (0, 0, 255), 2,
            )

            if result.boxes is not None and result.boxes.id is not None:
                boxes = result.boxes.xyxy.cpu().numpy()
                ids = result.boxes.id.int().cpu().tolist()
                classes = result.boxes.cls.int().cpu().tolist()
                confidences = result.boxes.conf.cpu().tolist()
                for box, track_id, class_id, confidence in zip(boxes, ids, classes, confidences):
                    if class_id not in TARGET_CLASSES:
                        continue
                    x1, y1, x2, y2 = map(int, box)
                    inside = inside_by_track.get(int(track_id), False)
                    color = (0, 0, 255) if inside else (0, 255, 0)
                    label = f"{TARGET_CLASSES[class_id]} ID:{track_id} {confidence:.2f}"
                    state = zone_processor.state_for(int(track_id))
                    if inside and state and state.entry_time is not None:
                        dwell = timestamp_seconds - state.entry_time
                        label += f" {dwell:.1f}s"
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(frame, label, (x1, max(25, y1 - 8)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 2)

            if events:
                alert = ", ".join(event["event_type"].upper() for event in events)
                cv2.putText(frame, f"ALERT: {alert}", (30, 40),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.85, (0, 0, 255), 3)

            cv2.putText(frame, f"Frame: {frame_number}/{total_frames}",
                        (max(10, width - 220), height - 15),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
            writer.write(frame)
            cv2.imshow("SIH26187 Integrated Pipeline", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    capture.release()
    writer.release()
    cv2.destroyAllWindows()
    print(f"Saved integrated video to {output_path}")
    print(f"Saved Role 2 events to {events_path}")


if __name__ == "__main__":
    main()
