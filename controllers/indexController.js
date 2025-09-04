const jwt = require("jsonwebtoken");
const prisma = require("../db/prismaClient");
const ACCEPTABLE_CLICK_RANGE = 20;

const indexGet = async (req, res, next) => {
  const startTime = new Date();
  const foundCharacters = [];
  let remainingCharacters = await prisma.getAllCharacterNames();

  jwt.sign(
    { startTime, foundCharacters, remainingCharacters },
    process.env.SECRET_KEY,
    { expiresIn: "1h" },
    (err, token) => {
      if (err) {
        next(err);
      }
      res.json({ token, characters: remainingCharacters });
    }
  );
};

const indexPost = (req, res, next) => {
  jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
    if (err) {
      next(err);
    } else {
      if (authData.startTime) {
        const { character, x, y } = req.body;
        const selectedCharacter = await prisma.getCharacter(character);
        const xDistance = Math.abs(selectedCharacter.x - Number(x));
        const yDistance = Math.abs(selectedCharacter.y - Number(y));

        if (
          xDistance < ACCEPTABLE_CLICK_RANGE &&
          yDistance < ACCEPTABLE_CLICK_RANGE
        ) {
          const remainingCharacters = authData.remainingCharacters.filter(
            (remainingCharacter) => remainingCharacter !== character
          );
          const foundCharacters = [...authData.foundCharacters, character];

          if (remainingCharacters.length === 0) {
            // game complete
            const startTimestamp = new Date(authData.startTime).getTime();
            const currentTimestamp = Date.now();
            const timeTakenMs = currentTimestamp - startTimestamp;

            const score = timeTakenMs / 1000;
            const highScores = await prisma.getTopTenHighScores();

            if (
              highScores.length < 10 ||
              timeTakenMs < highScores[9].scoretime
            ) {
              // user high score is in top 10, ask for name and add to high scores board
              const randomId = parseInt(Math.random() * 100000);
              const randomName = "anonymous_" + randomId;
              const createdScore = await prisma.insertHighScore(
                randomName,
                timeTakenMs
              );
              console.log("createdScore: " + JSON.stringify(createdScore));

              jwt.sign(
                { scoreId: createdScore.id },
                process.env.SECRET_KEY,
                { expiresIn: "1h" },
                (err, token) => {
                  if (err) {
                    next(err);
                  }
                  res.json({
                    token,
                    result: "complete",
                    score,
                    highScores,
                    isHighScore: true,
                    characterPosition: selectedCharacter,
                  });
                }
              );
            } else {
              // don't need to add to high scores board
              res.json({
                result: "complete",
                score,
                highScores,
                isHighScore: false,
                characterPosition: selectedCharacter,
              });
            }
          } else {
            jwt.sign(
              {
                startTime: authData.startTime,
                foundCharacters,
                remainingCharacters,
              },
              process.env.SECRET_KEY,
              { expiresIn: "1h" },
              (err, token) => {
                if (err) {
                  next(err);
                }
                res.json({
                  result: "correct",
                  token,
                  characterPosition: selectedCharacter,
                });
              }
            );
          }
        } else {
          res.json({
            result: "false",
          });
        }
      }
    }
  });
};

const highScoreGet = async (req, res, next) => {
  const highScores = await prisma.getTopTenHighScores();
  res.json({ highScores });
};

const highScorePost = (req, res, next) => {
  jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
    if (err) {
      next(err);
    } else {
      if (authData.scoreId) {
        const { playername } = req.body;
        const updatedScore = await prisma.updateHighScoreName(
          authData.scoreId,
          playername
        );
        console.log("updatedScore: " + JSON.stringify(updatedScore));
        res.json({ updatedScore });
      }
    }
  });
};

module.exports = { indexGet, indexPost, highScoreGet, highScorePost };
