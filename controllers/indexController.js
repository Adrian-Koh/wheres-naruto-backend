const jwt = require("jsonwebtoken");

const indexGet = (req, res, next) => {
  const startTime = new Date();
  jwt.sign(
    { startTime },
    process.env.SECRET_KEY,
    { expiresIn: "1d" },
    (err, token) => {
      if (err) {
        next(err);
      }
      res.json({ token });
    }
  );
};

module.exports = { indexGet };
