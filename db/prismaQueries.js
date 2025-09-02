const prisma = require("./prismaClient");

const printHighScores = async () => {
  const scores = await prisma.getAllHighScores();
  console.log("high scores: " + JSON.stringify(scores));
};

printHighScores();
