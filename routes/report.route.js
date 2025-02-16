const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  createReport,
  getAvairableDate,
  getReportList,
} = require("../controllers/report.controller");
const router = require("express").Router();

router.post("/create", authMiddleware, createReport);
router.get("/createdbymonth", authMiddleware, getAvairableDate);
router.get("/list", authMiddleware, getReportList);
module.exports = router;
