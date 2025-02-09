const {
  signUpController,
  signinController,
  testController,
} = require("../controllers/auth.controller");
const router = require("express").Router();

router.post("/signup", signUpController);
router.post("/signin", signinController);
router.get("/test", testController);

module.exports = router;
