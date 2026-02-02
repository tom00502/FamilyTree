// GameFlow.ts
import Room from "./Module/Room";
import type Player from "./Module/Player";
import { Status } from "./Module/Status";

export type FlowIO = {
    broadcast: (roomCode: string, msg: any) => void;
};

export default class GameFlow {
    private started = false;
    private ended = false;

    private endAtMs = 0;
    private tickTimer?: NodeJS.Timeout;

    private currentQuestion?: string;

    private readonly questionList: string[]
    private room: Room;
    private io: FlowIO;
    private durationSeconds: number;

    constructor(room: Room, io: FlowIO, questionList: string[], durationSeconds: number = 120) {
        this.room = room;
        this.io = io;
        this.durationSeconds = durationSeconds;
        this.questionList = questionList
    }


    start() {
        if (this.started) return;
        this.started = true;

        this.room.setStatus(Status.Playing);

        this.endAtMs = Date.now() + this.durationSeconds * 1000;

        this.io.broadcast(this.room.getRoomCode(), {
            action: "game_started",
            durationSeconds: this.durationSeconds,
        });

        this.nextQuestion();

        // 每秒 tick（可選）
        this.tickTimer = setInterval(() => {
            const remaining = this.getRemainingSeconds();
            this.io.broadcast(this.room.getRoomCode(), {
                action: "tick",
                remainingSeconds: remaining,
            });

            if (remaining <= 0) {
                this.end();
            }
        }, 1000);
    }

    onAnswer(player: Player, payload: any) {
        if (!this.started || this.ended) return;
        if (this.getRemainingSeconds() <= 0) return;

        this.room.addData({
            relation: payload.relation,
            a: payload.a,
            b: payload.b,
            answerer: player.getUUID(),
        });
        this.nextQuestion();
    }

    private randomQuestion() {
        const idx = Math.floor(Math.random() * this.questionList.length);
        return this.questionList[idx];
    }

    private nextQuestion() {
        if (this.ended) return;
        this.currentQuestion = this.randomQuestion();
        this.io.broadcast(this.room.getRoomCode(), {
            action: "question",
            question: this.currentQuestion,
        });
    }

    private getRemainingSeconds() {
        const ms = this.endAtMs - Date.now();
        return Math.max(0, Math.ceil(ms / 1000));
    }

    end() {
        if (this.ended) return;
        this.ended = true;

        if (this.tickTimer) clearInterval(this.tickTimer);

        this.room.setStatus(Status.Complete);

        // 你可以在這裡做統計結果（例如依 answererId 統計數量）
        const allData = this.room.getAllData();

        const countByPlayer: Record<string, number> = {};
        for (const d of allData) {
            countByPlayer[d.answerer] = (countByPlayer[d.answerer] ?? 0) + 1;
        }

        this.io.broadcast(this.room.getRoomCode(), {
            action: "game_ended",
            data: allData,
            stats: { countByPlayer },
        });
    }
}
