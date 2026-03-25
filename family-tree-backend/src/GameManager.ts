import Room from "./Module/Room";
import Player from "./Module/Player";
import GameFlow, { type FlowIO } from "./Flow";
import { Status } from "./Module/Status";
import type { QuestionTemplate } from "./Utilities";

export default class GameManager {
  private rooms = new Map<string, Room>();
  private flows = new Map<string, GameFlow>();

  constructor(private io: FlowIO) { }

  createRoomAndHost(name: string, birthday: Date, duration: number = 120) {
    const room = new Room();
    const code = room.getRoomCode();

    if (this.rooms.has(code)) {
      this.removeRoom(code);
    }

    const host = new Player(name, birthday);
    host.joinRoom(code, true);
    room.addMember(host);
    room.setStatus(Status.Waiting);

    // ✅ 顺便存显示名/生日（有助于树显示）
    room.setAttr(name, "displayName", name);
    room.setAttr(name, "birthday", birthday.toISOString().slice(0, 10));

    room.setDuration(duration);

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

    room.setAttr(name, "displayName", name);
    room.setAttr(name, "birthday", birthday.toISOString().slice(0, 10));

    return { player, room };
  }

  removeRoom(roomCode: string) {
    this.rooms.delete(roomCode);
    const flow = this.flows.get(roomCode);
    if (flow) {
      flow.end();
      this.flows.delete(roomCode);
    }
  }

  getRoom(roomCode: string) {
    return this.rooms.get(roomCode);
  }

  // ✅ 改型别：QuestionTemplate[]
  startGame(roomCode: string, requester: Player, questionList: QuestionTemplate[], treeQuestionList: QuestionTemplate[]) {
    const room = this.rooms.get(roomCode);
    if (!room) throw new Error("Room not found");

    if (!requester.getIsMaster()) throw new Error("Only host can start");
    if (requester.getRoomCode() !== roomCode) throw new Error("Requester not in this room");
    if (room.getStatus() !== Status.Waiting) throw new Error("Room not in waiting");

    const members = room.getMembers();
    for (const m of members) {
      const name = m.getName();
      room.addData({ relation: '爸爸', a: name, b: `未知爸爸_${name}`, answerer: 'system' });
      room.addData({ relation: '媽媽', a: name, b: `未知媽媽_${name}`, answerer: 'system' });
      room.addData({ relation: '配偶', a: name, b: `未知配偶_${name}`, answerer: 'system' });
    }

    const flow = new GameFlow(room, this.io, questionList, treeQuestionList, room.getDuration());
    this.flows.set(roomCode, flow);

    // Broadcast the initially seeded data so guests have the same starting points
    this.io.broadcast(roomCode, { action: "data_update", data: room.getAllData() });

    flow.start();
  }

  submitAnswer(roomCode: string, player: Player, payload: any) {
    const flow = this.flows.get(roomCode);
    if (!flow) return;
    flow.onAnswer(player, payload);
  }

  handleDisconnect(player: Player) {
    const code = player.getRoomCode();
    if (!code) return;

    const room = this.rooms.get(code);
    if (!room) return;

    room.removeMember(player);

    if (room.getMembers().length === 0) {
      this.removeRoom(code);
      return;
    }

    if (player.getIsMaster()) {
      const newHost = room.getMembers()[0];
      if (newHost) {
        newHost.setMaster(true);
        this.io.broadcast(code, {
          action: "host_change",
          newHostName: newHost.getName(),
          newHostUUID: newHost.getUUID(),
        });
      }
    }

    this.io.broadcast(code, {
      action: "member_update",
      members: room.getMembers().map((p) => p.getName()),
    });
  }
}
