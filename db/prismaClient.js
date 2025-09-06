require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const databaseUrl =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

const getAllCharacterNames = async () => {
  const availableCharacters = await getAllCharacters();
  const availableCharacterNames = availableCharacters.map(
    (character) => character.name
  );
  return availableCharacterNames;
};

const getAllCharacters = async () => {
  const characters = await prisma.character.findMany();
  return characters;
};

const getCharacter = async (characterName) => {
  const character = await prisma.character.findUnique({
    where: {
      name: characterName,
    },
  });
  return character;
};

const getTopTenHighScores = async () => {
  const highScores = await prisma.highScores.findMany({});
  const sortedScores = highScores.sort((a, b) => a.scoretime - b.scoretime);
  const topTen =
    sortedScores.length > 10 ? sortedScores.slice(0, 10) : sortedScores;
  return topTen;
};

const insertHighScore = async (playername, scoretime) => {
  const createdHighScore = await prisma.highScores.create({
    data: {
      playername,
      scoretime,
    },
  });
  return createdHighScore;
};

const updateHighScoreName = async (scoreId, playername) => {
  const updatedHighScore = await prisma.highScores.update({
    where: {
      id: Number(scoreId),
    },
    data: {
      playername: playername,
    },
  });
  return updatedHighScore;
};

module.exports = {
  getAllCharacterNames,
  getAllCharacters,
  getCharacter,
  getTopTenHighScores,
  insertHighScore,
  updateHighScoreName,
};
