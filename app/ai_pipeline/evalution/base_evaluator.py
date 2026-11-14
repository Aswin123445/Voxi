from abc import ABC, abstractmethod
from typing import Any


class BaseEvaluator(ABC):

    @abstractmethod
    async def evaluate(self, evaluation_input: Any) -> Any:
        """
        Evaluate the provided input and return
        a structured evaluation result.
        """
        pass
