const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { jwt: jwtConfig } = require("../const");
const { generateRandomString } = require("../utils/common.util");
const { prisma } = require("../db");

const generateToken = (user) => {
  console.log(user, "user in generateToken");
  const payload = { email: user.user_email, user_cd: user.user_cd };
  return jwt.sign(payload, jwtConfig.secret, {
    algorithm: jwtConfig.jwtAlgorithm,
    expiresIn: jwtConfig.expiresLong,
  });
};


const formatUserResponse = (user) => ({
  email: user.user_email,
  username: user.user_name,
  cd: user.user_cd,
  img: process.env.BASE_URL + "/image/" + user.user_img,
});

const signUpController = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    console.log(email, password, username);

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { user_email: email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "同じメールアドレスがすでに使われています",
        result: "failed",
      });
    }

    // Create new user
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user_cd = generateRandomString(36);

    const newUser = await prisma.users.create({
      data: {
        user_email: email,
        user_password: hashedPassword,
        user_name: username,
        user_cd: user_cd,
      },
    });

    return res.status(201).json({
      message: "ユーザーの登録に成功しました",
      result: "success",
      data: formatUserResponse(newUser),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "データベースとの接続に失敗しました",
      result: "failed",
    });
  }
};

const signinController = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password, "iwatani");

    // Find user
    const user = await prisma.users.findUnique({
      where: { user_email: email },
    });

    console.log(user, "user");
    if (!user) {
      return res.status(401).json({
        message: "そのメールアドレスで登録されているアカウントはありません",
        result: "failed",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.user_password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: "パスワードが違います",
        result: "failed",
      });
    }

    // Generate token and send response
    const token = generateToken(user);
    return res.status(200).json({
      message: "ログインに成功しました",
      result: "success",
      data: {
        user: formatUserResponse(user),
        token,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "ログイン処理中にエラーが発生しました",
      result: "failed",
    });
  }
};

module.exports = {
  signUpController,
  signinController,
};
