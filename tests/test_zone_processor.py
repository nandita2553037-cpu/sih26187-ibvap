from tracking.zone_processor import ZoneDetection, ZoneProcessor


def test_processor_creates_intrusion_and_loitering_events():
    processor = ZoneProcessor(
        zone=[(0, 0), (100, 0), (100, 100), (0, 100)],
        loiter_seconds=5,
    )
    detection = ZoneDetection(
        track_id=7,
        object_type="person",
        box=(40, 20, 60, 80),
        confidence=0.91,
    )

    events, inside = processor.process_detections([detection], timestamp_seconds=0)
    assert inside == {7: True}
    assert [event["event_type"] for event in events] == ["zone_intrusion"]

    events, _ = processor.process_detections([detection], timestamp_seconds=4)
    assert events == []

    events, _ = processor.process_detections([detection], timestamp_seconds=5)
    assert [event["event_type"] for event in events] == ["loitering"]


def test_processor_accepts_outside_detection():
    processor = ZoneProcessor(
        zone=[(0, 0), (100, 0), (100, 100), (0, 100)],
        loiter_seconds=5,
    )
    detection = ZoneDetection(
        track_id=3,
        object_type="person",
        box=(140, 20, 160, 80),
        confidence=0.88,
    )

    events, inside = processor.process_detections([detection], timestamp_seconds=1)
    assert inside == {3: False}
    assert events == []
