const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  createReport,
  getAvairableDate,
} = require("../controllers/report.controller");
const router = require("express").Router();

router.post("/create", authMiddleware, createReport);
router.get("/createdbymonth", authMiddleware, getAvairableDate);

module.exports = router;
