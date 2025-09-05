const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const characterPositions = [
  { name: "Naruto", x: 457, y: 132 },
  { name: "Sasuke", x: 581, y: 244 },
  { name: "Sakura", x: 708, y: 227 },
  { name: "Might Guy", x: 287, y: 85 },
  { name: "Rock Lee", x: 608, y: 217 },
  { name: "Jiraiya", x: 491, y: 85 },
  { name: "Orochimaru", x: 539, y: 134 },
  { name: "Neji", x: 561, y: 355 },
  { name: "Kakashi", x: 357, y: 87 },
  { name: "Hashirama (The First Hokage)", x: 343, y: 167 },
  { name: "Tobirama (The Second Hokage)", x: 422, y: 167 },
  { name: "Shikamaru", x: 99, y: 364 },
];
const populateCharacterPositions = async () => {
  const characters = await prisma.character.createMany({
    data: characterPositions,
  });
  console.log("added characters: " + JSON.stringify(characters));
};

const updateCharacterPositions = async () => {
  for (const character of characterPositions) {
    const updatedCharacter = await prisma.character.update({
      where: {
        name: character.name,
      },
      data: {
        x: character.x,
        y: character.y,
      },
    });
    console.log("updated character: " + JSON.stringify(updatedCharacter));
  }
};

const listAllCharacters = async () => {
  const characters = await prisma.character.findMany();
  console.log("available characters: " + JSON.stringify(characters));
};

updateCharacterPositions();

module.exports = { characterPositions };
