const {
  getUserCd,
  getFormattedDate,
  generateRandomString,
} = require("../utils/common.util");
const { prisma } = require("../db");
const { reports_report_status } = require("@prisma/client");
const dayjs = require("dayjs");
const report_status_index = {
  0: reports_report_status.zero,
  1: reports_report_status.one,
};

const report_status_reverse_index = {
  zero: 0,
  one: 1,
};
const getAvairableDate = async (req, res) => {
  try {
    const { date, status } = req.query;
    const year = date.split("-")[0];
    const month = date.split("-")[1];
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    const user_cd = getUserCd(req);
    console.log(user_cd);
    const records = await prisma.reports.findMany({
      select: {
        report_date: true,
      },
      where: {
        user_cd,
        report_date: {
          gte: startDate,
          lt: endDate,
        },
        report_status: report_status_index[status],
      },
    });

    const daysArray = records.map((record) => {
      return record.report_date.toISOString().split("T")[0].split("-")[2];
    });

    console.log(daysArray);

    res.json({ result: "success", data: daysArray });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "failed" });
  }
};
const getReportList = async (req, res) => {
  try {
    const { date } = req.query;
    const user_cd = getUserCd(req);

    const totalCount = await prisma.reports.count({
      where: { user_cd, report_date: { gte: new Date(date).toISOString() } },
    });
    const records = await prisma.reports.findMany({
      where: { user_cd, report_date: { gte: new Date(date).toISOString() } },
      select: {
        report_cd: true,
        report_date: true,
        report_status: true,
        report_workhour: true,
        report_created_at: true,
        reportitems: {
          select: {
            tasks: {
              select: {
                task_name: true,
              },
            },
            ri_starttime: true,
            ri_endtime: true,
          },
        },
      },
    });

    let formattedRecordsObject = {};
    records.forEach((record) => {
      const report_date = dayjs(record.report_date).format("DD");
      const report_status = report_status_reverse_index[record.report_status];
      formattedRecordsObject[`${report_date}-${report_status}`] = {
        ...record,
      };
    });
    res.json({
      result: "success",
      data: formattedRecordsObject,
      total: totalCount,
    });
  } catch (err) {
    res.status(500).json({ result: "failed" });
  }
};
const createReport = async (req, res) => {
  try {
    const { report_date, report_status, report_workhour, report_items } =
      req.body;

    const convertedReportDate = new Date(report_date).toISOString();
    const user_cd = getUserCd(req);
    const created_at = getFormattedDate("YYYY-MM-DD");
    const report_cd = generateRandomString(36);
    const newItems = report_items.map((item) => {
      const ri_cd = generateRandomString(36);
      return {
        ri_cd,
        task_cd: item.task_cd,
        ri_starttime: parseInt(item.starttime),
        ri_endtime: parseInt(item.endtime),
        ri_check: item.check,
        ri_do: item.do,
        ri_plan: item.plan,
        ri_action: item.action,
        ri_date: convertedReportDate,
      };
    });
    const newReport = await prisma.reports.create({
      data: {
        report_cd,
        user_cd,
        report_created_at: created_at,
        report_date: convertedReportDate,
        report_status: report_status_index[parseInt(report_status)],
        report_workhour,
        reportitems: {
          create: newItems,
        },
      },
    });

    res.json({ result: "success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "failed" });
  }
};

module.exports = {
  createReport,
  getAvairableDate,
  getReportList,
};
