const PASSED_BACKGROUND_COLOR = "#414042";
const ACTIVE_TURN_BACKGROUND_COLOR = "#193a7d";

function capitalizeFirstLetter(string) {
  console.assert(typeof string === "string");
  return string.charAt(0).toUpperCase() + string.slice(1);
}

class Leaderboard {
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

    const strategyCardsDiv = cell.getElementsByClassName("strategy-cards")[0];
    console.assert(strategyCardsDiv);
    strategyCardsDiv.innerHTML = html;
    strategyCardsDiv.style.color = color;
  }

  static fillBackgroundColor(cell, isCurrentTurn, active) {
    console.assert(typeof cell === "object");
    console.assert(typeof isCurrentTurn === "boolean");
    console.assert(typeof active === "boolean");

    let bgColor = "";
    if (isCurrentTurn) {
      bgColor = ACTIVE_TURN_BACKGROUND_COLOR;
    } else if (!active) {
      bgColor = PASSED_BACKGROUND_COLOR;
    }
    cell.style.backgroundColor = bgColor;
  }

  static fillAll(gameData) {
    console.assert(typeof gameData === "object");

    const playerDataArray = GameDataUtil.parsePlayerDataArray(gameData);
    console.assert(Array.isArray(playerDataArray));

    const currentTurnColorName =
      GameDataUtil.parseCurrentTurnColorName(gameData);
    console.assert(typeof currentTurnColorName === "string");

    const playerCount = playerDataArray.length;
    const cells = Leaderboard.getLeaderboardCells(playerCount);

    cells.forEach((cell, index) => {
      const playerData = playerDataArray[index];
      console.assert(playerData);

      const colorNameAndHex = GameDataUtil.parseColor(playerData);
      const faction = GameDataUtil.parseFaction(playerData);
      const playerName = GameDataUtil.parsePlayerName(playerData);
      const score = GameDataUtil.parseScore(playerData);
      const strategyCards = GameDataUtil.parseStrategyCards(playerData);
      const active = GameDataUtil.parseActive(playerData);

      const color = colorNameAndHex.colorHex;
      const isCurrentTurn = colorNameAndHex.colorName === currentTurnColorName;

      Leaderboard.fillFaction(cell, faction, color);
      Leaderboard.fillPlayerName(cell, playerName, color);
      Leaderboard.fillScore(cell, score, color);
      Leaderboard.fillStrategyCards(cell, strategyCards, color);
      Leaderboard.fillBackgroundColor(cell, isCurrentTurn, active);
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
  // Make sure GameDataUtil is available.
  console.assert(GameDataUtil);

  const gameData = {}; // fill with default 6p empty game
  Leaderboard.fillAll(gameData);
});
