import cv2
import time
from pathlib import Path
from ultralytics import YOLO


# ============================================================
# SIH26187 - AI-Based Intelligent Video Analytics
# Detection & Video Pipeline
# ============================================================


# -------------------- CONFIGURATION --------------------

MODEL_PATH = "yolov8n.pt"

INPUT_VIDEO = "input/3175-166339863_medium.mp4"

OUTPUT_VIDEO = "output/detected.mp4"

# Detection confidence
CONFIDENCE_THRESHOLD = 0.40

# IoU threshold for overlapping detections
IOU_THRESHOLD = 0.50

# Classes from COCO dataset
TARGET_CLASSES = {
    0: "PERSON",
    1: "BICYCLE",
    2: "CAR",
    3: "MOTORCYCLE",
    5: "BUS",
    7: "TRUCK"
}

TARGET_CLASS_IDS = list(TARGET_CLASSES.keys())


# -------------------- CREATE OUTPUT FOLDER --------------------

output_path = Path(OUTPUT_VIDEO)
output_path.parent.mkdir(parents=True, exist_ok=True)


# -------------------- LOAD MODEL --------------------

print("=" * 60)
print("SIH26187 - INTELLIGENT VIDEO ANALYTICS")
print("=" * 60)

print("\nLoading YOLOv8 model...")

try:
    model = YOLO(MODEL_PATH)
except Exception as e:
    print(f"ERROR: Could not load YOLO model.")
    print(e)
    exit()


print("YOLOv8 model loaded successfully!")


# -------------------- OPEN VIDEO --------------------

print("\nOpening input video...")

cap = cv2.VideoCapture(INPUT_VIDEO)

if not cap.isOpened():
    print("\nERROR: Could not open video.")
    print(f"Check this path:\n{Path(INPUT_VIDEO).resolve()}")
    exit()


# -------------------- VIDEO INFORMATION --------------------

width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

fps = cap.get(cv2.CAP_PROP_FPS)

if fps <= 0:
    fps = 30.0

total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

duration = total_frames / fps if total_frames > 0 else 0


print("\nVideo Information")
print("-" * 40)
print(f"Resolution : {width} x {height}")
print(f"FPS        : {fps:.2f}")
print(f"Frames     : {total_frames}")
print(f"Duration   : {duration:.2f} seconds")


# -------------------- VIDEO WRITER --------------------

fourcc = cv2.VideoWriter_fourcc(*"mp4v")

out = cv2.VideoWriter(
    OUTPUT_VIDEO,
    fourcc,
    fps,
    (width, height)
)

if not out.isOpened():
    print("\nERROR: Could not create output video.")
    cap.release()
    exit()


# -------------------- STATISTICS --------------------

frame_count = 0

total_detections = 0

max_persons = 0
max_vehicles = 0

start_time = time.time()


# -------------------- MAIN PROCESSING LOOP --------------------

print("\nStarting AI detection...")
print("Press Q to stop the processing.\n")


