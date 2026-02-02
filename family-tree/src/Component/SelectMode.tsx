export default function SelectMode(props: {
  onCreate: () => void;
  onJoin: () => void;
}) {
  return (
    <div className="grid grid-rows-2 gap-4">
      <div>
        <button type="button" className="border-2 p-2" onClick={props.onCreate}>
          createRoom
        </button>
      </div>
      <div>
        <button type="button" className="border-2 p-2" onClick={props.onJoin}>
          join_room
        </button>
      </div>
    </div>
  );
}
