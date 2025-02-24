const { authMiddleware } = require("../middlewares/auth.middleware");
const { getAttend, submitAttend } = require("../controllers/attend.controller");
const router = require("express").Router();

router.get("/get", authMiddleware, getAttend);
router.post("/submit", authMiddleware, submitAttend);

module.exports = router;
