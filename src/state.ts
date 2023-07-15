import { Map } from "immutable";
import { LEVEL_1_CARDS, LEVEL_2_CARDS, LEVEL_3_CARDS, STARTER_CARDS } from "./cards";
import crypto from "node:crypto";
// basic turn structure
// actions, if any
// dice get rolled
// active player takes their rewards
// each other player takes their rewards, in turn order
// then, active player buys ships
// refill markets
// move active player
export interface GameState {
  players: Player[]; // TODO: for now, just using order here to determine turn order
  activePlayer: Player["id"]; // person who has the dice
  currentPlayer: Player["id"]; // TODO: confusing name. person who is deciding what to do.
  endgame: boolean; // Once someone hits 40vp, this activates. Game ends after a turn cycle.
  shipyards: {
    1: Deck;
    2: Deck;
    3: Deck;
  };
  // shipyards: Card[] // Level 1, 2, 3
  // colonyCards: Card[] // the cards that cap off your sectors and get you VPs.
}

type CardSource = "LEVEL_1" | "LEVEL_2" | "LEVEL_3" | "STARTER";

interface Deck {
  source: CardSource // helps point back to the list of possible cards
  cards: Card["id"][];
}

// TODO: figure out colony card support here
export interface Card {
  id: number;
  name: string;
  cost: number;
  sector: SectorNumber;
  source: CardSource
  cubes: number; // this might be optional? only some cards can get cubes
  mainAction: ((state: GameState, player: Player) => GameState) | null; // TODO: | null is temporary
  flipAction: unknown;
}

export interface Level1Card extends Card {
  source: "LEVEL_1"
}

export interface Level2Card extends Card {
  source: "LEVEL_2"
}

export interface Level3Card extends Card {
  source: "LEVEL_3"
}

export interface StarterCard extends Card {
  source: "STARTER"
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
  cards: Map<SectorNumber, Sector>;
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
  player: Player,
  newPlayer: Partial<Player>
): GameState {
  const index = getPlayerIndex(state, player)
  const newPlayers = [...state.players];
  newPlayers[index] = { ...newPlayers[index], ...newPlayer };
  return modifyState(state, { players: newPlayers });
}

// Will add the amount to that resource - use negative for subtraction
export function modifyResource(state: GameState, player: Player, type: keyof Player["resources"], amount: number) {
	const resources = { ...player.resources };
	resources[type] += amount;
	return modifyPlayer(state, player, { resources });
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
  let state = {
    players,
    activePlayer: players[0].id,
    currentPlayer: players[0].id,
    endgame: false,
    shipyards: {
      1: makeDeck("LEVEL_1"),
      2: makeDeck("LEVEL_2"),
      3: makeDeck("LEVEL_3"),
    },
  };
  // Some initial state modifications - starting cards & resources
  for (let i = 0; i < state.players.length; i++) {
    const player = state.players[i];
	if (i !== 0) {
		switch (i) {
			case 1:
			
		}
	}

    const [startingCard, newLevel1Deck] = drawFromDeck(state.shipyards[1]);
    state = deployCard(state, player, startingCard);
	state = modifyResource(state, player, "credit", (startingCard.cost * -1))
    state = modifyState(state, {
      shipyards: { ...state.shipyards, 1: newLevel1Deck },
    });
  }
  return state;
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
  return modifyPlayer(state, player, {
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
    case "STARTER":
      return STARTER_CARDS;
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

export function getCard(id: Card["id"], source: Deck["source"]) {
  let sourceData = getDeckSourceData(source);
  const card = sourceData.find((c) => c.id === id);
  if (!card) {
    // TODO: probably need a better case for this, but panic for now
    throw new Error("card not found: " + id);
  }
  return card;
}

function drawFromDeck(deck: Deck): [Card, Deck] {
  const i = crypto.randomInt(deck.cards.length);
  const newCards = [...deck.cards];
  newCards.splice(i, 1);
  return [getCard(deck.cards[i], deck.source), { ...deck, cards: newCards }];
}

export function getPlayerIndex(state: GameState, player: Player): number {
  return state.players.findIndex((p) => p.id === player.id);
}

export function useCardAction(state: GameState, player: Player, card: Card, type: "main" | "flip"): GameState {
  if (type === "main") {
    return card.mainAction!(state, player);
  } else if (type === "flip") {
    console.error("not implemented yet");
    return state;
  } else {
    return state;
  }
}