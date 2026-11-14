import logging
import time
from contextlib import contextmanager

logger = logging.getLogger(__name__)


@contextmanager
def measure_time(operation: str):
    start = time.perf_counter()

    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        logger.info(
            "[TIMING] %s took %.3f seconds",
            operation,
            elapsed,
        )
