import cv2
from pathlib import Path

video_path = Path("detection/input/team_video.mp4")
output_dir = Path("evaluation/project_data/images")
output_dir.mkdir(parents=True, exist_ok=True)

cap = cv2.VideoCapture(str(video_path))

if not cap.isOpened():
    print(f"ERROR: Could not open {video_path}")
    raise SystemExit(1)

frame_number = 0
saved_number = 0
interval = 3

while True:
    success, frame = cap.read()

    if not success:
        break

    if frame_number % interval == 0:
        output_path = output_dir / f"team_frame_{saved_number:04d}.jpg"
        cv2.imwrite(str(output_path), frame)
        saved_number += 1

    frame_number += 1

cap.release()

print(f"Total video frames read: {frame_number}")
print(f"Project test images saved: {saved_number}")
print(f"Saved in: {output_dir.resolve()}")
