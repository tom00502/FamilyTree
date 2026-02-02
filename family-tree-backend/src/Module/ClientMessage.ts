export type ClientMessage =
  | { action: "create_room"; name: string; birthday: Date }
  | { action: "join_room"; roomCode: string; name: string; birthday: Date }
  | { action: "start_game"; roomCode: string }
  | { action: "answer"; roomCode: string; relation: string; a: string; b: string };
