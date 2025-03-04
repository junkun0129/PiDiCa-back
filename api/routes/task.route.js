const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  getTaskList,
  createTask,
  deleteTask,
  updateTask,
  getReportItemDetail,
  getTaskItemsDates,
} = require("../controllers/task.controller");
const router = require("express").Router();

router.get("/list", authMiddleware, getTaskList);
router.post("/create", authMiddleware, createTask);
router.post("/delete", authMiddleware, deleteTask);
router.post("/update", authMiddleware, updateTask);
router.get("/items/dates", authMiddleware, getTaskItemsDates);
router.get("/items/detail", authMiddleware, getReportItemDetail);
module.exports = router;
