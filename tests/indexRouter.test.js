const indexRouter = require("../routes/indexRouter");

const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use("/", indexRouter);

let token;

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

      token = res.body.token;
    })
    .expect(200, done);
});
