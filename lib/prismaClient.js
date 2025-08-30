const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const getAllCharacterNames = async () => {
  const availableCharacters = await prisma.character.findMany();
  const availableCharacterNames = availableCharacters.map(
    (character) => availableCharacters.name
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

module.exports = { getAllCharacterNames, getCharacter };
