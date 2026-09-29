import asyncio
from typing import Callable, Dict, List, Awaitable
from engine.core.event_system.events import EngineEvent, EventType
from engine.core.logging import logger

EventHandler = Callable[[EngineEvent], Awaitable[None]]

class EventBus:
    """Central async event bus supporting event publishing and subscription callbacks."""

    def __init__(self):
        self._listeners: Dict[EventType, List[EventHandler]] = {}
        self._global_listeners: List[EventHandler] = []

    def subscribe(self, event_type: EventType, handler: EventHandler):
        if event_type not in self._listeners:
            self._listeners[event_type] = []
        self._listeners[event_type].append(handler)

    def subscribe_all(self, handler: EventHandler):
        self._global_listeners.append(handler)

    async def publish(self, event: EngineEvent):
        logger.debug(f"[EVENT BUS] [{event.event_type.value}] Session={event.session_id} Msg={event.message}")
        
        # Notify event-specific listeners
        for handler in self._listeners.get(event.event_type, []):
            try:
                await handler(event)
            except Exception as e:
                logger.error(f"Error in EventBus listener for {event.event_type.value}: {e}")

        # Notify global listeners
        for handler in self._global_listeners:
            try:
                await handler(event)
            except Exception as e:
                logger.error(f"Error in EventBus global listener: {e}")

event_bus = EventBus()
