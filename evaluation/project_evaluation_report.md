\# Role 5: YOLOv8 Model Evaluation Report



\## 1. Objective



The objective of this evaluation was to measure the performance of the YOLOv8 object-detection model used in the SIH26187 Intelligent Border Video Analytics Platform prototype.



The evaluation focused on detecting people and vehicles in a project-provided video and selecting a suitable confidence threshold for the initial prototype.



\## 2. Video and Dataset Details



The video used for this evaluation was `team\_video.mp4`.



\- Duration: 16.02 seconds

\- Resolution: 1280 x 720 pixels

\- Frame rate: 23.98 FPS

\- Total source frames: 384

\- Evaluation images: 128

\- Scene: Busy urban street in daylight

\- Objects visible: People, cars, motorcycles, bicycles, and rickshaws



The frames were extracted from the original video at regular intervals. The video contains crowded scenes, overlapping objects, motion blur, and partially hidden objects.



\## 3. Classes Evaluated



The evaluation used the class mapping from the Role 1 detection code:



| Class ID | Class |

|---:|---|

| 0 | Person |

| 1 | Bicycle |

| 2 | Car |

| 3 | Motorcycle |

| 5 | Bus |

| 7 | Truck |



Rickshaws were not treated as a separate class because the current Role 1 model does not contain a dedicated rickshaw class.



\## 4. Evaluation Method



The YOLOv8n model was evaluated on 128 extracted images at five confidence thresholds: 0.25, 0.40, 0.50, 0.60, and 0.70.



A predicted box was considered a match when it belonged to the correct class and overlapped the corresponding annotation box by at least IoU 0.50.



IoU means Intersection over Union. It measures how much the predicted box overlaps the correct box.



The following metrics were calculated:



\- True Positive (TP): a correct detection.

\- False Positive (FP): an incorrect extra detection.

\- False Negative (FN): a real object missed by the model.

\- Precision: the proportion of model detections that were correct.

\- Recall: the proportion of real objects that were detected.

\- F1-score: a combined balance of precision and recall.



\## 5. Threshold Results



| Confidence | TP | FP | FN | Precision | Recall | F1-score |

|---:|---:|---:|---:|---:|---:|---:|

| 0.25 | 1147 | 728 | 0 | 61.17% | 100.00% | 75.91% |

| 0.40 | 1125 | 30 | 22 | 97.40% | 98.08% | 97.74% |

| 0.50 | 877 | 0 | 270 | 100.00% | 76.46% | 86.66% |

| 0.60 | 674 | 0 | 473 | 100.00% | 58.76% | 74.03% |

| 0.70 | 457 | 0 | 690 | 100.00% | 39.84% | 56.98% |



\## 6. Result Interpretation



At confidence 0.25, recall was 100%, which means the model found all annotated objects. However, the model also produced 728 false positives, meaning many additional incorrect boxes were generated.



At confidence 0.40, the model achieved the highest F1-score of 97.74%. It produced 1,125 true positives, 30 false positives, and 22 false negatives. This gives a good balance between finding objects and avoiding incorrect detections.



At confidence values above 0.40, precision remained high, but recall decreased because the model became too strict and missed more objects.



\## 7. Recommended Threshold



Based on this preliminary experiment, the provisional recommended confidence threshold is \*\*0.40\*\*.



This threshold produced the highest F1-score among the tested values and provided a good balance between precision and recall.



The threshold is provisional because the current labels were model-assisted and the video is a short urban street sample rather than actual border-surveillance footage.



\## 8. Limitations



The evaluation has the following limitations:



1\. The video is approximately 16 seconds long and contains only one urban street scene.

2\. The video is not actual border-surveillance footage.

3\. The scene contains daylight conditions but does not test night-time conditions.

4\. The crowded scene contains occlusion and motion blur.

5\. The current YOLO model does not have a dedicated rickshaw class.

6\. The draft annotations were model-assisted and require independent human verification.

7\. The reported metrics should therefore be treated as preliminary rather than final model accuracy.



\## 9. Future Improvements



Future testing should use longer project-specific CCTV footage containing night scenes, distant people, restricted-zone scenes, different weather conditions, and more examples of vehicles and occluded people.



The annotations should also be independently reviewed by a human annotator before final accuracy numbers are reported.



\## 10. Conclusion



The Role 1 detection pipeline successfully processed the project video. Among the tested confidence thresholds, 0.40 produced the best provisional balance between precision and recall, with an F1-score of 97.74% on the current model-assisted evaluation set.



The result demonstrates that the team has a working detection pipeline, while further testing with independently verified project-specific CCTV data is required before making final performance claims.



