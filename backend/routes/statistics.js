const express = require("express");
const router = express.Router();
const Statistics = require("../models/Statistics");

// 출입 통계 조회 (월별/년별)
router.get("/visits", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { period, date, dateFrom, dateTo } = req.query;
    const data = await Statistics.getVisitStatistics(db, period, date, dateFrom, dateTo);
    res.json({ success: true, data });
  } catch (error) {
    console.error("출입 통계 조회 오류:", error);
    if (error.message.includes("필요합니다")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});


module.exports = router;

