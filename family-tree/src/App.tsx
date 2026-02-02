import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { useWebSocket } from "./Component/Websocket";
import InputInformation from "./Component/InputInformation";
import SelectMode from "./Component/SelectMode";
import Waiting from "./Component/Waiting";
import AnswerField from "./Component/AnswerField";
import Result from "./Component/Result";

type Mode = "create" | "join";
type Screen = "select" | "form" | "waiting" | "playing" | "result";

type Member = { name: string; birthday: string };

type Data = {
  relation: string;
  a: string;
  b: string;
  answerer: string;
};

function App() {
  // ✅ 建議先用 ws://localhost:8888
  const { connected, lastMessage, send } = useWebSocket("ws://localhost:8888");

  const [screen, setScreen] = useState<Screen>("select");
  const [mode, setMode] = useState<Mode>("create");

  const [userName, setUserName] = useState<string>("");
  const [birthday, setBirthday] = useState<string>("");

  const [roomCode, setRoomCode] = useState<string>("");
  const [members, setMembers] = useState<Member[]>([]);
  const [isHost, setIsHost] = useState<boolean>(false);

  const questions = useMemo(
    () => ["A 跟 B 是什麼關係？", "A 會不會比 B 大？", "A 是不是 B 的家人？"],
    []
  );
  const [question, setQuestion] = useState<string>("");
  const [dataList, setDataList] = useState<Data[]>([]);

  // --- 收 ws message（之後你 server 串 action 就會自動切畫面）---
  useEffect(() => {
    if (!lastMessage) return;

    console.log("WS:", lastMessage);
    let msg: any;
    try {
      msg = JSON.parse(lastMessage);
    } catch {
      return;
    }

    switch (msg.action) {
      case "room_created":
        setRoomCode(msg.roomCode);
        setIsHost(true);
        setMembers((msg.members ?? []).map((n: string) => ({ name: n, birthday: "" })));
        setScreen("waiting");
        break;

      case "joined_room":
        setRoomCode(msg.roomCode);
        setIsHost(false);
        setScreen("waiting");
        break;

      case "member_update":
        if (Array.isArray(msg.members)) {
          setMembers(msg.members.map((n: string) => ({ name: n, birthday: "" })));
        }
        break;

      case "game_started":
        setScreen("playing");
        break;

      case "question":
        setQuestion(msg.question?.text ?? msg.question ?? "");
        break;

      case "game_ended":
        setScreen("result");
        setDataList(msg.data ?? []);
        break;

      case "error":
        alert(msg.message);
        setScreen("select");
        break;
    }
  }, [lastMessage]);

  function reset() {
    setScreen("select");
    setMode("create");
    setUserName("");
    setBirthday("");
    setRoomCode("");
    setMembers([]);
    setIsHost(false);
    setQuestion("");
    setDataList([]);
  }

  return (
    <>
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <b>Status:</b> {connected ? "Connected" : "Disconnected"}
          <button style={{ marginLeft: 12 }} onClick={reset}>
            Reset
          </button>
        </div>

        {screen === "select" && (
          <SelectMode
            onCreate={() => {
              setMode("create");
              setScreen("form");
            }}
            onJoin={() => {
              setMode("join");
              setScreen("form");
            }}
          />
        )}

        {screen === "form" && (
          <InputInformation
            mode={mode}
            onBack={() => setScreen("select")}
            onSubmit={(payload) => {
              setUserName(payload.name);
              setBirthday(payload.birthday);

              if (payload.mode === "create") {
                // ✅ 送給 server
                send({ action: "create_room", name: payload.name, birthday: payload.birthday });

                // ✅ 先做本地 mock（你還沒串 server 也能測 UI）
                const code = String(Math.floor(100000 + Math.random() * 900000));
                setRoomCode(code);
                setIsHost(true);
                setMembers([{ name: payload.name, birthday: payload.birthday }]);
                setScreen("waiting");
              } else {
                send({
                  action: "join_room",
                  roomCode: payload.roomCode,
                  name: payload.name,
                  birthday: payload.birthday,
                });

                setRoomCode(payload.roomCode);
                setIsHost(false);
                setMembers([
                  { name: "Host", birthday: "" },
                  { name: payload.name, birthday: payload.birthday },
                ]);
                setScreen("waiting");
              }
            }}
          />
        )}

        {screen === "waiting" && (
          <Waiting
            roomCode={roomCode}
            members={members}
            isHost={isHost}
            onLeave={() => { location.reload() }}
            onStart={() => {
              send({ action: "start_game", roomCode });
              const q = questions[Math.floor(Math.random() * questions.length)];
              setQuestion(q);
              setScreen("playing");
            }}
          />
        )}

        {screen === "playing" && (
          <AnswerField
            question={question || "（等待題目）"}
            onSubmit={(ans) => {
              // ✅ 送 server
              send({
                action: "answer",
                roomCode,
                relation: ans.relation,
                a: ans.a,
                b: ans.b,
              });

              // ✅ 本地 mock：自己也累積資料 + 換題
              setDataList((prev) => [
                ...prev,
                { ...ans, answerer: userName || "You" },
              ]);
              const q = questions[Math.floor(Math.random() * questions.length)];
              setQuestion(q);
            }}
            onFinish={() => setScreen("result")}
          />
        )}

        {screen === "result" && (
          <Result roomCode={roomCode} dataList={dataList} onHome={() => setScreen("select")} />
        )}
      </div>
    </>
  );
}

export default App;
