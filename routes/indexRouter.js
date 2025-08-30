const { Router } = require("express");
const indexRouter = Router();
const indexController = require("../controllers/indexController");
const { verifyToken } = require("../lib/jwtUtils");

indexRouter.get("/", indexController.indexGet);

module.exports = indexRouter;
