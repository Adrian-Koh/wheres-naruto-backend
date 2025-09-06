const indexRouter = require("../routes/indexRouter");

const request = require("supertest");
const express = require("express");
const app = express();
const prisma = require("../db/prismaClient");

app.use(express.urlencoded({ extended: false }));
app.use("/", indexRouter);

let token;
let gameCompleteToken;

test("index route returns list of characters and token", (done) => {
  request(app)
    .get("/")
    .expect("Content-Type", /json/)
    .expect((res) => {
      if (!("token" in res.body)) throw new Error("missing token key");
      if (!("characters" in res.body))
        throw new Error("missing characters key");
      if (res.body.characters.length !== 12)
        throw new Error("characters length should be 12");

      token = res.body.token;
    })
    .expect(200, done);
});

test("index post correct character click", (done) => {
  request(app)
    .post("/")
    .set("authorization", `Bearer ${token}`)
    .send("character=Naruto")
    .send("x=458")
    .send("y=133")
    .expect((res) => {
      if (!("token" in res.body)) throw new Error("missing token key");
      if (!("result" in res.body)) throw new Error("missing result key");
      if (!("characterPosition" in res.body))
        throw new Error("missing characterPosition key");
      if (res.body.result !== "correct")
        throw new Error(
          "correct character position click did not register correct result"
        );
      if (res.body.characterPosition.name !== "Naruto")
        throw new Error(
          "returned characterPosition name is different from character chosen"
        );
    })
    .expect(200, done);
});

test("index post false character click", (done) => {
  request(app)
    .post("/")
    .set("authorization", `Bearer ${token}`)
    .send("character=Naruto")
    .send("x=600")
    .send("y=200")
    .expect((res) => {
      if (!("result" in res.body)) throw new Error("missing result key");
      if (res.body.result !== "false")
        throw new Error(
          "false character position click did not register false result"
        );
    })
    .expect(200, done);
});

test("index post all correct character clicks", async () => {
  const characters = await prisma.getAllCharacters();

  let curToken = token;
  for (let i = 0; i < characters.length; i++) {
    const character = characters[i];

    const res = await request(app)
      .post("/")
      .set("authorization", `Bearer ${curToken}`)
      .send("character=" + character.name)
      .send("x=" + character.x)
      .send("y=" + character.y);
    if (!("token" in res.body)) throw new Error("missing token key");
    if (!("result" in res.body)) throw new Error("missing result key");
    if (i === characters.length - 1) {
      if (res.body.result !== "complete")
        throw new Error("completing game did not register complete result");
      gameCompleteToken = res.body.token;
    } else {
      curToken = res.body.token;
    }
  }
});

test("high score post updates high scores table", async () => {
  const randomInt = parseInt(Math.random() * 10000);
  const playername = `testPlayer${randomInt}`;
  await request(app)
    .post("/score")
    .set("authorization", `Bearer ${gameCompleteToken}`)
    .send("playername=" + playername);

  const res = await request(app).get("/score").expect("Content-Type", /json/);

  if (!("highScores" in res.body)) throw new Error("missing highScores key");
  if (
    res.body.highScores.filter(
      (highScore) => highScore.playername === playername
    ).length !== 1
  ) {
    throw new Error(
      "Player name submitted was not included in high scores table"
    );
  }
});
