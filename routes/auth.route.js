const {
  signUpController,
  signinController,
} = require("../controllers/auth.controller");
const router = require("express").Router();

router.post("/signup", signUpController);
router.post("/signin", signinController);

module.exports = router;
