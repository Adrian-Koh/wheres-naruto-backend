const jwt = require("jsonwebtoken");
const prisma = require("../lib/prismaClient");
const ACCEPTABLE_CLICK_RANGE = 20;

const indexGet = async (req, res, next) => {
  const startTime = new Date();
  const foundCharacters = [];
  const remainingCharacters = await prisma.getAllCharacterNames();

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
            res.json({ result: "complete", message: "success" });
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
                res.json({ result: "correct", token });
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

module.exports = { indexGet, indexPost };
