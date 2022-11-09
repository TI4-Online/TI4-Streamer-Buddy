const assert = require("assert");
const fs = require("fs");
const path = require("path");

const { GameDataUtil } = require("./game-data-util");

// The escape function relies on browser features.
GameDataUtil.escapeForHTML = (string) => {
  return string;
};

function getGameData() {
  const filename = path.join(__dirname, "demo.json");
  const content = fs.readFileSync(filename).toString();
  return JSON.parse(content);
}

it("getGameData", () => {
  const gameData = getGameData();
  assert.equal(gameData.timestamp, 1614604996);
});

it("parsePlayerDataArray", () => {
  const gameData = getGameData();
  const playerDataArray = GameDataUtil.parsePlayerDataArray(gameData);
  assert.equal(playerDataArray.length, 6);
  assert.equal(playerDataArray[0].score, 4);
});

it("parseCurrentTurnColorName", () => {
  const gameData = getGameData();
  const currentTurn = GameDataUtil.parseCurrentTurnColorName(gameData);
  assert.equal(currentTurn, "white");
});

it("parseColor", () => {
  const gameData = getGameData();
  const playerDataArray = GameDataUtil.parsePlayerDataArray(gameData);
  const color = GameDataUtil.parseColor(playerDataArray[0]);
  assert.equal(color.colorName, "white");
});

it("parseFaction", () => {
  const gameData = getGameData();
  const playerDataArray = GameDataUtil.parsePlayerDataArray(gameData);
  const faction = GameDataUtil.parseFaction(playerDataArray[0]);
  assert.equal(faction, "ul");
});

it("parsePlayerName", () => {
  const gameData = getGameData();
  const playerDataArray = GameDataUtil.parsePlayerDataArray(gameData);
  const playerName = GameDataUtil.parsePlayerName(playerDataArray[0]);
  assert.equal(playerName, "hello is my name");
});

it("parseScore", () => {
  const gameData = getGameData();
  const playerDataArray = GameDataUtil.parsePlayerDataArray(gameData);
  const score = GameDataUtil.parseScore(playerDataArray[0]);
  assert.equal(score, 4);
});

it("parseActive", () => {
  const gameData = getGameData();
  const playerDataArray = GameDataUtil.parsePlayerDataArray(gameData);
  const active = GameDataUtil.parseActive(playerDataArray[0]);
  assert.equal(active, true);
});

it("parseStrategyCards", () => {
  const gameData = getGameData();
  const playerDataArray = GameDataUtil.parsePlayerDataArray(gameData);
  const strategyCards = GameDataUtil.parseStrategyCards(playerDataArray[0]);
  assert.deepEqual(strategyCards, [{ faceDown: false, name: "Leadership" }]);
});

it("parseObjectives", () => {
  const gameData = getGameData();
  const playerDataArray = GameDataUtil.parsePlayerDataArray(gameData);
  const objectives = GameDataUtil.parseObjectives(gameData);
  assert.deepEqual(objectives, {
    custodians: [{ name: "custodians", scoredBy: ["purple", "purple"] }],
    other: [
      { name: "Seed of an Empire", scoredBy: ["yellow"] },
      { name: "Shard of the Throne", scoredBy: ["white"] },
    ],
    secret: [
      { name: "Strengthen Bonds", scoredBy: ["purple"] },
      { name: "Demonstrate Your Power", scoredBy: ["red"] },
      { name: "Learn the Secrets of the Cosmos", scoredBy: ["green"] },
      { name: "Prove Endurance", scoredBy: ["yellow"] },
      { name: "Mechanize the Military", scoredBy: ["red"] },
      { name: "Establish Hegemony", scoredBy: ["green"] },
      { name: "Hoard Raw Materials", scoredBy: ["blue"] },
      { name: "Mine Rare Minerals", scoredBy: ["yellow"] },
      { name: "Forge an Alliance", scoredBy: [] },
      { name: "Become the Gatekeeper", scoredBy: [] },
      { name: "Foster Cohesion", scoredBy: [] },
      { name: "Seize an Icon", scoredBy: [] },
      { name: "Fight with Precision", scoredBy: [] },
      { name: "Establish a Perimeter", scoredBy: [] },
      { name: "Master the Laws of Physics", scoredBy: [] },
      { name: "Become a Martyr", scoredBy: [] },
      { name: "Darken the Skies", scoredBy: [] },
    ],
    sftt: [
      { name: "Support for the Throne (Blue)", scoredBy: ["yellow"] },
      { name: "Support for the Throne (Purple)", scoredBy: ["blue"] },
      { name: "Support for the Throne (Red)", scoredBy: ["yellow"] },
      { name: "Support for the Throne (Yellow)", scoredBy: ["red"] },
      { name: "Support for the Throne (Green)", scoredBy: ["white"] },
      { name: "Support for the Throne (White)", scoredBy: ["green"] },
    ],
    stage1: [
      {
        name: "Diversify Research",
        scoredBy: ["blue", "purple", "yellow", "red", "green"],
      },
      { name: "Improve Infrastructure", scoredBy: ["white", "red", "green"] },
      { name: "Explore Deep Space", scoredBy: ["purple", "yellow"] },
      { name: "Make History", scoredBy: ["blue", "purple", "yellow", "green"] },
      {
        name: "Raise a Fleet",
        scoredBy: ["white", "blue", "purple", "yellow", "red"],
      },
    ],
    stage2: [{ name: "Reclaim Ancient Monuments", scoredBy: ["yellow"] }],
  });
});
