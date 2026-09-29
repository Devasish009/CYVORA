import pytest
import asyncio
from engine.core.event_system import event_bus, EngineEvent, EventType

def test_event_bus_publishing_and_subscription():
    async def run():
        received_events = []

        async def sample_handler(event: EngineEvent):
            received_events.append(event)

        event_bus.subscribe(EventType.SESSION_CREATED, sample_handler)

        test_event = EngineEvent(
            session_id="session_test",
            event_type=EventType.SESSION_CREATED,
            sender="TestSender",
            message="Session created successfully"
        )

        await event_bus.publish(test_event)

        assert len(received_events) == 1
        assert received_events[0].session_id == "session_test"
        assert received_events[0].event_type == EventType.SESSION_CREATED

    asyncio.run(run())
