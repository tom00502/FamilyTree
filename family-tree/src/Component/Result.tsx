export default function Result(props: {
  roomCode: string;
  dataList: { relation: string; a: string; b: string; answerer: string }[];
  onHome: () => void;
}) {
  return (
    <div>
      <h3>Result</h3>
      <div>RoomCode: <b>{props.roomCode}</b></div>

      <div style={{ marginTop: 8 }}>
        {props.dataList.length === 0 ? (
          <div>No data</div>
        ) : (
          <ul>
            {props.dataList.map((d, idx) => (
              <li key={idx}>
                {d.answerer}: ({d.relation}) {d.a} - {d.b}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button style={{ marginTop: 12 }} onClick={props.onHome}>
        Back Home
      </button>
    </div>
  );
}
