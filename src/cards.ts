import type { Card, GameState, Player } from "./state";
import { modifyResource } from "./state";

const addOneCredit = (state: GameState, player: Player) => {
  return addResource("credit", 1, state, player);
};

const addOneIncome = (s: GameState, p: Player) => {
  return addResource("income", 1, s, p);
};

const addResource = (
  type: keyof Player["resources"],
  num: number,
  state: GameState,
  player: Player
) => {
  return modifyResource(state, player, type, num);
};

export const ALL_CARDS: Card[] = [
  {
    id: 1,
    name: "Starter Card 1",
    cost: 0,
    sector: 1,
    cubes: 0,
    mainAction: addOneCredit,
    flipAction: addOneCredit,
    source: "STARTER",
  },
  {
    id: 2,
    name: "Starter Card 2",
    cost: 0,
    sector: 2,
    cubes: 0,
    mainAction: addOneCredit,
    flipAction: addOneCredit,
    source: "STARTER",
  },
  {
    id: 3,
    name: "Starter Card 3",
    cost: 0,
    sector: 3,
    cubes: 0,
    mainAction: addOneCredit,
    flipAction: addOneCredit,
    source: "STARTER",
  },
  {
    id: 4,
    name: "Starter Card 4",
    cost: 0,
    sector: 4,
    cubes: 0,
    mainAction: addOneCredit,
    flipAction: addOneCredit,
    source: "STARTER",
  },
  {
    id: 5,
    name: "Starter Card 5",
    cost: 0,
    sector: 5,
    cubes: 0,
    mainAction: addOneCredit,
    flipAction: addOneCredit,
    source: "STARTER",
  },
  {
    id: 6,
    name: "Starter Card 6",
    cost: 0,
    sector: 6,
    cubes: 0,
    mainAction: addOneCredit,
    flipAction: addOneCredit,
    source: "STARTER",
  },
  {
    id: 7,
    name: "Starter Card 7",
    cost: 0,
    sector: 7,
    cubes: 0,
    mainAction: (s, p) => addResource("credit", 3, s, p),
    flipAction: (s, p) => addResource("credit", 2, s, p),
    source: "STARTER",
  },
  {
    id: 8,
    name: "Starter Card 8",
    cost: 0,
    sector: 8,
    cubes: 0,
    mainAction: (s, p) => addResource("credit", 3, s, p),
    flipAction: (s, p) => addResource("credit", 2, s, p),
    source: "STARTER",
  },
  {
    id: 9,
    name: "Starter Card 9",
    cost: 0,
    sector: 9,
    cubes: 0,
    mainAction: addOneIncome,
    flipAction: (s, p) => addResource("credit", 3, s, p),
    source: "STARTER",
  },
  {
    id: 10,
    name: "Starter Card 10",
    cost: 0,
    sector: 10,
    cubes: 0,
    mainAction: addOneIncome,
    flipAction: (s, p) => addResource("credit", 3, s, p),
    source: "STARTER",
  },
  {
    id: 11,
    name: "Starter Card 11",
    cost: 0,
    sector: 11,
    cubes: 0,
    mainAction: addOneIncome,
    flipAction: (s, p) => addResource("credit", 4, s, p),
    source: "STARTER",
  },
  {
    id: 12,
    name: "Starter Card 12",
    cost: 0,
    sector: 12,
    cubes: 0,
    mainAction: addOneIncome,
    flipAction: (s, p) => addResource("credit", 5, s, p),
    source: "STARTER",
  },
  {
    id: 13,
    name: "Test Card 1",
    cost: 3,
    sector: 8,
    cubes: 0,
    mainAction: undefined,
    flipAction: undefined,
    source: "LEVEL_1",
  },
  {
    id: 14,
    name: "Old Navy Ship",
    cost: 5,
    sector: 12,
    cubes: 0,
    mainAction: undefined,
    flipAction: undefined,
    source: "LEVEL_1",
  },
];
