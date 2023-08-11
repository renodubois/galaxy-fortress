import { Map } from "immutable";
import crypto, { randomInt } from "node:crypto";
import { ALL_CARDS } from "./cards";
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
  dice: [number, number];
  // shipyards: Card[] // Level 1, 2, 3
  // colonyCards: Card[] // the cards that cap off your sectors and get you VPs.
}

type CardSource = "LEVEL_1" | "LEVEL_2" | "LEVEL_3" | "STARTER" | "COLONY";

interface Deck {
  source: CardSource; // helps point back to the list of possible cards
  cards: Card["id"][];
}

// TODO: figure out colony card support here
export interface Card {
  id: number;
  name: string;
  cost: number;
  sector: SectorNumber;
  source: CardSource;
  cubes: number; // this might be optional? only some cards can get cubes
  mainAction?: (state: GameState, player: Player) => GameState;
  flipAction?: (state: GameState, player: Player) => GameState;
}

export interface Level1Card extends Card {
  source: "LEVEL_1";
}

export interface Level2Card extends Card {
  source: "LEVEL_2";
}

export interface Level3Card extends Card {
  source: "LEVEL_3";
}

export interface StarterCard extends Card {
  source: "STARTER";
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
  const index = getPlayerIndex(state, player);
  const newPlayers = [...state.players];
  newPlayers[index] = { ...newPlayers[index], ...newPlayer };
  return modifyState(state, { players: newPlayers });
}

// Will add the amount to that resource - use negative for subtraction
export function modifyResource(
  state: GameState,
  player: Player,
  type: keyof Player["resources"],
  amount: number
) {
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
  let state: GameState = {
    players: shuffle(players),
    activePlayer: players[0].id,
    currentPlayer: players[0].id,
    endgame: false,
    shipyards: {
      1: makeDeck("LEVEL_1"),
      2: makeDeck("LEVEL_2"),
      3: makeDeck("LEVEL_3"),
    },
    dice: [1, 1],
  };
  // Some initial state modifications - starting cards & resources
  for (let i = 0; i < state.players.length; i++) {
    // TODO(reno): extra credits/income if you don't go first.
    if (i > 0) {
      switch (i) {
        case 1:
          state = modifyResource(state, state.players[i], "credit", 1);
          break;
        case 2:
          state = modifyResource(state, state.players[i], "credit", 2);
          break;
        default:
          state = modifyResource(state, state.players[i], "income", 1);
      }
    }

    const player = state.players[i];

    const [startingCard, newLevel1Deck] = drawFromDeck(state.shipyards[1]);
    console.log(
      `Adding starting card for player ${player.name}: ${startingCard.name} (cost ${startingCard.cost})`
    );
    state = deployCard(state, player, startingCard);
    state = modifyResource(state, player, "credit", startingCard.cost * -1);
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

function makeDeck(source: Deck["source"]): Deck {
  let cards: Card["id"][] = [];
  cards = ALL_CARDS.filter((c) => c.source === source).map((c) => c.id);
  return {
    source,
    cards,
  };
}

export function getCard(id: Card["id"]) {
  const card = ALL_CARDS.find((c) => c.id === id);
  if (!card) {
    // TODO: probably need a better case for this, but panic for now
    throw new Error("card not found: " + id);
  }
  return card;
}

export function getCards(ids: Card["id"][]) {
  return ALL_CARDS.filter((c) => ids.includes(c.id));
}

function drawFromDeck(deck: Deck): [Card, Deck] {
  const i = crypto.randomInt(deck.cards.length);
  const newCards = [...deck.cards];
  newCards.splice(i, 1);
  return [getCard(deck.cards[i]), { ...deck, cards: newCards }];
}

export function getPlayerIndex(state: GameState, player: Player): number {
  return state.players.findIndex((p) => p.id === player.id);
}

export function createStarterDeck(): Player["cards"] {
  return Map(
    ALL_CARDS.filter((c) => c.source === "STARTER").map((c) => [
      c.sector,
      { activeCardId: c.id, flippedCardIds: [] },
    ])
  );
}

export function createTestGame() {
  const p1: Player = {
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
    id: 2,
    name: "Robert",
    resources: {
      credit: 5,
      income: 0,
      vp: 0,
    },
    cards: createStarterDeck(),
  };

  return initGameState([p1, p2]);
}

export function useCardAction(
  state: GameState,
  player: Player,
  cards: Card[],
  type: "main" | "flip"
): GameState {
  if (type === "main") {
    // TODO: make sure array len > 1 before doing this
    if (cards[0]?.mainAction) {
      return cards[0].mainAction(state, player);
    } else {
      // TODO: no main action is a major problem
      return state;
    }
  } else {
    console.error("not implemented yet");
    return state;
  }
}

export function activateSector(
  state: GameState,
  player: Player,
  sector: SectorNumber,
  type: "main" | "flip"
): GameState {
  if (type === "main") {
    const cardId = player.cards.get(sector)?.activeCardId;
    if (cardId) {
      const card = getCard(cardId);
      return useCardAction(state, player, [card], type);
    } else {
      throw new Error("no card found with id " + cardId);
    }
  } else {
    // TODO: make getCard bulk or have a bulk getCards?
    const cardIds = player.cards.get(sector)?.flippedCardIds;
    if (cardIds) {
      const cardsToActivate = getCards(cardIds);
      useCardAction(state, player, cardsToActivate, type);
    } else {
      throw new Error("no cards found for flipped sector " + sector);
    }
    console.error("Not implemented yet!");
    return state;
  }
}

export function rollDice(s: GameState): GameState {
  return {
    ...s,
    dice: [randomInt(1, 7), randomInt(1, 7)],
  };
}

export function doTurn(s: GameState): GameState {
  // roll dice
  s = rollDice(s);

  // prompt activePlayer to make a choice as to what they want to do

  // then, go through every other player and give them the choice to do flip actions
  // re-assign activePlayer
  return s;
}

export function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const k = items[i];
    items[i] = items[j];
    items[j] = k;
  }
  return items;
}
