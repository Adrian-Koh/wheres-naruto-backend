const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const characterPositions = [
  { name: "Naruto", x: 489, y: 139 },
  { name: "Sasuke", x: 622, y: 261 },
  { name: "Sakura", x: 759, y: 237 },
  { name: "Might Guy", x: 308, y: 88 },
  { name: "Rock Lee", x: 650, y: 229 },
  { name: "Jiraiya", x: 528, y: 87 },
  { name: "Orochimaru", x: 579, y: 144 },
  { name: "Neji", x: 599, y: 376 },
  { name: "Kakashi", x: 382, y: 91 },
  { name: "Hashirama (The First Hokage)", x: 367, y: 173 },
  { name: "Tobirama (The Second Hokage)", x: 450, y: 173 },
  { name: "Shikamaru", x: 107, y: 385 },
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

populateCharacterPositions();
