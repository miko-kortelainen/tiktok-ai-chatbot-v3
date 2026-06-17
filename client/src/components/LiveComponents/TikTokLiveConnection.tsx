import { tiktokLiveService } from "../../services/endpoints";
import { useEffect, useState } from "react";
import { useSocket } from "../hooks/SocketProvider";
import UsernameInput from "../main/UsernameInput";

function TikTokLiveConnection() {
  const socket = useSocket();

  const [connectionStatus, setConnectionStatus] = useState("");
  const [isConnectedToTikTok, setIsConnectedToTikTok] = useState(false);

  useEffect(() => {
    if (!socket) return;
    socket.on("ConnectionStatus", handleConnectionStatus);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("ConnectionStatus");
      socket.off("connect_error");
    };
  }, [socket]);

  async function startLiveConnection(username: string) {
    console.log("Trying connection to live of user: ", username);
    tiktokLiveService.startLiveConnection(username);
  }

  function disconnectFromLive() {
    if (!socket) return;
    socket.emit("DisconnectFromTikTok");
    setConnectionStatus("");
    setIsConnectedToTikTok(false);
  }

  function handleConnectionStatus(data: { type: string; message: string }) {
    updateLiveConnectionStatus(data);
  }

  function handleConnectError(error: { message: string }) {
    setConnectionStatus(`Error: ${error.message}`);
  }

  function updateLiveConnectionStatus(data: { type: string; message: string }) {
    const { type, message } = data;
    setConnectionStatus(`${type}: ${message}`);
    setIsConnectedToTikTok(type === "success");
  }

  return (
    <div>
      <p>status: {connectionStatus}</p>
      <UsernameInput
        handleStart={startLiveConnection}
        handleDisconnect={disconnectFromLive}
        isConnected={isConnectedToTikTok}
      />
    </div>
  );
}

export default TikTokLiveConnection;
