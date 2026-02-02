import WebSocket, { WebSocketServer } from "ws";
import GameManager from "./GameManager";
import Player from "./Module/Player";
import type { Data } from "./Module/Data";
import { loadQuestion } from "./Utilities";


const wsToPlayer = new Map<WebSocket, Player>();
const playerIdToWs = new Map<string, WebSocket>();
const questionList=loadQuestion("./Module/question.json")

function broadcastToRoom(roomCode: string, obj: any) {
  const room = gameManager.getRoom(roomCode);
  if (!room) return;

  for (const p of room.getMembers()) {
    const ws = playerIdToWs.get(p.getUUID());
    if (ws && ws.readyState === WebSocket.OPEN) send(ws, obj);
  }
}

let gameManager = new GameManager({
  broadcast: broadcastToRoom
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

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        switch (msg.action) {
          case "create_room": {
            const birthday = new Date(msg.birthday);
            const { roomCode, host, room } = gameManager.createRoomAndHost(msg.name, birthday);

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

            gameManager.startGame(msg.roomCode, requester,questionList);

            broadcastToRoom(msg.roomCode, { action: "game_started" });
            break;
          }

          case "answer": {
            const requester = wsToPlayer.get(ws);
            if (!requester) throw new Error("You are not registered yet");

            const room = gameManager.getRoom(msg.roomCode);
            if (!room) throw new Error("Room not found");

            const data: Data = {
              relation: msg.relation,
              a: msg.a,
              b: msg.b,
              answerer: requester.getUUID(),
            };

            room.addData(data);

            broadcastToRoom(msg.roomCode, {
              action: "new_answer",
              data,
            });
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
      if (player) playerIdToWs.delete(player.getUUID());
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
