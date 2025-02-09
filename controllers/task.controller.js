const { pool } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const { table } = require("../config");
const { getUserCd } = require("../utils/common.util");
const { users, tasks } = table;
const getTaskList = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const { offset = 0, pagination = 10, sort = "created_at asc" } = req.query;
    const user_cd = getUserCd(req);
    const allowedSortColumns = ["id", "name", "created_at"];
    const [sortColumn, sortOrder] = sort.split(" ");
    if (
      !allowedSortColumns.includes(sortColumn) ||
      !["ASC", "DESC"].includes(sortOrder.toUpperCase())
    ) {
      return res.status(400).json({ error: "Invalid sort parameter" });
    }
    const query = `SELECT * FROM ${tasks} where user_id=${user_cd} ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
    const values = [parseInt(pagination), parseInt(offset)];
    const [rows] = await pool.query(query, values);
    res.json({ result: "success", data: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: "failed" });
  }
};

const createTask = async (req, res) => {
  try {
    const { task_name, project_id, task_detail } = req.body;
    const user_cd = getUserCd(req);
    const query = `INSERT INTO ${tasks} (task_name, project_id, task_detail, user_id) VALUES (?, ?, ?, ?)`;
    const values = [task_name, project_id, task_detail, user_cd];
    const [rows] = await pool.query(query, values);
    res.json({ result: "success", data: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: "failed" });
  }
};

const updateTask = async (req, res) => {
  try {
    const { task_name, project_id, task_detail, task_id } = req.body;
    const user_cd = getUserCd(req);
    const query = `UPDATE ${tasks} SET task_name=?, project_id=?, task_detail=? WHERE id=? AND user_id=?`;
    const values = [task_name, project_id, task_detail, task_id, user_cd];
    const [rows] = await pool.query(query, values);
    res.json({ result: "success", data: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: "failed" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { task_id } = req.body;
    const user_cd = getUserCd(req);
    const query = `DELETE FROM ${tasks} WHERE id=? AND user_id=?`;
    const values = [task_id, user_cd];
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
