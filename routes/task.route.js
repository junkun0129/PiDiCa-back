const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  getTaskList,
  createTask,
  deleteTask,
  updateTask,
} = require("../controllers/task.controller");
const router = require("express").Router();

router.post("/list", authMiddleware, getTaskList);
router.post("/create", authMiddleware, createTask);
router.post("/delete", authMiddleware, deleteTask);
router.post("/update", authMiddleware, updateTask);

module.exports = router;
