export function registerEventListeners(websocket) {
  websocket.addEventListener("message", (message) => {
    const payload = JSON.parse(message.data);

    console.log("[WEBSOCKET] Received:", payload);

    switch (payload.event) {
      case "answer":
        console.log("[WEBRTC] SDP answer received");
        break;

      case "interview.started":
        console.log("[INTERVIEW] Interview started");
        console.log("Status:", payload.data.status);
        console.log("Message:", payload.data.message);
        break;

      case "error":
        console.error("[WEBSOCKET] Error:", payload.message);
        break;

      default:
        console.log("[WEBSOCKET] Unhandled event:", payload.event);
    }
  });
}
