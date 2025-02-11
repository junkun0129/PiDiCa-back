const { pool } = require("../db");
const { table } = require("../config");
const {
  getUserCd,
  getFormattedDate,
  generateRandomString,
} = require("../utils/common.util");
const { tasks } = table;
const getTaskList = async (req, res) => {
  console.log("object");
  try {
    const {
      offset = 0,
      pagination = 10,
      sort = "asc;created_at",
      project = "",
    } = req.query;
    console.log(offset);
    const user_cd = getUserCd(req);
    const allowedSortColumns = ["id", "name", "created_at"];
    const [sortOrder, sortColumn] = sort.split(";");
    if (
      !allowedSortColumns.includes(sortColumn) ||
      !["ASC", "DESC"].includes(sortOrder.toUpperCase())
    ) {
      return res.status(400).json({ error: "Invalid sort parameter" });
    }
    console.log(user_cd, "user_cd");
    let query;
    let values;
    let countQuery;
    let countValues;

    if (project === "") {
      query = `
        SELECT t.*, COALESCE(p.project_name, '') AS project_name 
        FROM ${tasks} t
        LEFT JOIN projects p ON t.project_cd = p.project_cd
        WHERE t.user_cd = ? 
        ORDER BY ${sortColumn} ${sortOrder} 
        LIMIT ? OFFSET ?
      `;
      countQuery = `SELECT COUNT(*) AS total FROM ${tasks} WHERE user_cd = ?`;
      values = [user_cd, parseInt(pagination), parseInt(offset)];
      countValues = [user_cd];
    } else {
      query = `
        SELECT t.*, COALESCE(p.project_name, '') AS project_name
        FROM ${tasks} t
        LEFT JOIN projects p ON t.project_cd = p.project_cd
        WHERE t.user_cd = ? AND t.project_cd = ? 
        ORDER BY ${sortColumn} ${sortOrder} 
        LIMIT ? OFFSET ?
      `;
      // Fix SQL injection vulnerability in countQuery
      countQuery = `SELECT COUNT(*) AS total FROM ${tasks} WHERE project_cd = ?`;
      values = [user_cd, project, parseInt(pagination), parseInt(offset)];
      countValues = [project]; // Use parameterized query
    }

    // Use the Promise-based query interface
    const [rows, fields] = await pool.query(query, values);
    const [countResult] = await pool.query(countQuery, countValues);
    console.log(countResult);
    res.json({
      result: "success",
      data: rows,
      total: countResult[0].total,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: "failed" });
  }
};

const createTask = async (req, res) => {
  try {
    const { task_name, project_cd, task_detail, task_status } = req.body;
    console.log(task_name, task_detail, task_status);
    const user_cd = getUserCd(req);
    const created_at = getFormattedDate("YYYY-MM-DD");
    const task_cd = generateRandomString(36);
    const query = `INSERT INTO ${tasks} (task_cd, task_name, project_Cd, task_detail, user_cd, created_at, task_status) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      task_cd,
      task_name,
      project_cd,
      task_detail,
      user_cd,
      created_at,
      task_status,
    ];
    const [rows] = await pool.query(query, values);
    res.json({ result: "success", data: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: "failed" });
  }
};

const updateTask = async (req, res) => {
  try {
    const { task_name, project_cd, task_detail, task_cd, task_status } =
      req.body;
    console.log(project_cd, "project_cd");
    const updated_at = getFormattedDate("YYYY-MM-DD");
    const query = `UPDATE ${tasks} SET task_name=?, project_cd=?, task_detail=?, updated_at = ?, task_status = ? WHERE task_cd = ?`;
    const values = [
      task_name,
      project_cd,
      task_detail,
      updated_at,
      task_status,
      task_cd,
    ];
    const [rows] = await pool.query(query, values);
    res.json({ result: "success", data: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: "failed" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { task_cd } = req.body;

    const query = `DELETE FROM ${tasks} WHERE task_cd = ?`;
    const values = [task_cd];
    const [rows] = await pool.query(query, values);
    res.json({ result: "success", data: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: "failed" });
  }
};
const testController = (req, res) => {
  res.send("<h1>working</h1>");
};
module.exports = {
  testController,
  getTaskList,
  createTask,
  updateTask,
  deleteTask,
};
