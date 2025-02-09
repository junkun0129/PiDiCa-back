const jwt = require("jsonwebtoken");
const { pool } = require("../db");

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
const executeQuery = (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

const getUserCd = (req) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const decoded = jwt.decode(token);
  const userId = decoded.user_cd;
  return userId;
};

const postRequestHandler = (err, result, res) => {
  console.log(err, "result messageeeeeee");
  if (!result) {
    console.log(result, "result messageeeee");
    return res.status(200).json({ message: "失敗しました", result: "failed" });
  } else {
    console.log(result);
    return res.status(200).json({ result: "success" });
  }
};
// トランザクションをコミットする関数
function commitTransaction(connection) {
  return new Promise((resolve, reject) => {
    connection.commit((err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}
// トランザクションを開始する関数
function beginTransaction(connection) {
  return new Promise((resolve, reject) => {
    connection.beginTransaction((err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}
function rollbackTransaction(connection) {
  return new Promise((resolve, reject) => {
    connection.rollback(() => {
      resolve();
    });
  });
}

async function transaction(connection, res, callback) {
  try {
    await beginTransaction(connection);
    const response = await callback();
    await commitTransaction(connection);
    return response;
  } catch (err) {
    await rollbackTransaction(connection);
    return res.status(500);
  }
}

module.exports = {
  generateRandomString,
  getUserCd,
  postRequestHandler,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  transaction,
  executeQuery,
};
