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
const UNKNOWN_COLOR_NAME = "-";
const UNKNOWN_COLOR_HEX = "#ffffff";

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

/**
 * This class parses data from the game-provided json.  It validates against
 * whitelists when possible, and escapes strings when not (e.g. player name).
 */
class GameDataUtil {
  /**
   * Escape any characters for a "in-HTML friendly" string.
   *
   * @param {string} string
   * @returns {string}
   */
  static escapeForHTML(string) {
    console.assert(typeof string === "string");
    const div = document.createElement("div");
    div.innerText = string;
    return div.innerHTML;
  }

  /**
   * Extract the player data array, in clockwise player order from lower right.
   *
   * @param {Object.{playerData.Array.{Object}}} gameData
   * @returns {Array.{Object}}
   */
  static parsePlayerDataArray(gameData) {
    let playerDataArray = gameData?.players;

    // If called without gamedata, provide the default 6-player minimal array.
    if (!playerDataArray) {
      playerDataArray = [
        "white",
        "blue",
        "purple",
        "yellow",
        "red",
        "green",
      ].map((color) => {
        return { colorActual: color };
      });
    }

    console.assert(Array.isArray(playerDataArray));
    return playerDataArray;
  }

  /**
   * Parse current turn color name from overall game data.
   *
   * @param {Object.{turn:string}} gameData
   * @returns {string}
   */
  static parseCurrentTurnColorName(gameData) {
    console.assert(typeof gameData === "object");

    const currentTurn = gameData?.turn?.toLowerCase() || "none";
    console.assert(typeof currentTurn === "string");

    return COLOR_NAME_TO_HEX[currentTurn] ? currentTurn : UNKNOWN_COLOR_NAME;
  }

  /**
   * Parse color as hex value.
   *
   * @param {Object.{colorActual:string}} playerData
   * @returns {Object.{colorName:string,colorHex:string}}
   */
  static parseColor(playerData) {
    console.assert(typeof playerData === "object");

    let colorName = playerData?.colorActual?.toLowerCase();
    if (!colorName) {
      colorName = playerData?.color.toLowerCase();
    }
    let colorHex = COLOR_NAME_TO_HEX[colorName];
    if (!colorHex) {
      colorName = UNKNOWN_COLOR_NAME;
      colorHex = UNKNOWN_COLOR_HEX;
    }
    return { colorName, colorHex };
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

    return GameDataUtil.escapeForHTML(playerName);
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

    let active = playerData?.active;
    if (active === undefined) {
      active = true;
    }
    console.assert(typeof active === "boolean");

    console.log(`active: ${active}`);

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
    strategyCards = strategyCards.map((name) =>
      GameDataUtil.escapeForHTML(name)
    );

    let faceDown = playerData?.strategyCardsFaceDown || [];
    console.assert(Array.isArray(faceDown));
    faceDown = faceDown.map((name) => GameDataUtil.escapeForHTML(name));

    return strategyCards.map((name) => {
      return { name, faceDown: faceDown.includes(name) };
    });
  }

  /**
   * Parse objectives by type and who scored.
   *
   * @param {Object} gameData
   * @returns {Object} objectives
   */
  static parseObjectives(gameData) {
    console.assert(typeof gameData === "object");

    const objectives = {
      stage1: [],
      stage2: [],
      secret: [],
      custodians: [],
      sftt: [],
      other: [], // shard, etc
    };

    // Fill in the above objectives, and keep a map from name to entry.
    const nameToEntry = {};
    const addEntry = (name, addToList) => {
      console.assert(typeof name === "string");
      console.assert(Array.isArray(addToList));
      const entry = {
        name: GameDataUtil.escapeForHTML(name),
        scoredBy: [],
      };
      nameToEntry[name] = entry;
      addToList.push(entry);
      return entry;
    };
    const addEntries = (names, addToList) => {
      console.assert(Array.isArray(names));
      console.assert(Array.isArray(addToList));
      for (const name of names) {
        addEntry(name, addToList);
      }
    };

    // Group objectives into categories.  Split out support from other.
    const gameDataObjectives = gameData?.objectives || [];
    for (const [key, names] of Object.entries(gameDataObjectives)) {
      if (key === "Secret Objectives") {
        addEntries(names, objectives.secret);
      } else if (key === "Public Objectives I") {
        addEntries(names, objectives.stage1);
      } else if (key === "Public Objectives II") {
        addEntries(names, objectives.stage2);
      } else {
        for (const name of names) {
          if (name.startsWith("Support for the Throne")) {
            addEntry(name, objectives.sftt);
          } else {
            addEntry(name, objectives.other);
          }
        }
      }
    }

    // Who scored?
    const gameDataPlayers = gameData?.players || [];
    for (const playerData of gameDataPlayers) {
      const colorName = GameDataUtil.parseColor(playerData).colorName;
      const playerObjectives = playerData?.objectives || [];
      for (const name of playerObjectives) {
        const entry = nameToEntry[name];
        console.assert(entry);
        entry.scoredBy.push(colorName);
      }
    }

    // Add custodians, a player can score more than once.
    const custodiansEntry = addEntry("custodians", objectives.custodians);
    for (const playerData of gameDataPlayers) {
      const colorName = GameDataUtil.parseColor(playerData).colorName;
      const custodiansPoints = playerData?.custodiansPoints || 0;
      for (let i = 0; i < custodiansPoints; i++) {
        custodiansEntry.scoredBy.push(colorName);
      }
    }

    return objectives;
  }
}

// Export for jest test framework.
if (typeof module !== "undefined") {
  module.exports = { GameDataUtil };
}
