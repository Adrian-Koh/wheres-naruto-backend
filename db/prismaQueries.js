const prisma = require("./prismaClient");

const printHighScores = async () => {
  const scores = await prisma.getTopTenHighScores();
  console.log("high scores: " + JSON.stringify(scores));
};

printHighScores();
