import { Map } from "immutable";
import { ALL_CARDS } from "./cards";
import type { Player } from "./state";
import { activateSector, initGameState } from "./state";

const createStarterDeck = (): Player["cards"] => {
  return Map(
    ALL_CARDS.filter((c) => c.source === "STARTER").map((c) => [
      c.sector,
      { activeCardId: c.id, flippedCardIds: [] },
    ])
  );
};

let p1: Player = {
  id: 1,
  name: "Reno",
  resources: {
    credit: 5,
    income: 0,
    vp: 0,
  },
  cards: createStarterDeck(),
};
const p2: Player = {
  id: 1,
  name: "Robert",
  resources: {
    credit: 5,
    income: 0,
    vp: 0,
  },
  cards: createStarterDeck(),
};

let state = initGameState([p1, p2]);

// first things first, give players their rewards based on
// turn order & assign starter cards (random level 1 card)

const player1 = state.players[0];
console.log(player1.name);
console.log(player1.resources);
state = activateSector(state, player1, 1, "main");
console.log(state.players[0].resources);
