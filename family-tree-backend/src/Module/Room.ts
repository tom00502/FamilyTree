import Player from "./Player";
import { Status } from "./Status";
import type { Data } from "./Data";
import crypto from "crypto";
import { inferRelations } from "./RelationInference";

type AttrKey = "birthday" | "displayName" | "rank";
type AttrsMap = Record<string, Partial<Record<AttrKey, string>>>;

export default class Room {
  private readonly roomCode: string = crypto.randomUUID().split('-')[0].toUpperCase();
  private members: Player[] = [];
  private status: Status = Status.Waiting;
  private data: Data[] = [];

  // ✅ 新增：人物属性（生日等）
  private attrs: AttrsMap = {};

  // ✅ 新增：游戏时长
  private duration: number = 120;

  getDuration() {
    return this.duration;
  }

  setDuration(duration: number) {
    this.duration = duration;
  }

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

  /**
   * Adds new data. Also recursively infers new relations from the CFG mapping.
   */
  addData(d: Data) {
    this.data.push(d);

    // Infers implicit relations (e.g., A's 爸爸 is B, B's 爸爸 is C -> A's 爺爺 is C)
    let newInferredRelations = inferRelations(this.data);
    let iterations = 0;
    
    // We loop because a new inferred relation might trigger ANOTHER inferred relation
    // Limit to 3 iterations to avoid infinite recursion loops on bad self-referencing data
    while (newInferredRelations.length > 0 && iterations < 3) {
      this.data.push(...newInferredRelations);
      newInferredRelations = inferRelations(this.data);
      iterations++;
    }
  }

  removeData(predicate: (d: Data) => boolean) {
    this.data = this.data.filter(d => !predicate(d));
  }

  getAllData() {
    return this.data;
  }

  // ✅ 新增：写入/读取 attrs
  setAttr(person: string, key: AttrKey, value: string) {
    if (!this.attrs[person]) this.attrs[person] = {};
    this.attrs[person][key] = value;
  }

  getAttrs() {
    return this.attrs;
  }
}
