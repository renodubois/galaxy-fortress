import { Map } from "immutable";
import { deployCard, getCard, initGameState, useCardAction } from "./state";
import type { Player, Sector, SectorNumber } from "./state";
import { STARTER_CARDS, LEVEL_1_CARDS } from "./cards";

const createStarterDeck = (): Player["cards"] => {
  const starterCards: [SectorNumber, Sector][] = STARTER_CARDS.map((c) => [
    c.sector,
    { activeCardId: c.id, flippedCardIds: [] },
  ]);
  return Map(starterCards);
};

let p1: Player = {
  id: 1,
  name: "Reno",
  resources: {
    credit: 0,
    income: 0,
    vp: 0,
  },
  cards: createStarterDeck(),
};
const p2: Player = {
  id: 1,
  name: "Robert",
  resources: {
    credit: 0,
    income: 0,
    vp: 0,
  },
  cards: createStarterDeck(),
};

let state = initGameState([p1, p2]);

// first things first, give players their rewards based on
// turn order & assign starter cards (random level 1 card)

const player1 = state.players[0];
state = useCardAction(state, player1, getCard(state.players[0].cards.get(1)?.activeCardId), "main");

