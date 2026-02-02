// GameManager.ts
import Room from "./Module/Room";
import Player from "./Module/Player";
import GameFlow, { type FlowIO } from "./Flow";
import { Status } from "./Module/Status";

export default class GameManager {
  private rooms = new Map<string, Room>();
  private flows = new Map<string, GameFlow>();

  constructor(private io: FlowIO) {}

  createRoomAndHost(name: string, birthday: Date) {
    const host = new Player(name, birthday);
    const room = new Room();
    const code = room.getRoomCode();

    host.joinRoom(code, true);
    room.addMember(host);
    room.setStatus(Status.Waiting);

    this.rooms.set(code, room);
    return { roomCode: code, host, room };
  }

  joinRoom(roomCode: string, name: string, birthday: Date) {
    const room = this.rooms.get(roomCode);
    if (!room) throw new Error("Room not found");
    if (room.getStatus() !== Status.Waiting) throw new Error("Game already started");

    const player = new Player(name, birthday);
    player.joinRoom(roomCode, false);
    room.addMember(player);

    return { player, room };
  }

  getRoom(roomCode: string) {
    return this.rooms.get(roomCode);
  }

  startGame(roomCode: string, requester: Player,questionList:string[]) {
    const room = this.rooms.get(roomCode);
    if (!room) throw new Error("Room not found");

    if (!requester.getIsMaster()) throw new Error("Only host can start");
    if (requester.getRoomCode() !== roomCode) throw new Error("Requester not in this room");
    if (room.getStatus() !== Status.Waiting) throw new Error("Room not in waiting");

    const flow = new GameFlow(room, this.io,questionList, 120);
    this.flows.set(roomCode, flow);

    flow.start();
  }

  submitAnswer(roomCode: string, player: Player, payload: any) {
    const flow = this.flows.get(roomCode);
    if (!flow) throw new Error("Flow not started");
    flow.onAnswer(player, payload);
  }
}
