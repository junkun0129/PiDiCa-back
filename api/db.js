const { PrismaClient } = require("@prisma/client");
const mysql = require("mysql2/promise");
require("dotenv").config();
const prisma = new PrismaClient();
console.log(prisma);
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "pidica_user",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "todo_app",
};
const pool = mysql.createPool(dbConfig);

// Promise版の接続テスト
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Successfully connected to database");
    connection.release();
  } catch (err) {
    console.error("Error connecting to the database:", err);
    throw err;
  }
}

// 接続テストを実行
testConnection().catch((err) => {
  console.error("Connection test failed:", err);
  process.exit(1); // 接続失敗時はプロセスを終了
});

async function runTransaction(transactionCallback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await transactionCallback(connection);
    await connection.commit();
    console.log("Transaction successful!");
    return result;
  } catch (error) {
    await connection.rollback();
    console.error("Transaction failed:", error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  prisma,
  pool,
  dbConfig,
  runTransaction,
};
