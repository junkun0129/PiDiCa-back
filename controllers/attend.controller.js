const { pool } = require("../db");
const { table } = require("../config");
const {
  getUserCd,
  generateRandomString,
  getFormattedDate,
} = require("../utils/common.util");
const { projects } = table;
const { prisma } = require("../db");
const dayjs = require("dayjs");

const ATTEND_SPECIAL_STATUS = {
  0: "なし",
  1: "有給",
  2: "欠勤",
  3: "遅刻",
  4: "早退",
};
const getAttend = async (req, res) => {
  try {
    const { yearmonth } = req.query;
    const user_cd = getUserCd(req);
    let status = "提出済";
    let rows = [];
    const attend = await prisma.dailyattends.findMany({
      where: {
        user_cd,
        da_yearmonth: yearmonth,
      },
      orderBy: {
        date: "asc",
      },
    });
    console.log(attend.length, "atteeee");
    const monthly = await prisma.monthlyattends.findFirst({
      where: {
        user_cd,
        ma_yearmonth: yearmonth,
      },
    });
    if (!monthly && attend.length === 0) {
      status = "未提出";
    }
    if (monthly && attend.length === dayjs(yearmonth).daysInMonth()) {
      attend.forEach((row) => {
        const rowArray = [
          row["da_starttime"],
          row["da_endtime"],
          row["da_rest"],
          row["da_over"],
          row["da_night"],
          row["da_workhour"],
          ATTEND_SPECIAL_STATUS[row["da_status"]],
        ];
        rows.push(rowArray);
      });
      rows.push([
        "",
        "",
        "",
        monthly["ma_over"],
        monthly["ma_night"],
        monthly["ma_workhour"],
        "",
      ]);
    }
    console.log(rows, "rowssss");

    res.status(200).json({ result: "success", data: { rows, status } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "failed" });
  }
};

const DAILY_ATTEND_INDEX = {
  0: "da_starttime",
  1: "da_endtime",
  2: "da_rest",
  3: "da_over",
  4: "da_night",
  5: "da_workhour",
  6: "da_status",
};
const submitAttend = async (req, res) => {
  try {
    const { yearmonth, daily, monthly } = req.body;
    const user_cd = getUserCd(req);
    let daily_attends = [];
    daily.forEach((row, i) => {
      if (row.length !== 7) return;
      const daily_attend = {};
      row.forEach((col, j) => {
        daily_attend[DAILY_ATTEND_INDEX[j]] = col;
      });
      daily_attend["user_cd"] = user_cd;
      daily_attend["date"] = (i + 1).toString().padStart(2, "0");

      daily_attend["da_yearmonth"] = yearmonth;
      daily_attend["da_cd"] = generateRandomString(36);
      daily_attends.push(daily_attend);
    });

    await prisma.dailyattends.createMany({
      data: daily_attends,
    });

    await prisma.monthlyattends.create({
      data: {
        user_cd,
        ma_cd: generateRandomString(36),
        ma_yearmonth: yearmonth,
        ma_workhour: monthly.workhour,
        ma_night: monthly.night,
        ma_over: monthly.over,
      },
    });

    res.status(200).json({ result: "success" });
  } catch (err) {
    res.status(500).json({ result: "failed" });
  }
};
module.exports = {
  getAttend,
  submitAttend,
};
