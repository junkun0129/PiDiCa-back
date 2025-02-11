const { pool } = require("../db");
const { table } = require("../config");
const {
  getUserCd,
  generateRandomString,
  getFormattedDate,
} = require("../utils/common.util");
const { projects } = table;
const { prisma } = require("../db");
const getProjectList = async (req, res) => {
  try {
    const { offset = 0, pagination = 10 } = req.query;
    const user_cd = getUserCd(req);
    const projectsForUser = await prisma.projects.findMany({
      skip: parseInt(offset),
      take: parseInt(pagination),
      where: {
        membercards: {
          some: { user_cd: user_cd },
        },
      },
      include: {
        membercards: {
          where: {
            user_cd: user_cd,
          },
          select: {
            status: true,
          },
        },
        _count: {
          select: {
            membercards: true, // プロジェクトに参加しているユーザー数をカウント
            tasks: true, // プロジェクトに関連するタスク数をカウント
          },
        },
      },
    });
    console.log(projectsForUser, "projectsforuser");
    res.json({ result: "success", data: projectsForUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: "failed" });
  }
};

const createProject = async (req, res) => {
  try {
    const { project_name, users } = req.body;
    const user_cd = getUserCd(req);
    const project_cd = generateRandomString(36);
    const today = getFormattedDate("YYYY-MM-DD");

    const user_cds = [...users, user_cd];
    const newMemberCards = user_cds.map((user_cd, i) => ({
      membercard_cd: generateRandomString(36),
      project_cd,
      user_cd,
      status: i === user_cds.length - 1 ? "one" : "zero",
      created_at: today,
    }));
    await prisma.projects.create({
      data: {
        project_cd,
        project_name,
        created_at: today,
        created_by: user_cd,
        membercards: {
          create: newMemberCards,
        },
      },
    });

    res.json({ result: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: "failed" });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { project_cd } = req.body;
    await prisma.projects.delete({ where: { project_cd } });
    res.json({ result: "success" });
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
