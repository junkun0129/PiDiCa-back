const mysql = require("mysql2");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "pidica_user",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "todo_app",
};

const pool = mysql.createPool(dbConfig);

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Successfully connected to database");
  connection.release();
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
  pool,
  dbConfig,
  runTransaction,
};
