import express from "express";
import { createTestGame } from "./state";

const app = express();
const port = 3000;

const state = createTestGame();

app.get("/", (req, res) => {
  return res.send(state);
});

app.listen(port, "localhost", () => {
  console.log("Server running on port " + port);
});
