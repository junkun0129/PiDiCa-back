const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  getProjectList,
  createProject,
  deleteProject,
} = require("../controllers/project.controller");
const router = require("express").Router();

router.post("/list", authMiddleware, getProjectList);
router.post("/create", authMiddleware, createProject);
router.post("/delete", authMiddleware, deleteProject);

module.exports = router;
