const jwt = require("jsonwebtoken");
const { jwt: jwtConfig } = require("../const");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtConfig.secret);
    next();
  } catch (err) {
    res.status(401).json({
      message: "認証できません",
    });
  }
};

module.exports = { authMiddleware };
