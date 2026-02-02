import { useState } from "react";
import "./App.css";
import { useWebSocket } from "./Component/Websocket";
import MainMenu from "./Component/MainMenu";

type UserInfo = {
  name: string;
  age: number;
};

function App() {
  const { connected, lastMessage, send } = useWebSocket(
    "ws://localhost:8080/ws"
  );

  const [userName, setUserName] = useState<string>("default");
  const [showSetName, setShowSetName] = useState<boolean>(true);

  const handleUserSubmit = (user: UserInfo) => {
    setUserName(user.name);
    setShowSetName(false);

    send({
      type: "userName",
      ...user,
    });
  };

  return (
    <>
      {showSetName && (
        <MainMenu onSubmit={handleUserSubmit} />
      )}

      {!showSetName && (
        <div>
          <h2>Welcome, {userName}</h2>
          <p>WS status: {connected ? "🟢" : "🔴"}</p>
        </div>
      )}
    </>
  );
}

export default App;
