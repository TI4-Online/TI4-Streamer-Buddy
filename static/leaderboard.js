const FACTION_WHITELIST = new Set([
  "arborec",
  "argent",
  "bobert",
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
const UNKNOWN_FACTION = "bobert";

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
const UNKNOWN_COLOR = "#ffffff";
const PASSED_BACKGROUND_COLOR = "#414042";
const ACTIVE_TURN_BACKGROUND_COLOR = "#193a7d";

/**
 * Escape any characters for a "in-HTML friendly" string.
 *
 * @param {string} string
 * @returns {string}
 */
function escapeForHTML(string) {
  console.assert(typeof string === "string");
  const div = document.createElement("div");
  div.innerText = string;
  return div.innerHTML;
}

function capitalizeFirstLetter(string) {
  console.assert(typeof string === "string");
  return string.charAt(0).toUpperCase() + string.slice(1);
}

class Leaderboard {
  static parseColor(playerData) {
    console.assert(typeof playerData === "object");

    const colorName = playerData.colorActual.toLowerCase();
    const color = COLOR_NAME_TO_HEX[colorName];
    return color ? color : UNKNOWN_COLOR;
  }

  /**
   * Parse faction name.
   *
   * @param {Object.{factionShort:string}} playerData
   * @returns {string}
   */
  static parseFaction(playerData) {
    console.assert(typeof playerData === "object");

    let faction = playerData?.factionShort?.toLowerCase() || "-";
    console.assert(typeof faction === "string");

    faction = faction.replace("-", ""); // naaz-rokha
    if (faction.startsWith("keleres")) {
      faction = "keleres"; // strip off flavor
    }

    return FACTION_WHITELIST.has(faction) ? faction : UNKNOWN_FACTION;
  }

  /**
   * Parse player name.
   *
   * @param {Object.{steamName:string}} playerData
   * @returns {string}
   */
  static parsePlayerName(playerData) {
    console.assert(typeof playerData === "object");

    const playerName = playerData?.steamName || "-";
    console.assert(typeof playerName === "string");

    return escapeForHTML(playerName);
  }

  /**
   * Parse score.
   *
   * @param {Object.{score:number}} playerData
   * @returns {number}
   */
  static parseScore(playerData) {
    console.assert(typeof playerData === "object");

    let score = playerData?.score || 0;
    console.assert(typeof score === "number");

    return score;
  }

  /**
   * Parse active (not passed).
   *
   * @param {Object.{active:boolean}} playerData
   * @returns {boolean}
   */
  static parseActive(playerData) {
    console.assert(typeof playerData === "object");

    let active = playerData?.active || true;
    console.assert(typeof active === "boolean");

    return active;
  }

  /**
   * Parse strategy cards with face-up/down status.
   *
   * @param {Object.{strategyCards:Array.{string},strategyCardsFaceDown:Array.{string}}} playerData
   * @returns {Array.{Object.{name:string,faceDown:boolean}}}
   */
  static parseStrategyCards(playerData) {
    console.assert(typeof playerData === "object");

    let strategyCards = playerData?.strategyCards || [];
    console.assert(Array.isArray(strategyCards));
    strategyCards = strategyCards.map((name) => escapeForHTML(name));

    let faceDown = playerData?.strategyCardsFaceDown || [];
    console.assert(Array.isArray(faceDown));
    faceDown = faceDown.map((name) => escapeForHTML(name));

    return strategyCards.map((name) => {
      return { name, faceDown: faceDown.includes(name) };
    });
  }

  /**
   * Return an array of table cells for the given player count.
   * Mark the cells visibile, hide any extra.
   *
   * @param {number} playerCount
   * @return {Array.{object}}
   */
  static getLeaderboardCells(playerCount) {
    console.assert(typeof playerCount === "number");

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

  static fillFaction(cell, faction, color) {
    console.assert(typeof cell === "object");
    console.assert(typeof faction === "string");
    console.assert(typeof color === "string");

    console.assert(FACTION_WHITELIST.has(faction), `bad faction ${faction}`);

    const factionIconImg = cell.getElementsByClassName("faction-icon")[0];
    console.assert(factionIconImg);
    factionIconImg.src = `/static/faction-icons/${faction}_icon.png`;

    const factionNameDiv = cell.getElementsByClassName("faction-name")[0];
    console.assert(factionNameDiv);
    factionNameDiv.textContent = capitalizeFirstLetter(faction);
    factionNameDiv.style.color = color;
  }

  static fillPlayerName(cell, playerName, color) {
    console.assert(typeof cell === "object");
    console.assert(typeof playerName === "string");
    console.assert(typeof color === "string");

    const playerNameDiv = cell.getElementsByClassName("player-name")[0];
    console.assert(playerNameDiv);
    playerNameDiv.textContent = playerName;
    playerNameDiv.style.color = color;
  }

  static fillScore(cell, score, color) {
    console.assert(typeof cell === "object");
    console.assert(typeof score === "number");
    console.assert(typeof color === "string");

    const scoreDiv = cell.getElementsByClassName("score")[0];
    console.assert(scoreDiv);
    scoreDiv.textContent = score.toString();
    scoreDiv.style.color = color;
  }

  static fillStrategyCards(cell, strategyCards, color) {
    console.assert(typeof cell === "object");
    console.assert(Array.isArray(strategyCards));
    console.assert(typeof color === "string");

    // Use strikethrough for played strategy cards, thus generate
    // HTML instead of text.
    const html = strategyCards
      .map((data) => {
        const name = capitalizeFirstLetter(data.name);
        return data.faceDown ? `<s><i>&nbsp;${name}&nbsp;</i></s>` : name;
      })
      .join(", ");

    const strategyCardsDiv = cell.getElementsByClassName("score")[0];
    console.assert(strategyCardsDiv);
    strategyCardsDiv.innerHTML = html;
    strategyCardsDiv.style.color = color;
  }

  static fillBackgroundColor(cell, currentTurn, color, active) {
    console.assert(typeof cell === "object");
    console.assert(typeof currentTurn === "string");
    console.assert(typeof color === "string");
    console.assert(typeof active === "boolean");

    // Current turn is the color name.  Convert to hex for comparison.
    const current = COLOR_NAME_TO_HEX[currentTurn.toLowerCase()];

    let bgColor = "";
    if (current === color) {
      bgColor = ACTIVE_TURN_BACKGROUND_COLOR;
    } else if (!active) {
      bgColor = PASSED_BACKGROUND_COLOR;
    }
    cell.style.backgroundColor = bgColor;
  }

  static fillAll(gameData) {
    console.assert(typeof gameData === "object");

    const playerDataArray = gameData.players || [];
    console.assert(Array.isArray(playerDataArray));

    const currentTurn = gameData.turn || "none";
    console.assert(typeof currentTurn === "string");

    const playerCount = playerDataArray.length;
    const cells = Leaderboard.getLeaderboardCells(playerCount);

    cells.forEach((cell, index) => {
      const playerData = playerDataArray[index];
      console.assert(playerData);

      const color = Leaderboard.parseColor(playerData);
      const faction = Leaderboard.parseFaction(playerData);
      const playerName = Leaderboard.parsePlayerName(playerData);
      const score = Leaderboard.parseScore(playerData);
      const strategyCards = Leaderboard.parseStrategyCards(playerData);
      const active = Leaderboard.parseActive(playerData);

      Leaderboard.fillFaction(cell, faction, color);
      Leaderboard.fillPlayerName(cell, playerName, color);
      Leaderboard.fillScore(cell, score, color);
      Leaderboard.fillStrategyCards(cell, strategyCards, color);
      Leaderboard.fillBackgroundColor(cell, currentTurn, color, active);
    });
  }
}

// Listen for game data updates, fill leaderboard.
window.addEventListener("onGameDataUpdate", (event) => {
  console.log(`refresh-leaderboard onGameDataUpdate ${event.detail.timestamp}`);
  Leaderboard.fillAll(event.detail);
});

// Run with the standard value until told otherwise.
window.addEventListener("load", () => {
  const gameData = {
    players: ["white", "blue", "purple", "yellow", "red", "green"].map(
      (color) => {
        return { colorActual: color };
      }
    ),
  };
  Leaderboard.fillAll(gameData);
});
