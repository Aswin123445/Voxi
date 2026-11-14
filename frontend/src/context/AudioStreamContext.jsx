import { createContext, useContext, useState, useCallback } from "react";

const AudioStreamContext = createContext(null);

export function AudioStreamProvider({ children }) {
  const [stream, setStream] = useState(null);

  const clearStream = useCallback(() => {
    setStream((currentStream) => {
      currentStream?.getTracks().forEach((track) => track.stop());
      return null;
    });
  }, []);

  const updateStream = useCallback((newStream) => {
    setStream((currentStream) => {
      if (currentStream && currentStream !== newStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }

      return newStream;
    });
  }, []);

  return (
    <AudioStreamContext.Provider
      value={{
        stream,
        setStream: updateStream,
        clearStream,
      }}
    >
      {children}
    </AudioStreamContext.Provider>
  );
}

export function useAudioStream() {
  const context = useContext(AudioStreamContext);

  if (!context) {
    throw new Error("useAudioStream must be used inside AudioStreamProvider.");
  }

  return context;
}
