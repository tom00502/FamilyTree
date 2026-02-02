import { useState } from "react";

type Mode = "create" | "join";

type Props = {
  mode: Mode;
  onBack: () => void;
  onSubmit: (payload: {
    mode: Mode;
    roomCode: string;
    name: string;
    birthday: string;
  }) => void;
};

export default function InputInformation({ mode, onBack, onSubmit }: Props) {
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");

  const isJoin = mode === "join";

  return (
    <div>
      <h3>{isJoin ? "加入房間" : "創建房間"}</h3>

      {isJoin && (
        <div>
          <input
            placeholder="房號"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
        </div>
      )}

      <div>
        <input
          placeholder="名字"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <input
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 8 }}>
        <button onClick={onBack}>返回</button>
        <button
          onClick={() => {
            if (!name.trim()) return alert("請輸入姓名");
            if (!birthday) return alert("請輸入生日");
            if (isJoin && !roomCode.trim()) return alert("請輸入房號");

            onSubmit({
              mode,
              roomCode: roomCode.trim(),
              name: name.trim(),
              birthday,
            });
          }}
        >
          送出
        </button>
      </div>
    </div>
  );
}
