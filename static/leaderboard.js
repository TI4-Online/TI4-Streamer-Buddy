const FACTION_WHITELIST = new Set([
  "arborec",
  "argent",
  "creuss",
  "empyrean",
  "hacan",
  "jolnar",
  "keleres",
  "l1z1x",
  "letnev",
  "mahact",
  "mentak",
  "muaat",
  "naalu",
  "naazrokha",
  "nekro",
  "nomad",
  "norr",
  "saar",
  "sol",
  "ul",
  "vuilraith",
  "winnu",
  "xxcha",
  "yin",
  "yssaril",
]);
const DEFAULT_FACTION = "bobert";

const COLOR_NAME_TO_HEX = {
  white: "#FFFFFF",
  blue: "#6EC1E4",
  purple: "#9161a8",
  yellow: "#ffde17",
  red: "#e46d72",
  green: "#00a14b",
  orange: "#FF781F",
  pink: "#FF69B4",
};
const DEFAULT_COLOR = "#ffffff";
const PASSED_BACKGROUND_COLOR = "#414042";
const ACTIVE_TURN_BACKGROUND_COLOR = "#193a7d";

function escapeForHTML(string) {
  const div = document.createElement("div");
  div.innerText = string;
  return div.innerHTML;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Return an array of table cells for the given player count.
 * Hides any extras.
 *
 * @param {number} playerCount
 */
function getLeaderboardCells(playerCount) {
  const upper = [
    document.getElementById("leaderboard-0-0"),
    document.getElementById("leaderboard-0-1"),
    document.getElementById("leaderboard-0-2"),
    document.getElementById("leaderboard-0-3"),
  ];
  const lower = [
    document.getElementById("leaderboard-1-3"),
    document.getElementById("leaderboard-1-2"),
    document.getElementById("leaderboard-1-1"),
    document.getElementById("leaderboard-1-0"),
  ];

  const lowerCount = Math.min(Math.floor(playerCount / 2), 4);
  const upperCount = Math.min(Math.ceil(playerCount / 2), 4);

  // Extract the leaderboard cells, clockwise from
  // lower right.
  const result = [];
  result.push(...lower.slice(0, lowerCount));
  result.push(...upper.slice(0, upperCount));
  result.forEach((cell) => {
    cell.style.display = "";
  });

  // Any unused cells should be hidden.
  const hide = [];
  hide.push(...lower.slice(lowerCount));
  hide.push(...upper.slice(upperCount));
  hide.forEach((cell) => {
    cell.style.display = "none";
  });

  return result;
}

function fillLeaderboardCell(cell, playerData, currentTurn) {
  // Validate (or escape) all values before using them.
  let factionName = DEFAULT_FACTION;
  let candidate = playerData.factionShort.toLowerCase();
  candidate = candidate.replace("-", "");
  if (candidate.startsWith("keleres")) {
    candidate = "keleres";
  }
  if (FACTION_WHITELIST.has(candidate)) {
    factionName = candidate;
  }
  factionName = factionName.toUpperCase();

  let color = DEFAULT_COLOR;
  candidate = playerData.colorActual.toLowerCase();
  candidate = COLOR_NAME_TO_HEX[candidate];
  if (candidate) {
    color = candidate;
  }

  let score = 0;
  candidate = playerData.score;
  if (typeof candidate === "number") {
    score = candidate;
  }

  const strategyCards = playerData.strategyCards.map((name) =>
    escapeForHTML(name)
  );
  const strategyCardsFaceDown = playerData.strategyCardsFaceDown.map((name) =>
    escapeForHTML(name)
  );

  const playerName = escapeForHTML(playerData.steamName);
  const isCurrentTurn =
    playerData.colorActual.toLowerCase() === currentTurn.toLowerCase();
  const isPassed = playerData.active ? false : true;

  // Now that everything is validated, fill in the cell content.
  let backgroundColor = undefined;
  if (isCurrentTurn) {
    backgroundColor = ACTIVE_TURN_BACKGROUND_COLOR;
  } else if (isPassed) {
    backgroundColor = PASSED_BACKGROUND_COLOR;
  }
  cell.style.backgroundColor = backgroundColor;

  const factionIconImg = cell.getElementsByClassName("faction-icon")[0];
  factionIconImg.src = `/static/faction-icons/${factionName}_icon.png`;

  const factionNameDiv = cell.getElementsByClassName("faction-name")[0];
  factionNameDiv.textContent = capitalizeFirstLetter(factionName);
  factionNameDiv.style.color = color;

  const playerNameDiv = cell.getElementsByClassName("player-name")[0];
  playerNameDiv.textContent = playerName;
  playerNameDiv.style.color = color;

  const strategyCardsDiv = cell.getElementsByClassName("strategy-cards")[0];
  strategyCardsDiv.innerHTML = strategyCards
    .map((name) => {
      name = capitalizeFirstLetter(name);
      if (strategyCardsFaceDown.includes(name)) {
        return `<s><i>&nbsp;${name}&nbsp;</i></s>`;
      }
      return name;
    })
    .join(", ");
  strategyCardsDiv.style.color = color;

  const scoreDiv = cell.getElementsByClassName("score")[0];
  console.log(score);
  scoreDiv.textContent = `${score}`;
  scoreDiv.style.color = color;
}

function demo() {
  const DEMO = [
    {
      active: true,
      colorActual: "White",
      factionShort: "Naalu",
      steamName: "SCPT Matt",
      strategyCards: ["Construction"],
      strategyCardsFaceDown: ["Construction"],
      score: 9,
    },
    {
      active: true,
      colorActual: "Blue",
      factionShort: "Hacan",
      steamName: "Squeamish_Emu",
      strategyCards: ["Trade"],
      strategyCardsFaceDown: ["Trade"],
      score: 8,
    },
    {
      active: true,
      colorActual: "Purple",
      factionShort: "Nomad",
      steamName: "Absol197",
      strategyCards: ["Imperial"],
      strategyCardsFaceDown: [],
      score: 7,
    },
    {
      active: true,
      colorActual: "Yellow",
      factionShort: "Keleres - Xxcha",
      steamName: "Baldrick",
      strategyCards: ["Leadership"],
      strategyCardsFaceDown: [],
      score: 6,
    },
    {
      active: false,
      colorActual: "Red",
      factionShort: "Empyrean",
      steamName: "wehby",
      strategyCards: ["Politics"],
      strategyCardsFaceDown: [],
      score: 8,
    },
    {
      active: false,
      colorActual: "Green",
      factionShort: "Argent",
      steamName: "Karnal",
      strategyCards: ["Technology"],
      strategyCardsFaceDown: [],
      score: 8,
    },
  ];
  getLeaderboardCells(6).forEach((cell, index) => {
    fillLeaderboardCell(cell, DEMO[index], "White");
  });
}

// Listen for game data updates, fill leaderboard.
window.addEventListener("onGameDataUpdate", (event) => {
  console.log(`refresh-leaderboard onGameDataUpdate ${event.detail.timestamp}`);
  const players = event.detail.players;
  console.log(`|players|=${players.length}`);
  const cells = getLeaderboardCells(players.length);
  players.forEach((playerData, index) => {
    const cell = cells[index];
    if (cell) {
      fillLeaderboardCell(cell, playerData, event.detail.turn);
    }
  });
});

// Run with the standard value until told otherwise.
window.addEventListener("load", () => {
  colors = ["white", "blue", "purple", "yellow", "red", "green"];
  getLeaderboardCells(6).forEach((cell, index) => {
    fillLeaderboardCell(
      cell,
      {
        active: true,
        colorActual: colors[index],
        factionShort: "-",
        steamName: "Player Name",
        strategyCards: ["Strategy Card"],
        strategyCardsFaceDown: [],
        score: 0,
      },
      "-"
    );
    demo();
  });
});
