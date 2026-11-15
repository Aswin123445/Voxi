export function exchangeSdpOffer(
  interviewId,
  offer,
  { onEvent, onSocket } = {},
) {
  return new Promise((resolve, reject) => {
    console.log("[SIGNALING] exchangeSdpOffer called");
    console.log("[SIGNALING] Interview ID:", interviewId);

    const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

    if (!WS_BASE_URL) {
      reject(new Error("VITE_WS_BASE_URL is not configured."));
      return;
    }

    const baseUrl = WS_BASE_URL.replace(/\/+$/, "");
    const signalingUrl = `${baseUrl}/ws/interviews/${interviewId}/signaling`;

    const socket = new WebSocket(signalingUrl);

    let answerReceived = false;
    let settled = false;

    onSocket?.(socket);

    socket.onopen = () => {
      console.log("[SIGNALING] WebSocket connected");

      socket.send(
        JSON.stringify({
          event: "offer",
          sdp: offer.sdp,
          sdp_type: offer.type,
        }),
      );

      console.log("[SIGNALING] SDP offer sent");
    };

    socket.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);

        console.log("[WEBSOCKET] Received:", response);

        if (response.event === "answer") {
          if (answerReceived) return;

          answerReceived = true;
          settled = true;

          resolve({
            sdp: response.sdp,
            type: response.type,
          });

          return;
        }

        if (response.event === "error") {
          const error = new Error(
            response.message || "Signaling server error.",
          );

          if (!answerReceived && !settled) {
            settled = true;
            reject(error);
            socket.close();
            return;
          }
        }

        onEvent?.(response);
      } catch (error) {
        console.error("[WEBSOCKET] Message handling failed:", error);

        if (!settled) {
          settled = true;
          reject(error);
          socket.close();
        }
      }
    };

    socket.onerror = (event) => {
      console.error("[SIGNALING] WebSocket error:", event);

      if (!settled) {
        settled = true;
        reject(new Error("Unable to connect to signaling server."));
      }
    };

    socket.onclose = (event) => {
      console.log("[SIGNALING] WebSocket closed:", event.code);

      if (!settled) {
        settled = true;
        reject(new Error("WebSocket closed before receiving SDP answer."));
      }

      onEvent?.({
        event: "signaling.closed",
        data: {
          code: event.code,
          reason: event.reason,
        },
      });
    };
  });
}
