export default function Waiting(props: {
  roomCode: string;
  members: { name: string; birthday: string }[];
  isHost: boolean;
  onLeave: () => void;
  onStart: () => void;
}) {
  return (
    <div>
      <h3>Waiting...</h3>

      <div>RoomCode: <b>{props.roomCode}</b></div>

      <div style={{ marginTop: 8 }}>
        <div>Members:</div>
        <ul>
          {props.members.map((m, idx) => (
            <li key={idx}>
              {m.name} {m.birthday ? `(${m.birthday})` : ""}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 8 }}>
        <button onClick={props.onLeave}>Leave</button>
        {props.isHost&&<button onClick={props.onStart} disabled={!props.isHost}>
          Start Game
        </button>}
        {!props.isHost&&<span>
          waiting host to start
        </span>}
      </div>
    </div>
  );
}
