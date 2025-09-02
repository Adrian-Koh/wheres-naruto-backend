const jwt = require("jsonwebtoken");
const prisma = require("../db/prismaClient");
const ACCEPTABLE_CLICK_RANGE = 20;

const indexGet = async (req, res, next) => {
  const startTime = new Date();
  const foundCharacters = [];
  let tmp = await prisma.getAllCharacterNames();
  //TODO: restore to full list, testing for now, using fewer characters
  let remainingCharacters = [];
  remainingCharacters.push(tmp[0]);
  remainingCharacters.push(tmp[1]);

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
            const highScores = await prisma.getAllHighScores();

            let message;
            if (
              highScores.length < 10 ||
              timeTakenMs < highScores[9].scoretime
            ) {
              // user high score is in top 10, ask for name and add to high scores board
              message = `You're in the top 10 high scores, time taken: ${score}s`;

              jwt.sign(
                { timeTakenMs },
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
                    message: message,
                    characterPosition: selectedCharacter,
                  });
                }
              );
            } else {
              // don't need to add to high scores board
              message = `You did not make it in the top 10 high scores, time taken: ${score}s`;

              res.json({
                result: "complete",
                score,
                highScores,
                isHighScore: false,
                message: message,
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
            message: `Wrong position clicked for ${character}`,
          });
        }
      }
    }
  });
};

const highScoreGet = async (req, res, next) => {
  const highScores = await prisma.getAllHighScores();
  res.json({ highScores });
};

const highScorePost = (req, res, next) => {
  jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
    if (err) {
      next(err);
    } else {
      if (authData.timeTakenMs) {
        const { playername } = req.body;
        const createdScore = await prisma.insertHighScore(
          playername,
          authData.timeTakenMs
        );
        console.log("createdScore: " + JSON.stringify(createdScore));
        res.json({ createdScore });
      }
    }
  });
};

module.exports = { indexGet, indexPost, highScoreGet, highScorePost };
