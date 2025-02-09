const { pool } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const { table } = require("../config");
const { jwt: jwtConfig } = require("../const");
const { users } = table;
const { executeQuery, generateRandomString } = require("../utils/common.util");

const generateToken = (user) => {
  const payload = { email: user.email };
  return jwt.sign(payload, jwtConfig.secret, {
    algorithm: jwtConfig.jwtAlgorithm,
    expiresIn: jwtConfig.expiresLong,
  });
};

const formatUserResponse = (user) => ({
  email: user.user_email,
  username: user.user_username,
  cd: user.user_cd,
  img: process.env.BASE_URL + "/image/" + user.user_img,
});

const signUpController = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    console.log(email, password, username);
    // Check if user exists
    const existingUsers = await executeQuery(
      `SELECT * FROM ${users} WHERE user_email = ?`,
      [email]
    );
    console.log(existingUsers);

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "同じメールアドレスがすでに使われています",
        result: "failed",
      });
    }

    // Create new user
    const encodedPassword = bcrypt.hashSync(password, 10);
    const user_cd = generateRandomString(36);
    const sql = `INSERT INTO ${users} (user_email, user_password, user_name, user_cd) VALUES (?, ?, ?, ?)`;
    await executeQuery(sql, [email, encodedPassword, username, user_cd]);

    return res.status(201).json({
      message: "ユーザーの登録に成功しました",
      result: "success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "データベースとの接続に失敗しました",
      result: "failed",
    });
  }
};

const signinController = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    // Find user
    const users = await executeQuery(
      `SELECT * FROM ${table.users} WHERE user_email = ?`,
      [email]
    );
    console.log(users);
    if (!users.length) {
      return res.status(201).json({
        message: "そのメールアドレスで登録されているアカウントはありません",
        result: "failed",
      });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.user_password);

    if (!isValidPassword) {
      return res.status(201).json({
        message: "パスワードが違います",
        result: "failed",
      });
    }

    // Generate token and send response
    const token = generateToken(user);
    console.log(user);
    return res.status(200).json({
      message: "ログインに成功しました",
      result: "success",
      data: {
        user: formatUserResponse(user),
        token,
      },
    });
  } catch (error) {
    console.log(error);
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
