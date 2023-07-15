import { Map } from "immutable";
import { LEVEL_1_CARDS, LEVEL_2_CARDS, LEVEL_3_CARDS } from "./cards";
import crypto from "node:crypto";
// basic turn structure
// actions, if any
// dice get rolled
// active player takes their rewards
// each other player takes their rewards, in turn order
// then, active player buys ships
// refill markets
// move active player
interface GameState {
  players: Player[]; // TODO: for now, just using order here to determine turn order
  activePlayer: Player["id"]; // person who has the dice
  currentPlayer: Player["id"]; // TODO: confusing name. person who is deciding what to do.
  endgame: boolean; // Once someone hits 40vp, this activates. Game ends after a turn cycle.
  // shipyards: Card[] // Level 1, 2, 3
  // colonyCards: Card[] // the cards that cap off your sectors and get you VPs.
}

interface Deck {
  source: "LEVEL_1" | "LEVEL_2" | "LEVEL_3"; // helps point back to the list of possible cards
  cards: Card["id"][];
}

// TODO: figure out colony card support here
export interface Card {
  id: number;
  name: string;
  cost: number;
  sector: SectorNumber;
  cubes: number; // this might be optional? only some cards can get cubes
  mainAction: unknown;
  flipAction: unknown;
}

export type SectorNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface Sector {
  activeCardId: Card["id"];
  flippedCardIds: Card["id"][];
}

export interface Player {
  id: number;
  name: string;
  resources: {
    credit: number;
    income: number;
    vp: number;
  };
  cards: Map<SectorNumber, Sector>; // length 12
}

// the state object of the game should be available, but is read only
// to modify the state, what you're actually doing is creating a brand new state variable, and setting the old one equal to it.

export function modifyState(
  state: GameState,
  newState: Partial<GameState>
): GameState {
  return { ...state, ...newState };
}

export function modifyPlayer(
  state: GameState,
  index: number,
  newPlayer: Partial<Player>
): GameState {
  const { players } = state;
  const newPlayers = [...players];
  newPlayers[index] = { ...newPlayers[index], ...newPlayer };
  return modifyState(state, { players: newPlayers });
}

export function setActivePlayer(state: GameState, id: Player["id"]): GameState {
  return modifyState(state, { activePlayer: id });
}

export function setCurrentPlayer(
  state: GameState,
  id: Player["id"]
): GameState {
  return modifyState(state, { currentPlayer: id });
}

export function initGameState(players: Player[]): GameState {
  // TODO: randomize player order, assign extra stuff for non-first player
  return {
    players,
    activePlayer: players[0].id,
    currentPlayer: players[0].id,
    endgame: false,
  };
}

export function deployCard(
  state: GameState,
  player: Player,
  card: Card,
  sector?: SectorNumber
): GameState {
  sector = sector ?? card.sector;
  const { cards } = player;
  const oldSector = cards.get(sector, {
    activeCardId: 0,
    flippedCardIds: [],
  } as Sector);
  return modifyPlayer(state, state.players.indexOf(player), {
    cards: cards.set(sector, {
      activeCardId: card.id,
      flippedCardIds: [...oldSector.flippedCardIds, oldSector.activeCardId],
    }),
  });
}

function getDeckSourceData(source: Deck["source"]): Card[] {
  switch (source) {
    case "LEVEL_1":
      return LEVEL_1_CARDS;
    case "LEVEL_2":
      return LEVEL_2_CARDS;
    case "LEVEL_3":
      return LEVEL_3_CARDS;
  }
}

function makeDeck(source: Deck["source"]): Deck {
  let cards: Card["id"][] = [];
  let sourceDeck = getDeckSourceData(source);
  cards = sourceDeck.map((c) => c.id);
  return {
    source,
    cards,
  };
}

function getCard(id: Card["id"], source: Deck["source"]) {
  let sourceData = getDeckSourceData(source);
  const card = sourceData.find((c) => c.id === id);
  if (!card) {
    // TODO: probably need a better case for this, but panic for now
    throw new Error("card not found: " + id);
  }
  return card;
}

function drawFromDeck(deck: Deck): [Card, Deck] {
  const i = crypto.randomInt(deck.cards.length - 1);
  const newCards = [...deck.cards];
  newCards.splice(i);
  return [getCard(deck.cards[i], deck.source), { ...deck, cards: newCards }];
}
