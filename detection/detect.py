import cv2
import time
import argparse
from pathlib import Path
from ultralytics import YOLO


# ============================================================
# SIH26187 - Intelligent Video Analytics
# Role 1: Detection & Video Pipeline
# ============================================================


# -------------------- COMMAND LINE ARGUMENTS --------------------

parser = argparse.ArgumentParser(
    description="SIH26187 YOLOv8 Detection and Tracking Pipeline"
)

parser.add_argument(
    "--input",
    type=str,
    required=True,
    help="Path to input video"
)

parser.add_argument(
    "--output",
    type=str,
    default="output/detected.mp4",
    help="Path for output video"
)

parser.add_argument(
    "--confidence",
    type=float,
    default=0.40,
    help="Detection confidence threshold"
)

parser.add_argument(
    "--iou",
    type=float,
    default=0.50,
    help="IoU threshold"
)

args = parser.parse_args()


# -------------------- CONFIGURATION --------------------

MODEL_PATH = "yolov8n.pt"

INPUT_VIDEO = args.input
OUTPUT_VIDEO = args.output

CONFIDENCE_THRESHOLD = args.confidence
IOU_THRESHOLD = args.iou


# COCO classes used for surveillance
TARGET_CLASSES = {
    0: "PERSON",
    1: "BICYCLE",
    2: "CAR",
    3: "MOTORCYCLE",
    5: "BUS",
    7: "TRUCK"
}

TARGET_CLASS_IDS = list(TARGET_CLASSES.keys())


# -------------------- VALIDATE INPUT --------------------

input_path = Path(INPUT_VIDEO)

if not input_path.exists():

    print("\nERROR: Input video not found.")
    print(f"Expected file: {input_path.resolve()}")

    print("\nExample:")
    print("python detect.py --input input/sample.mp4")

    exit(1)


# -------------------- CREATE OUTPUT DIRECTORY --------------------

output_path = Path(OUTPUT_VIDEO)

output_path.parent.mkdir(
    parents=True,
    exist_ok=True
)


# -------------------- LOAD YOLO MODEL --------------------

print("=" * 60)
print("SIH26187 - INTELLIGENT VIDEO ANALYTICS")
print("Role 1: Detection & Video Pipeline")
print("=" * 60)

print("\nLoading YOLOv8 model...")

try:

    model = YOLO(MODEL_PATH)

except Exception as e:

    print("ERROR: Could not load YOLO model.")
    print(e)

    exit(1)


print("YOLOv8 model loaded successfully!")


# -------------------- OPEN VIDEO --------------------

print("\nOpening input video...")

cap = cv2.VideoCapture(str(input_path))

if not cap.isOpened():

    print("ERROR: Could not open video.")
    exit(1)


# -------------------- VIDEO INFORMATION --------------------

width = int(
    cap.get(cv2.CAP_PROP_FRAME_WIDTH)
)

height = int(
    cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
)

fps = cap.get(cv2.CAP_PROP_FPS)

if fps <= 0:

    fps = 30.0


total_frames = int(
    cap.get(cv2.CAP_PROP_FRAME_COUNT)
)

duration = (
    total_frames / fps
    if total_frames > 0
    else 0
)


print("\nVideo Information")
print("-" * 40)

print(f"Resolution : {width} x {height}")
print(f"FPS        : {fps:.2f}")
print(f"Frames     : {total_frames}")
print(f"Duration   : {duration:.2f} seconds")


# -------------------- OUTPUT VIDEO --------------------

fourcc = cv2.VideoWriter_fourcc(
    *"mp4v"
)

out = cv2.VideoWriter(
    str(output_path),
    fourcc,
    fps,
    (width, height)
)

if not out.isOpened():

    print("ERROR: Could not create output video.")

    cap.release()

    exit(1)


# -------------------- STATISTICS --------------------

frame_count = 0

total_detections = 0

max_persons = 0

max_vehicles = 0

start_time = time.time()


# -------------------- PROCESS VIDEO --------------------

print("\nStarting AI detection...")
print("Press Q to stop.\n")


