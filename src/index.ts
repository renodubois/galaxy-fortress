import { activateSector, createTestGame } from "./state";

let state = createTestGame();

const player1 = state.players[0];
console.log(player1.name);
console.log(player1.resources);
state = activateSector(state, player1, 1, "main");
console.log(state.players[0].resources);
