const {
  getUserCd,
  getFormattedDate,
  generateRandomString,
} = require("../utils/common.util");
const { prisma } = require("../db");
const dayjs = require("dayjs");
const getTask = async (req, res) => {
  try {
    const { task_cd } = req.query;
    const user_cd = getUserCd(req);
    const task = await prisma.tasks.findUnique({
      where: { task_cd, user_cd },
    });
    res.json({ result: "success", data: task });
  } catch (err) {
    res.status(500).json({ result: "failed" });
  }
};

const getTaskList = async (req, res) => {
  try {
    const {
      offset = 0,
      pagination = 10,
      sort = "asc;created_at",
      project = "",
    } = req.query;
    const user_cd = getUserCd(req);
    const allowedSortColumns = ["id", "name", "created_at"];
    const [sortOrder, sortColumn] = sort.split(";");

    if (
      !allowedSortColumns.includes(sortColumn) ||
      !["ASC", "DESC"].includes(sortOrder.toUpperCase())
    ) {
      return res.status(400).json({ error: "Invalid sort parameter" });
    }

    const whereCondition = project
      ? { user_cd, project_cd: project }
      : { user_cd };

    const tasks = await prisma.tasks.findMany({
      where: whereCondition,
      orderBy: { [sortColumn]: sortOrder.toLowerCase() },
      skip: parseInt(offset),
      take: parseInt(pagination),
      include: { projects: { select: { project_name: true } } },
    });

    const total = await prisma.tasks.count({ where: whereCondition });

    res.json({ result: "success", data: tasks, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "failed" });
  }
};

const getTaskItemsDates = async (req, res) => {
  try {
    const { task_cd } = req.query;
    const taskItems = await prisma.reportitems.findMany({
      where: { task_cd },
      select: { ri_date: true, ri_starttime: true, ri_endtime: true },
    });
    let returnObject = {};

    taskItems.forEach((item) => {
      const formattedDate = dayjs(item.ri_date).format("YYYY-MM-DD");

      if (!returnObject[formattedDate]) {
        returnObject[formattedDate] = [];
      }
      returnObject[formattedDate].push(
        `${item.ri_starttime}-${item.ri_endtime}`
      );
    });

    res.json({ result: "success", data: returnObject });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "failed" });
  }
};

const getReportItemDetail = async (req, res) => {
  try {
    const { task_cd, starttime, endtime, date } = req.query;
    const parsedStarttime = parseInt(starttime);
    const parsedEndtime = parseInt(endtime);
    if (isNaN(parsedStarttime) || isNaN(parsedEndtime)) {
      return res.status(400).json({ error: "Invalid starttime or endtime" });
    }
    const formattedDate = new Date(date).toISOString();
    const taskItem = await prisma.reportitems.findFirst({
      where: {
        task_cd,
        ri_starttime: parsedStarttime,
        ri_endtime: parsedEndtime,
        ri_date: formattedDate,
      },
    });
    res.json({ result: "success", data: taskItem });
  } catch (err) {
    res.status(500).json({ result: "failed" });
  }
};

const createTask = async (req, res) => {
  try {
    const { task_name, project_cd, task_detail, task_status } = req.body;
    const user_cd = getUserCd(req);
    const created_at = getFormattedDate("YYYY-MM-DD");
    const task_cd = generateRandomString(36);

    const task = await prisma.tasks.create({
      data: {
        task_cd,
        task_name,
        project_cd,
        task_detail,
        user_cd,
        created_at,
        task_status,
      },
    });

    res.json({ result: "success", data: task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "failed" });
  }
};

const updateTask = async (req, res) => {
  try {
    const { task_cd, task_name, project_cd, task_detail, task_status } =
      req.body;
    const updated_at = getFormattedDate("YYYY-MM-DD");

    const task = await prisma.tasks.update({
      where: { task_cd },
      data: { task_name, project_cd, task_detail, updated_at, task_status },
    });

    res.json({ result: "success", data: task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "failed" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { task_cd } = req.body;

    await prisma.tasks.delete({ where: { task_cd } });
    res.json({ result: "success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "failed" });
  }
};

const testController = (req, res) => {
  res.send("<h1>working</h1>");
};

module.exports = {
  testController,
  getTaskList,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskItemsDates,
  getReportItemDetail,
};