while True:

    ret, frame = cap.read()

    if not ret:

        break


    frame_count += 1


    # ========================================================
    # YOLOv8 DETECTION + BYTE TRACK TRACKING
    # ========================================================

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


    # ========================================================
    # PROCESS DETECTIONS
    # ========================================================

    for result in results:

        if result.boxes is None:
            continue


        for box in result.boxes:

            class_id = int(
                box.cls[0]
            )

            confidence = float(
                box.conf[0]
            )


            if class_id not in TARGET_CLASSES:

                continue


            # Bounding box coordinates

            x1, y1, x2, y2 = map(
                int,
                box.xyxy[0]
            )


            label = TARGET_CLASSES[class_id]


            # =================================================
            # TRACKING ID
            # =================================================

            track_id = None

            if box.id is not None:

                track_id = int(
                    box.id[0]
                )


            # =================================================
            # COUNT OBJECTS
            # =================================================

            if class_id == 0:

                person_count += 1

            else:

                vehicle_count += 1


            total_detections += 1


            # =================================================
            # DRAW BOUNDING BOX
            # =================================================

            cv2.rectangle(

                frame,

                (x1, y1),

                (x2, y2),

                (0, 255, 0),

                2
            )


            # =================================================
            # LABEL
            # =================================================

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


            # Text size

            (text_width, text_height), baseline = cv2.getTextSize(

                text,

                cv2.FONT_HERSHEY_SIMPLEX,

                0.55,

                2
            )


            # Text background

            cv2.rectangle(

                frame,

                (x1, max(0, y1 - text_height - 10)),

                (
                    x1 + text_width,
                    y1
                ),

                (0, 255, 0),

                -1
            )


            # Text

            cv2.putText(

                frame,

                text,

                (
                    x1,
                    max(text_height, y1 - 5)
                ),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.55,

                (0, 0, 0),

                2
            )


    # ========================================================
    # FPS
    # ========================================================

    elapsed_time = time.time() - start_time

    processing_fps = (
        frame_count / elapsed_time
        if elapsed_time > 0
        else 0
    )


    # ========================================================
    # MAXIMUM COUNTS
    # ========================================================

    max_persons = max(
        max_persons,
        person_count
    )

    max_vehicles = max(
        max_vehicles,
        vehicle_count
    )


    # ========================================================
    # INFORMATION PANEL
    # ========================================================

    panel_height = 110

    overlay = frame.copy()


    cv2.rectangle(

        overlay,

        (0, 0),

        (370, panel_height),

        (0, 0, 0),

        -1
    )


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

        f"Persons  : {person_count}",

        (10, 50),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.55,

        (255, 255, 255),

        2
    )


    # Vehicle count

    cv2.putText(

        frame,

        f"Vehicles : {vehicle_count}",

        (10, 75),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.55,

        (255, 255, 255),

        2
    )


    # FPS

    cv2.putText(

        frame,

        f"FPS      : {processing_fps:.1f}",

        (10, 100),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.55,

        (255, 255, 255),

        2
    )


    # ========================================================
    # FRAME INFORMATION
    # ========================================================

    cv2.putText(

        frame,

        f"Frame: {frame_count}/{total_frames}",

        (
            max(10, width - 220),
            height - 15
        ),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.5,

        (255, 255, 255),

        2
    )


    # ========================================================
    # SAVE
    # ========================================================

    out.write(frame)


    # ========================================================
    # DISPLAY
    # ========================================================

    cv2.imshow(

        "SIH26187 - Intelligent Video Analytics",

        frame
    )


    # ========================================================
    # KEYBOARD
    # ========================================================

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

average_fps = (
    frame_count / total_time
    if total_time > 0
    else 0
)


print("\n" + "=" * 60)

print("DETECTION COMPLETED")

print("=" * 60)

print(f"Frames processed       : {frame_count}")

print(f"Total detections       : {total_detections}")

print(f"Maximum persons        : {max_persons}")

print(f"Maximum vehicles       : {max_vehicles}")

print(f"Processing time        : {total_time:.2f} seconds")

print(f"Average processing FPS : {average_fps:.2f}")

print("\nOutput video:")

print(output_path.resolve())

print("=" * 60)
