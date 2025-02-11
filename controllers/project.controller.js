const { pool } = require("../db");
const { table } = require("../config");
const {
  getUserCd,
  generateRandomString,
  getFormattedDate,
} = require("../utils/common.util");
const { projects } = table;
const getProjectList = async (req, res) => {
  try {
    const { offset = 0, pagination = 10, sort = "created_at asc" } = req.query;
    const user_cd = getUserCd(req);
    const allowedSortColumns = ["id", "name", "created_at"];
    const [sortColumn, sortOrder] = sort.split(";");
    if (
      !allowedSortColumns.includes(sortColumn) ||
      !["ASC", "DESC"].includes(sortOrder.toUpperCase())
    ) {
      return res.status(400).json({ error: "Invalid sort parameter" });
    }

    const query = `SELECT * FROM ${projects} WHERE user_id = ? ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
    const values = [user_cd, parseInt(pagination), parseInt(offset)];

    const [rows] = await pool.query(query, values);
    res.json({ result: "success", data: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: "failed" });
  }
};

const getAuthorizedProjects = async (req, res) => {
  try {
    const user_cd = getUserCd(req);
    const query = `SELECT * FROM ${projects} WHERE user_cd = ?`;
    const values = [user_cd];
    const [rows] = await pool.query(query, values);
    res.json({ result: "success", data: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: "failed" });
  }
};

const createProject = async (req, res) => {
  try {
    const { project_name } = req.body;
    const user_cd = getUserCd(req);
    const project_cd = generateRandomString(36);
    const today = getFormattedDate("YYYY-MM-DD");
    const query = `INSERT INTO ${projects} (project_cd, project_name, created_at, created_by) VALUES (?, ?)`;
    const values = [project_cd, project_name, today, user_cd];
    const [rows] = await pool.query(query, values);
    res.json({ result: "success", data: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: "failed" });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { project_cd } = req.body;
    const user_cd = getUserCd(req);
    const query = `DELETE FROM ${projects} WHERE project_cd = ?`;
    const values = [project_cd];
    const [rows] = await pool.query(query, values);
    res.json({ result: "success", data: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: "failed" });
  }
};

module.exports = {
  getProjectList,
  createProject,
  deleteProject,
};
