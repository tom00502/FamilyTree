import { randomUUID } from "node:crypto";

export default class Player {
  private readonly uuid: string;
  private readonly userName: string;
  private readonly birthday: Date;

  private score: number = 0;
  private roomCode?: string;
  private isMaster: boolean = false;

  constructor(name: string, birthday: Date) {
    this.uuid = randomUUID();
    this.userName = name;
    this.birthday = birthday;
  }

  getUUID() {
    return this.uuid;
  }

  getName() {
    return this.userName;
  }

  joinRoom(roomCode: string, isMaster = false) {
    this.roomCode = roomCode;
    this.isMaster = isMaster;
  }

  setMaster(isMaster: boolean) {
    this.isMaster = isMaster;
  }

  getRoomCode() {
    return this.roomCode;
  }

  getIsMaster() {
    return this.isMaster;
  }
}