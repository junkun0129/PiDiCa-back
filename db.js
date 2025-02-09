const mysql = require("mysql");

const dbConfig = {
  host: "database-2.c3k4oka820lq.ap-northeast-1.rds.amazonaws.com",
  user: "admin",
  password: "omX6RN5xylBuQFekxvsA",
  database: "todo2",
};
const pool = mysql.createPool(dbConfig);

pool.connect((err) => {
  if (err) {
    console.log("failed to connect to database");
  }

  console.log("successfully connected to database");
});

async function runTransaction(transactionCallback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Execute the provided transaction callback
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
