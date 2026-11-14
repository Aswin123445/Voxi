import pytest
from uuid import uuid4

from app.webrtc.connection_manager import ConnectionManager


@pytest.mark.asyncio
async def test_create_connection():

    manager = ConnectionManager()
    interview_id = uuid4()

    connection = await manager.create_connection(interview_id)

    assert connection is not None
    assert manager.get_connection(interview_id) is connection

    await manager.close_connection(interview_id)


@pytest.mark.asyncio
async def test_close_connection():

    manager = ConnectionManager()
    interview_id = uuid4()

    connection = await manager.create_connection(interview_id)

    await manager.close_connection(interview_id)

    assert manager.get_connection(interview_id) is None
    assert connection.connectionState == "closed"
