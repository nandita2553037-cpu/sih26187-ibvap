"""Role 2 adapter for detections produced by Role 1."""

from dataclasses import dataclass
from typing import Any, Sequence

import numpy as np

from tracking.zone_logic import (
    TrackZoneState,
    bottom_center,
    point_in_polygon,
    update_track_zone_state,
)


@dataclass
class ZoneDetection:
    """One tracked detection received from Role 1."""

    track_id: int
    object_type: str
    box: tuple[float, float, float, float]
    confidence: float


class ZoneProcessor:
    """Role 2 processor for Role 1's YOLO/ByteTrack results.

    Role 1 remains responsible for reading frames, running YOLO, and assigning
    tracking IDs. This class only performs zone and dwell-time analysis.
    """

    def __init__(
        self,
        zone: Sequence[tuple[float, float]],
        loiter_seconds: float = 5.0,
        camera_id: str = "cam_01",
        zone_id: str = "restricted_zone_1",
    ) -> None:
        if len(zone) < 3:
            raise ValueError("A zone must contain at least three points")
        self.zone = list(zone)
        self.loiter_seconds = loiter_seconds
        self.camera_id = camera_id
        self.zone_id = zone_id
        self.states: dict[int, TrackZoneState] = {}

    def process_detections(
        self,
        detections: Sequence[ZoneDetection],
        timestamp_seconds: float,
    ) -> tuple[list[dict], dict[int, bool]]:
        """Return new events and inside/outside status for each track."""
        events: list[dict] = []
        inside_by_track: dict[int, bool] = {}

        for detection in detections:
            footpoint = bottom_center(detection.box)
            inside = point_in_polygon(footpoint, self.zone)
            inside_by_track[detection.track_id] = inside
            state = self.states.setdefault(detection.track_id, TrackZoneState())
            events.extend(
                update_track_zone_state(
                    state=state,
                    track_id=detection.track_id,
                    object_type=detection.object_type,
                    inside=inside,
                    timestamp_seconds=timestamp_seconds,
                    loiter_seconds=self.loiter_seconds,
                    camera_id=self.camera_id,
                    zone_id=self.zone_id,
                    confidence=detection.confidence,
                )
            )

        return events, inside_by_track

    def process_ultralytics_result(
        self,
        result: Any,
        timestamp_seconds: float,
        class_names: dict[int, str] | None = None,
    ) -> tuple[list[dict], dict[int, bool]]:
        """Consume one Ultralytics result from Role 1's existing frame loop."""
        if result.boxes is None or result.boxes.id is None:
            return [], {}

        boxes = result.boxes.xyxy.cpu().numpy()
        ids = result.boxes.id.int().cpu().tolist()
        classes = result.boxes.cls.int().cpu().tolist()
        confidences = result.boxes.conf.cpu().tolist()
        names = class_names or {
            0: "person",
            1: "bicycle",
            2: "car",
            3: "motorcycle",
            5: "bus",
            7: "truck",
        }

        detections = [
            ZoneDetection(
                track_id=int(track_id),
                object_type=names.get(int(class_id), str(class_id)),
                box=tuple(float(value) for value in box),
                confidence=float(confidence),
            )
            for box, track_id, class_id, confidence in zip(
                boxes, ids, classes, confidences
            )
        ]
        return self.process_detections(detections, timestamp_seconds)

    def state_for(self, track_id: int) -> TrackZoneState | None:
        """Return the current state for a track, useful for drawing labels."""
        return self.states.get(track_id)


__all__ = ["ZoneDetection", "ZoneProcessor"]

# Keep NumPy imported explicitly for environments where Ultralytics returns
# NumPy-backed arrays and for clear dependency documentation.
assert np is not None
