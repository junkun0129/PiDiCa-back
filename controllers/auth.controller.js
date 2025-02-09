const { pool } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const { table } = require("../config");
const { users } = table;
const signUpController = (req, res) => {
  const { email, password, username } = req.body;
  
  const sql = `select * from ${users} where email = ?`;
  connection.query(sql, [email], (err, rows) => {
    console.log(rows, "rows");

    if (!rows || rows.length === 0) {
      const sql = `
        INSERT INTO ${users} (email, password, username) 
        VALUES (?, ?, ?)
        `;

      const encodedPassword = bcrypt.hashSync(password, 10);
      const imageUrl = "";
      const values = [email, encodedPassword, username];
      connection.query(sql, values, (err, result) => {
        if (err) {
          console.log("errors", err);
          return res
            .status(500)
            .json({ message: "データベースとの接続に失敗しました" });
        }

        return res
          .status(200)
          .json({ message: "ユーザーの登録に成功しました", result: "success" });
      });
    } else {
      return res.status(200).json({
        message: "同じメールアドレスがすでに使われています",
        result: "failed",
      });
    }
  });
};
const signinController = (req, res) => {
  const { email, password, is_stay_login } = req.body;
  const sql = `select * from ${users} where email = ?`;
  const value = email;
  connection.query(sql, value, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "errr", result: "failed" });
    }
    if (!rows.length) {
      return res.status(200).json({
        message: "そのメールアドレスで登録されているアカウントはありません",
        result: "failed",
      });
    } else {
      const user = rows[0];
      bcrypt.compare(password, user.password, (err, result) => {
        if (!result) {
          return res
            .status(200)
            .json({ message: "パスワードが違います", result: "failed" });
        } else {
          const payload = {
            email: user.email,
          };
          const token = jwt.sign(payload, config.jwt.secret, {
            algorithm: config.jwtAlgorithm,
            expiresIn: is_stay_login ? config.expiresLong : config.expiresShort,
          });
          return res.status(200).json({
            message: "ログインに成功しました",
            result: "success",
            data: {
              user: {
                email: user.email,
                username: user.username,
                img: process.env.BASE_DOMAIN + "/image/" + user.img,
              },
              token,
            },
          });
        }
      });
    }
  });
};

const testController = (req, res) => {
  res.send("<h1>working</h1>");
};
module.exports = {
  signUpController,
  signinController,
  testController,
};
