import numpy as np


class AudioBuffer:
    SAMPLE_RATE = 16000
    MAX_DURATION_SECONDS = 60
    PRE_ROLL_SECONDS = 0.3

    def __init__(self):
        self.pre_roll_samples = int(self.SAMPLE_RATE * self.PRE_ROLL_SECONDS)

        self.max_samples = self.SAMPLE_RATE * self.MAX_DURATION_SECONDS

        self._pre_roll = np.empty(0, dtype=np.float32)
        self._recorded_audio = []
        self._recording = False
        self._recorded_samples = 0

    def append(self, audio: np.ndarray) -> None:
        audio = np.asarray(audio, dtype=np.float32).reshape(-1)

        if audio.size == 0:
            return

        if not self._recording:
            self._pre_roll = np.concatenate((self._pre_roll, audio))[
                -self.pre_roll_samples :
            ]

            return

        remaining_capacity = self.max_samples - self._recorded_samples

        if remaining_capacity <= 0:
            return

        audio = audio[:remaining_capacity]

        self._recorded_audio.append(audio)
        self._recorded_samples += len(audio)

    def start_recording(self) -> None:
        if self._recording:
            return

        self._recorded_audio = []

        if self._pre_roll.size:
            self._recorded_audio.append(self._pre_roll.copy())
            self._recorded_samples = len(self._pre_roll)
        else:
            self._recorded_samples = 0

        self._pre_roll = np.empty(0, dtype=np.float32)
        self._recording = True

    def stop_recording(self) -> np.ndarray | None:
        if not self._recording:
            return None

        audio = np.concatenate(self._recorded_audio)

        self._recording = False
        self._recorded_audio = []
        self._recorded_samples = 0

        return audio

    def clear(self) -> None:
        self._pre_roll = np.empty(0, dtype=np.float32)
        self._recorded_audio = []
        self._recorded_samples = 0
        self._recording = False

    @property
    def duration(self) -> float:
        return self._recorded_samples / self.SAMPLE_RATE

    @property
    def is_recording(self) -> bool:
        return self._recording
