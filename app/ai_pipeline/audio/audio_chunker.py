import numpy as np


class AudioChunker:
    def __init__(self, chunk_size: int = 512):
        self.chunk_size = chunk_size
        self.buffer = np.empty(0, dtype=np.float32)

    def add_audio(self, audio: np.ndarray) -> list[np.ndarray]:
        if audio.size == 0:
            return []

        self.buffer = np.concatenate((self.buffer, audio))

        chunks = []

        while len(self.buffer) >= self.chunk_size:
            chunk = self.buffer[: self.chunk_size]
            chunks.append(chunk)

            self.buffer = self.buffer[self.chunk_size :]

        return chunks

    def clear(self) -> None:
        self.buffer = np.empty(0, dtype=np.float32)
