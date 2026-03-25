import WebSocket, { WebSocketServer } from "ws";
import GameManager from "./GameManager";
import Player from "./Module/Player";
import type { Data } from "./Module/Data";
import { loadQuestion } from "./Utilities";
import { Status } from "./Module/Status";


const wsToPlayer = new Map<WebSocket, Player>();
const playerIdToWs = new Map<string, WebSocket>();
const treeQuestionList = loadQuestion("./question_generatetree.json")
const questionList = loadQuestion("./question.json")

function broadcastToRoom(roomCode: string, obj: any) {
  const room = gameManager.getRoom(roomCode);
  if (!room) return;

  for (const p of room.getMembers()) {
    const ws = playerIdToWs.get(p.getUUID());
    if (ws && ws.readyState === WebSocket.OPEN) send(ws, obj);
  }
}

function sendToPlayer(playerUUID: string, obj: any) {
  const ws = playerIdToWs.get(playerUUID);
  if (ws && ws.readyState === WebSocket.OPEN) send(ws, obj);
}

let gameManager = new GameManager({
  broadcast: broadcastToRoom,
  sendToPlayer,
});

function send(ws: WebSocket, obj: any) {
  ws.send(JSON.stringify(obj));
}

function ConnectionToServer(port: number): WebSocketServer {
  const wss = new WebSocketServer({ port, host: "0.0.0.0" });
  console.log(`WebSocket server started on ws://localhost:${port}`);
  return wss;
}

function WssListener(wss: WebSocketServer) {
  wss.on("connection", (ws) => {
    send(ws, { action: "connected" });
    console.log("new client")
    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        console.log(msg)
        switch (msg.action) {
          case "create_room": {
            const birthday = new Date(msg.birthday);
            const duration = msg.duration ? parseInt(msg.duration, 10) : 120;
            const { roomCode, host, room } = gameManager.createRoomAndHost(msg.name, birthday, duration);

            wsToPlayer.set(ws, host);
            playerIdToWs.set(host.getUUID(), ws);

            send(ws, {
              action: "room_created",
              roomCode,
              playerUUID: host.getUUID(),
              role: "host",
              members: room.getMembers().map(p => p.getName()),
            });
            break;
          }

          case "join_room": {
            const birthday = new Date(msg.birthday);
            const { player, room } = gameManager.joinRoom(msg.roomCode, msg.name, birthday);

            wsToPlayer.set(ws, player);
            playerIdToWs.set(player.getUUID(), ws);

            broadcastToRoom(msg.roomCode, {
              action: "member_update",
              members: room.getMembers().map(p => p.getName()),
            });

            send(ws, {
              action: "joined_room",
              roomCode: msg.roomCode,
              playerUUID: player.getUUID(),
              role: "member",
            });
            break;
          }

          case "start_game": {
            const requester = wsToPlayer.get(ws);
            if (!requester) throw new Error("You are not registered yet");

            gameManager.startGame(msg.roomCode, requester, questionList, treeQuestionList);

            broadcastToRoom(msg.roomCode, { action: "game_started" });
            break;
          }

          case "answer": {
            const requester = wsToPlayer.get(ws);
            if (!requester) throw new Error("Unauthorized");

            if (msg.answer) {
              gameManager.submitAnswer(msg.roomCode, requester, {
                answer: msg.answer,
                relations: msg.relations,
                attrs: msg.attrs
              });
              break;
            }

            // ✅ 旧版：relation/a/b
            gameManager.submitAnswer(msg.roomCode, requester, {
              relation: msg.relation,
              a: msg.a,
              b: msg.b,
            });
            break;
          }

          case "check_room": {
            const room = gameManager.getRoom(msg.roomCode);
            if (!room) {
              send(ws, { action: "room_check_result", ok: false, reason: "找不到此房間，請確認代碼是否正確" });
            } else if (room.getStatus() !== Status.Waiting) {
              send(ws, { action: "room_check_result", ok: false, reason: "此房間的遊戲已開始，無法加入" });
            } else {
              send(ws, { action: "room_check_result", ok: true, roomCode: msg.roomCode });
            }
            break;
          }

          default:
            send(ws, { action: "error", message: "Unknown action" });
        }
      } catch (err: any) {
        send(ws, { action: "error", message: err.message ?? "Bad request" });
      }
    });

    ws.on("close", () => {
      const player = wsToPlayer.get(ws);

      if (player) {
        console.log(`Player disconnected, master status: ${player.getIsMaster()}`);
        gameManager.handleDisconnect(player);
        playerIdToWs.delete(player.getUUID());
      }

      wsToPlayer.delete(ws);
    });

  });
}

async function main() {
  const port = 8888;
  const wss = ConnectionToServer(port);
  WssListener(wss);
}

main();
