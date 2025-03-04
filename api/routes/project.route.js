const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  getProjectList,
  createProject,
  deleteProject,
  getProjectEntries,
} = require("../controllers/project.controller");
const router = require("express").Router();

router.get("/list", authMiddleware, getProjectList);
router.get("/entries", authMiddleware, getProjectEntries);
router.post("/create", authMiddleware, createProject);
router.post("/delete", authMiddleware, deleteProject);

module.exports = router;
