"""Video tracking demo for SIH26187 Role 2."""

import argparse
import json
from pathlib import Path

import cv2
from ultralytics import YOLO

from tracking.zone_logic import TrackZoneState, bottom_center, point_in_polygon, update_track_zone_state


# Starter polygon in a 640 x 480 reference frame.
ZONE = [(120, 300), (520, 300), (620, 470), (60, 470)]
ZONE_ID = "restricted_zone_1"
CAMERA_ID = "cam_01"
ALLOWED_CLASSES = {0: "person", 2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}


def scale_polygon(polygon, width, height):
    return [(int(x * width / 640), int(y * height / 480)) for x, y in polygon]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True, help="Video file path")
    parser.add_argument("--output", default="outputs/role2_demo.mp4")
    parser.add_argument("--events", default="outputs/role2_events.jsonl")
    parser.add_argument("--model", default="yolo26n.pt")
    parser.add_argument("--loiter-seconds", type=float, default=5.0)
    args = parser.parse_args()

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    Path(args.events).parent.mkdir(parents=True, exist_ok=True)

    model = YOLO(args.model)
    capture = cv2.VideoCapture(args.source)
    if not capture.isOpened():
        raise RuntimeError(f"Cannot open video: {args.source}")

    fps = capture.get(cv2.CAP_PROP_FPS) or 25.0
    width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
    writer = cv2.VideoWriter(
        args.output,
        cv2.VideoWriter_fourcc(*"mp4v"),
        fps,
        (width, height),
    )

    zone = scale_polygon(ZONE, width, height)
    zone_array = __import__("numpy").array(zone, dtype="int32")
    states = {}
    frame_number = 0

    with open(args.events, "w", encoding="utf-8") as events_file:
        while True:
            ok, frame = capture.read()
            if not ok:
                break
            frame_number += 1
            timestamp_seconds = frame_number / fps

            result = model.track(
                frame,
                persist=True,
                tracker="bytetrack.yaml",
                conf=0.35,
                verbose=False,
            )[0]

            cv2.polylines(frame, [zone_array], True, (0, 0, 255), 3)
            cv2.putText(frame, "RESTRICTED ZONE", zone[0], cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

            if result.boxes is not None and result.boxes.id is not None:
                boxes = result.boxes.xyxy.cpu().numpy()
                ids = result.boxes.id.int().cpu().tolist()
                classes = result.boxes.cls.int().cpu().tolist()
                confidences = result.boxes.conf.cpu().tolist()

                for box, track_id, class_id, confidence in zip(boxes, ids, classes, confidences):
                    if class_id not in ALLOWED_CLASSES:
                        continue

                    x1, y1, x2, y2 = map(int, box)
                    footpoint = tuple(map(int, bottom_center((x1, y1, x2, y2))))
                    inside = point_in_polygon(footpoint, zone)
                    state = states.setdefault(track_id, TrackZoneState())
                    new_events = update_track_zone_state(
                        state=state,
                        track_id=track_id,
                        object_type=ALLOWED_CLASSES[class_id],
                        inside=inside,
                        timestamp_seconds=timestamp_seconds,
                        loiter_seconds=args.loiter_seconds,
                        camera_id=CAMERA_ID,
                        zone_id=ZONE_ID,
                        confidence=confidence,
                    )
                    for event in new_events:
                        events_file.write(json.dumps(event) + "\n")
                        events_file.flush()

                    color = (0, 0, 255) if inside else (0, 255, 0)
                    label = f"{ALLOWED_CLASSES[class_id]} ID:{track_id}"
                    if inside and state.entry_time is not None:
                        dwell = timestamp_seconds - state.entry_time
                        label += f" {dwell:.1f}s"
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    cv2.circle(frame, footpoint, 5, color, -1)
                    cv2.putText(frame, label, (x1, max(25, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 2)

                    if inside:
                        text = "LOITERING" if state.loiter_logged else "ZONE ENTERED"
                        cv2.putText(frame, text, (30, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.0, color, 3)

            writer.write(frame)
            cv2.imshow("SIH26187 Role 2", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    capture.release()
    writer.release()
    cv2.destroyAllWindows()
    print(f"Saved annotated video to {args.output}")
    print(f"Saved events to {args.events}")


if __name__ == "__main__":
    main()
