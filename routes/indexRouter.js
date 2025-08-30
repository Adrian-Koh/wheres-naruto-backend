const { Router } = require("express");
const indexRouter = Router();
const indexController = require("../controllers/indexController");
const { verifyToken } = require("../lib/jwtUtils");

indexRouter.get("/", indexController.indexGet);
indexRouter.post("/", verifyToken, indexController.indexPost);

module.exports = indexRouter;
