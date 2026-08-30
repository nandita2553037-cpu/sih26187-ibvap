import pytest

from tracking.zone_logic import (
    TrackZoneState,
    bottom_center,
    point_in_polygon,
    update_track_zone_state,
)


SQUARE = [(0, 0), (10, 0), (10, 10), (0, 10)]


def test_point_inside_polygon():
    assert point_in_polygon((5, 5), SQUARE) is True


def test_point_outside_polygon():
    assert point_in_polygon((15, 5), SQUARE) is False


def test_point_on_polygon_boundary_counts_as_inside():
    assert point_in_polygon((0, 5), SQUARE) is True


def test_bottom_center():
    assert bottom_center((10, 20, 30, 80)) == (20, 80)


def test_intrusion_is_logged_once_and_loitering_after_threshold():
    state = TrackZoneState()

    assert update_track_zone_state(state, 7, "person", False, 0, 5) == []
    first_events = update_track_zone_state(state, 7, "person", True, 10, 5)
    assert [event["event_type"] for event in first_events] == ["zone_intrusion"]

    assert update_track_zone_state(state, 7, "person", True, 12, 5) == []
    loiter_events = update_track_zone_state(state, 7, "person", True, 15, 5)
    assert [event["event_type"] for event in loiter_events] == ["loitering"]
    assert update_track_zone_state(state, 7, "person", True, 20, 5) == []


def test_reentry_allows_new_intrusion_event():
    state = TrackZoneState()
    update_track_zone_state(state, 3, "person", True, 1, 5)
    update_track_zone_state(state, 3, "person", False, 2, 5)
    events = update_track_zone_state(state, 3, "person", True, 3, 5)
    assert [event["event_type"] for event in events] == ["zone_intrusion"]


def test_invalid_polygon_is_rejected():
    with pytest.raises(ValueError):
        point_in_polygon((1, 1), [(0, 0), (1, 1)])
