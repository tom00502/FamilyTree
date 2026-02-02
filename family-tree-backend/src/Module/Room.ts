import { randomUUID } from "node:crypto";
import Player from "./Player";
import { Status } from "./Status";
import type { Data } from "./Data";

export default class Room {
    private readonly roomCode: string = "1" // randomUUID();
    private members: Player[] = [];
    private status: Status = Status.Waiting;
    private data: Data[] = [];

    getRoomCode() {
        return this.roomCode;
    }

    removeMember(player: Player) {
        this.members = this.members.filter((x) => x !== player);
    }

    addMember(player: Player) {
        this.members.push(player);
    }

    getMembers() {
        return this.members;
    }

    setStatus(status: Status) {
        this.status = status;
    }

    getStatus() {
        return this.status;
    }

    addData(d: Data) {
        this.data.push(d);
    }

    getAllData() {
        return this.data
    }


}
