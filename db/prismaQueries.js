const prisma = require("./prismaClient");
const { PrismaClient } = require("../generated/prisma");

const printHighScores = async () => {
  const scores = await prisma.getTopTenHighScores();
  console.log("high scores: " + JSON.stringify(scores));
};

const clearHighScores = async () => {
  const prismaClient = new PrismaClient();
  const deletedScores = await prismaClient.highScores.deleteMany({});
  console.log("deletedScores: " + JSON.stringify(deletedScores));
};

clearHighScores();
