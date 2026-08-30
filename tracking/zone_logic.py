"""Restricted-zone geometry and dwell-time logic for SIH26187 Role 2."""

from dataclasses import dataclass
from typing import Iterable, Sequence

Point = tuple[float, float]
Polygon = Sequence[Point]


@dataclass
class TrackZoneState:
    """State kept for one tracked object across video frames."""

    inside: bool = False
    entry_time: float | None = None
    intrusion_logged: bool = False
    loiter_logged: bool = False


def point_in_polygon(point: Point, polygon: Polygon) -> bool:
    """Return True when a point is inside or on the boundary of a polygon.

    The polygon is expressed as [(x1, y1), (x2, y2), ...].
    """
    if len(polygon) < 3:
        raise ValueError("A polygon must contain at least three points")

    x, y = point
    inside = False
    previous_x, previous_y = polygon[-1]

    for current_x, current_y in polygon:
        # Boundary check for a point lying exactly on an edge.
        cross = (y - previous_y) * (current_x - previous_x) - (x - previous_x) * (current_y - previous_y)
        within_x = min(previous_x, current_x) <= x <= max(previous_x, current_x)
        within_y = min(previous_y, current_y) <= y <= max(previous_y, current_y)
        if abs(cross) < 1e-9 and within_x and within_y:
            return True

        crosses_horizontal_ray = (current_y > y) != (previous_y > y)
        if crosses_horizontal_ray:
            intersection_x = (previous_x - current_x) * (y - current_y) / (previous_y - current_y) + current_x
            if x < intersection_x:
                inside = not inside

        previous_x, previous_y = current_x, current_y

    return inside


def bottom_center(box: Iterable[float]) -> Point:
    """Return the bottom-center ground-contact point of (x1, y1, x2, y2)."""
    x1, y1, x2, y2 = box
    return ((x1 + x2) / 2, y2)


def update_track_zone_state(
    state: TrackZoneState,
    track_id: int,
    object_type: str,
    inside: bool,
    timestamp_seconds: float,
    loiter_seconds: float,
    camera_id: str = "cam_01",
    zone_id: str = "restricted_zone_1",
    confidence: float = 0.0,
) -> list[dict]:
    """Update one track and return any newly triggered events.

    A zone intrusion is emitted once when a track changes from outside to inside.
    A loitering event is emitted once after the dwell threshold is reached.
    Leaving the zone resets the state so a future re-entry can generate events again.
    """
    events: list[dict] = []

    if not inside:
        state.inside = False
        state.entry_time = None
        state.intrusion_logged = False
        state.loiter_logged = False
        return events

    if not state.inside:
        state.inside = True
        state.entry_time = timestamp_seconds
        state.intrusion_logged = False
        state.loiter_logged = False

    dwell_seconds = timestamp_seconds - (state.entry_time or timestamp_seconds)
    base_event = {
        "camera_id": camera_id,
        "track_id": int(track_id),
        "object_type": object_type,
        "zone_id": zone_id,
        "timestamp_seconds": timestamp_seconds,
        "confidence": round(float(confidence), 3),
    }

    if not state.intrusion_logged:
        events.append({**base_event, "event_type": "zone_intrusion", "dwell_seconds": round(dwell_seconds, 2)})
        state.intrusion_logged = True

    if dwell_seconds >= loiter_seconds and not state.loiter_logged:
        events.append({**base_event, "event_type": "loitering", "dwell_seconds": round(dwell_seconds, 2)})
        state.loiter_logged = True

    return events
