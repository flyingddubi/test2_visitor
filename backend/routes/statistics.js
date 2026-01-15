const express = require("express");
const router = express.Router();
const VisitorRequest = require("../models/VisitorRequest");
const Badge = require("../models/Badge");

// 출입 통계 조회 (월별/일별)
router.get("/visits", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { period, date } = req.query; // period: 'month' or 'day', date: 'YYYY-MM' or 'YYYY-MM-DD'

    let query;
    if (period === "month" && date) {
      // 월별 통계
      query = `
        SELECT 
          DATE(visitDate) as date,
          COUNT(*) as totalVisits,
          COUNT(CASE WHEN status = 'approver_lv2_approved' THEN 1 END) as approvedVisits,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejectedVisits
        FROM visit_visitor_requests
        WHERE DATE_FORMAT(visitDate, '%Y-%m') = ?
        GROUP BY DATE(visitDate)
        ORDER BY date ASC
      `;
      const [rows] = await db.execute(query, [date]);
      res.json({ success: true, data: rows });
    } else if (period === "day" && date) {
      // 일별 통계
      query = `
        SELECT 
          DATE(visitDate) as date,
          COUNT(*) as totalVisits,
          COUNT(CASE WHEN status = 'approver_lv2_approved' THEN 1 END) as approvedVisits,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejectedVisits
        FROM visit_visitor_requests
        WHERE visitDate = ?
        GROUP BY DATE(visitDate)
      `;
      const [rows] = await db.execute(query, [date]);
      res.json({ success: true, data: rows[0] || null });
    } else {
      res.status(400).json({
        message: "period (month/day)와 date 파라미터가 필요합니다.",
      });
    }
  } catch (error) {
    console.error("출입 통계 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 출입증 통계 조회 (월별/일별)
router.get("/badges", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { period, date } = req.query;

    let query;
    if (period === "month" && date) {
      // 월별 출입증 통계
      query = `
        SELECT 
          DATE(issuedAt) as date,
          COUNT(*) as totalIssued,
          COUNT(CASE WHEN status = 'returned' THEN 1 END) as returnedCount,
          COUNT(CASE WHEN status = 'issued' THEN 1 END) as notReturnedCount,
          ROUND(COUNT(CASE WHEN status = 'returned' THEN 1 END) * 100.0 / COUNT(*), 2) as returnRate
        FROM visit_badges
        WHERE DATE_FORMAT(issuedAt, '%Y-%m') = ?
        GROUP BY DATE(issuedAt)
        ORDER BY date ASC
      `;
      const [rows] = await db.execute(query, [date]);
      res.json({ success: true, data: rows });
    } else if (period === "day" && date) {
      // 일별 출입증 통계
      query = `
        SELECT 
          DATE(issuedAt) as date,
          COUNT(*) as totalIssued,
          COUNT(CASE WHEN status = 'returned' THEN 1 END) as returnedCount,
          COUNT(CASE WHEN status = 'issued' THEN 1 END) as notReturnedCount,
          ROUND(COUNT(CASE WHEN status = 'returned' THEN 1 END) * 100.0 / COUNT(*), 2) as returnRate
        FROM visit_badges
        WHERE DATE(issuedAt) = ?
        GROUP BY DATE(issuedAt)
      `;
      const [rows] = await db.execute(query, [date]);
      res.json({ success: true, data: rows[0] || null });
    } else {
      res.status(400).json({
        message: "period (month/day)와 date 파라미터가 필요합니다.",
      });
    }
  } catch (error) {
    console.error("출입증 통계 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 출입증 이력 조회 (출입증 번호별)
router.get("/badge-history/:badgeNumber", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { badgeNumber } = req.params;

    const query = `
      SELECT 
        b.*,
        vr.visitorName,
        vr.visitorPhone,
        vr.visitDate,
        vr.visitPurpose,
        u1.name as issuedByName,
        u2.name as returnedByName
      FROM visit_badges b
      LEFT JOIN visit_visitor_requests vr ON b.requestId = vr.id
      LEFT JOIN visit_users u1 ON b.issuedBy = u1.id
      LEFT JOIN visit_users u2 ON b.returnedBy = u2.id
      WHERE b.badgeNumber = ?
      ORDER BY b.createdAt DESC
    `;

    const [rows] = await db.execute(query, [badgeNumber]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("출입증 이력 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;