while True:

    ret, frame = cap.read()

    if not ret:
        break

    frame_count += 1

    # --------------------------------------------------------
    # YOLO DETECTION + TRACKING
    # --------------------------------------------------------

    results = model.track(
        frame,
        persist=True,
        conf=CONFIDENCE_THRESHOLD,
        iou=IOU_THRESHOLD,
        classes=TARGET_CLASS_IDS,
        tracker="bytetrack.yaml",
        verbose=False
    )

    # Current frame counts
    person_count = 0
    vehicle_count = 0

    # --------------------------------------------------------
    # PROCESS DETECTIONS
    # --------------------------------------------------------

    for result in results:

        boxes = result.boxes

        for box in boxes:

            # Class ID
            class_id = int(box.cls[0])

            if class_id not in TARGET_CLASSES:
                continue

            # Confidence
            confidence = float(box.conf[0])

            # Bounding box
            x1, y1, x2, y2 = map(
                int,
                box.xyxy[0]
            )

            # Object label
            label = TARGET_CLASSES[class_id]

            # ------------------------------------------------
            # TRACKING ID
            # ------------------------------------------------

            track_id = None

            if box.id is not None:
                track_id = int(box.id[0])

            # ------------------------------------------------
            # COUNT OBJECTS
            # ------------------------------------------------

            if class_id == 0:

                person_count += 1

            elif class_id in [1, 2, 3, 5, 7]:

                vehicle_count += 1

            total_detections += 1

            # ------------------------------------------------
            # DRAW BOUNDING BOX
            # ------------------------------------------------

            cv2.rectangle(
                frame,
                (x1, y1),
                (x2, y2),
                (0, 255, 0),
                2
            )

            # ------------------------------------------------
            # LABEL
            # ------------------------------------------------

            if track_id is not None:

                text = (
                    f"{label} "
                    f"ID:{track_id} "
                    f"{confidence:.2f}"
                )

            else:

                text = (
                    f"{label} "
                    f"{confidence:.2f}"
                )

            # Text background
            (text_width, text_height), baseline = cv2.getTextSize(
                text,
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                2
            )

            cv2.rectangle(
                frame,
                (x1, max(0, y1 - text_height - 10)),
                (x1 + text_width, y1),
                (0, 255, 0),
                -1
            )

            # Text
            cv2.putText(
                frame,
                text,
                (x1, max(text_height, y1 - 5)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                (0, 0, 0),
                2
            )

    # --------------------------------------------------------
    # FPS CALCULATION
    # --------------------------------------------------------

    elapsed_time = time.time() - start_time

    processing_fps = frame_count / elapsed_time

    # --------------------------------------------------------
    # UPDATE MAX COUNTS
    # --------------------------------------------------------

    max_persons = max(max_persons, person_count)

    max_vehicles = max(max_vehicles, vehicle_count)

    # --------------------------------------------------------
    # INFORMATION PANEL
    # --------------------------------------------------------

    panel_height = 105

    overlay = frame.copy()

    cv2.rectangle(
        overlay,
        (0, 0),
        (350, panel_height),
        (0, 0, 0),
        -1
    )

    # Make panel slightly transparent
    frame = cv2.addWeighted(
        overlay,
        0.65,
        frame,
        0.35,
        0
    )

    # Title
    cv2.putText(
        frame,
        "SIH26187 | AI SURVEILLANCE",
        (10, 25),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (255, 255, 255),
        2
    )

    # Person count
    cv2.putText(
        frame,
        f"Persons   : {person_count}",
        (10, 50),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        (255, 255, 255),
        2
    )

    # Vehicle count
    cv2.putText(
        frame,
        f"Vehicles  : {vehicle_count}",
        (10, 75),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        (255, 255, 255),
        2
    )

    # FPS
    cv2.putText(
        frame,
        f"FPS       : {processing_fps:.1f}",
        (10, 100),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        (255, 255, 255),
        2
    )

    # --------------------------------------------------------
    # FRAME NUMBER
    # --------------------------------------------------------

    cv2.putText(
        frame,
        f"Frame: {frame_count}/{total_frames}",
        (width - 220, height - 15),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (255, 255, 255),
        2
    )

    # --------------------------------------------------------
    # SAVE FRAME
    # --------------------------------------------------------

    out.write(frame)

    # --------------------------------------------------------
    # DISPLAY
    # --------------------------------------------------------

    cv2.imshow(
        "SIH26187 - Intelligent Video Analytics",
        frame
    )

    # --------------------------------------------------------
    # KEYBOARD CONTROL
    # --------------------------------------------------------

    key = cv2.waitKey(1) & 0xFF

    if key == ord("q"):
        print("\nProcessing stopped by user.")
        break


# -------------------- CLEANUP --------------------

cap.release()
out.release()

cv2.destroyAllWindows()


# -------------------- FINAL REPORT --------------------

total_time = time.time() - start_time

print("\n" + "=" * 60)
print("DETECTION COMPLETED")
print("=" * 60)

print(f"Frames processed       : {frame_count}")
print(f"Total detections       : {total_detections}")
print(f"Maximum persons        : {max_persons}")
print(f"Maximum vehicles       : {max_vehicles}")
print(f"Processing time        : {total_time:.2f} seconds")
print(f"Average processing FPS : {frame_count / total_time:.2f}")

print(f"\nOutput video:")
print(Path(OUTPUT_VIDEO).resolve())

print("=" * 60)