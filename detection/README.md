# Role 1 – Detection & Video Pipeline

## Overview

This module handles the initial video processing stage of the SIH26187 project.

It takes CCTV/video footage as input and uses **OpenCV** and **YOLOv8** to detect people and vehicles. **ByteTrack** is used to track detected objects across video frames.

## Technologies Used

- Python
- OpenCV
- Ultralytics YOLOv8
- ByteTrack

## Pipeline

CCTV / Video File  
↓  
OpenCV Video Processing  
↓  
YOLOv8 Object Detection  
↓  
Person & Vehicle Detection  
↓  
ByteTrack Tracking  
↓  
Bounding Boxes + Tracking IDs  
↓  
Processed Video

## Features

- CCTV/video file input
- Person detection
- Vehicle detection
- Confidence score
- Object tracking with unique IDs
- Person and vehicle counting
- FPS monitoring
- Processed video output

## Detected Objects

The system currently detects:

- Person
- Bicycle
- Car
- Motorcycle
- Bus
- Truck

## Project Structure

```text
detection/
├── input/
│   └── sample.mp4
├── output/
│   └── detected.mp4
├── detect.py
└── README.md
