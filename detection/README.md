# SIH26187 - Detection & Video Pipeline

## Role

**Role 1: Detection & Video Pipeline Lead**

This module is responsible for converting raw CCTV/video footage into AI-based detections of people and vehicles.

---

## Overview

The detection pipeline uses **OpenCV**, **YOLOv8**, and **ByteTrack** to process surveillance video.

### Pipeline

```text
CCTV / Video File
        |
        v
     OpenCV
        |
        v
   YOLOv8 Detection
        |
        v
Person / Vehicle Detection
        |
        v
   ByteTrack Tracking
        |
        v
Tracking IDs + Confidence
        |
        v
Processed Surveillance Video
Features
Video file ingestion using OpenCV

YOLOv8 object detection

Person detection

Vehicle detection

Motorcycle detection

Bicycle detection

Bus detection

Truck detection

Confidence score filtering

IoU threshold configuration

ByteTrack object tracking

Unique tracking IDs

Real-time FPS calculation

Person and vehicle counting

Processed output video generation

Detection statistics

Technologies
Technology	Purpose
Python	Core programming
OpenCV	Video processing and frame handling
Ultralytics YOLOv8	Object detection
ByteTrack	Object tracking
Detected Classes
The pretrained YOLOv8 model detects the following classes used by this module:

PERSON
BICYCLE
CAR
MOTORCYCLE
BUS
TRUCK
Project Structure
detection/
│
├── input/
│   └── sample.mp4
│
├── output/
│   └── detected.mp4
│
├── detect.py
│
└── README.md
Input and output video files are excluded from Git using .gitignore.

Installation
Install the required Python packages:

pip install ultralytics opencv-python
Verify Ultralytics:

python -c "from ultralytics import YOLO; print('YOLO is working!')"
Running the Detection Pipeline
First, move into the detection directory:

cd detection
Run the detector:

python detect.py --input input/sample.mp4
The processed video will be generated at:

output/detected.mp4
Confidence Threshold
The detection confidence can be changed using:

python detect.py --input input/sample.mp4 --confidence 0.40
Example:

python detect.py --input input/sample.mp4 --confidence 0.50
Higher confidence values produce stricter detections, while lower values allow more detections but may increase false positives.

IoU Threshold
The IoU threshold can also be configured:

python detect.py --input input/sample.mp4 --iou 0.50
Both parameters can be changed together:

python detect.py --input input/sample.mp4 --confidence 0.50 --iou 0.50
Tracking
The pipeline uses ByteTrack through the Ultralytics tracking interface.

Each detected object can receive a unique tracking ID:

PERSON ID:4 0.92
CAR ID:7 0.88
TRUCK ID:2 0.91
This allows the system to maintain object identities across consecutive video frames.

Output
The processed video displays:

Bounding boxes

Object class

Confidence score

Tracking ID

Person count

Vehicle count

Processing FPS

Frame number

Example:

SIH26187 | AI SURVEILLANCE

Persons  : 3
Vehicles : 2
FPS      : 18.4
Demo

The demonstration should show:

Input CCTV Footage
        ↓
YOLOv8 Detection
        ↓
Person / Vehicle Bounding Boxes
        ↓
Tracking IDs
        ↓
Processed Output Video
A short screen recording or GIF showing the bounding boxes around people and vehicles provides evidence of the implemented AI detection pipeline.
Future Integration

This module is designed to integrate with the remaining SIH26187 components.

Future stages can include:

Detection
    ↓
Object Tracking
    ↓
Behavior / Anomaly Analysis
    ↓
Threat Classification
    ↓
Alert Generation
    ↓
Surveillance Dashboard
Role 1 Responsibility

The Detection & Video Pipeline Lead is responsible for:

CCTV/video ingestion
OpenCV video processing
YOLOv8 integration
Person and vehicle detection
Confidence threshold tuning
Object tracking integration
Detection output generation
Preparing detection demonstrations for the SIH review
Status

Implementation Status: In Progress

Completed
 OpenCV video ingestion
 YOLOv8 integration
 Person detection
 Vehicle detection
 Confidence threshold
 IoU threshold
 ByteTrack tracking
 Tracking IDs
 Object counting
 Output video generation
Planned
 RTSP camera integration
 Multiple camera support
 Detection performance evaluation
 Integration with anomaly detection
 Real-time alert integration
 Dashboard integration
