export const init_ws = (room_code, updateStatus) => {
  let socket = new WebSocket(`ws://${window.location.host}/ws/convert/${room_code}/`);

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onclose = () => {
    console.log("WebSocket closed");
  };

  socket.onerror = (error) => {
    console.error("WebSocket error", error);
    socket.close();
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateStatus(data)
  }
  return socket
}

