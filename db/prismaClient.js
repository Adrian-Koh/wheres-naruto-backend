const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const getAllCharacterNames = async () => {
  const availableCharacters = await prisma.character.findMany();
  const availableCharacterNames = availableCharacters.map(
    (character) => character.name
  );
  return availableCharacterNames;
};

const getCharacter = async (characterName) => {
  const character = await prisma.character.findUnique({
    where: {
      name: characterName,
    },
  });
  return character;
};

const getAllHighScores = async () => {
  const highScores = (await prisma.highScores.findMany({})).sort(
    (a, b) => a.scoretime - b.scoretime
  );
  return highScores;
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
};

module.exports = {
  getAllCharacterNames,
  getCharacter,
  getAllHighScores,
  insertHighScore,
  updateHighScoreName,
};
