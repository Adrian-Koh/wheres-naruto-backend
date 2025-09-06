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

const printHighScores = async () => {
  const scores = await prisma.highScores.findMany({});
  console.log("high scores: " + JSON.stringify(scores));
};

const clearHighScores = async () => {
  const deletedScores = await prisma.highScores.deleteMany({});
  console.log("deletedScores: " + JSON.stringify(deletedScores));
};

printHighScores();
