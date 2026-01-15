const express = require("express");
const router = express.Router();
const Badge = require("../models/Badge");
const VisitorRequest = require("../models/VisitorRequest");
const ActivityLog = require("../models/ActivityLog");

// 출입증 발급
router.post("/issue", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { requestId, badgeNumber, issuedBy, notes } = req.body;

    const request = await VisitorRequest.findById(db, requestId);
    if (!request) {
      return res.status(404).json({ message: "방문 요청을 찾을 수 없습니다." });
    }

    if (request.status !== "approver_lv2_approved") {
      return res
        .status(400)
        .json({ message: "2차 승인이 완료된 요청만 출입증을 발급할 수 있습니다." });
    }

    // 이미 발급된 출입증이 있는지 확인
    const existingBadge = await Badge.findByRequestId(db, requestId);
    if (existingBadge && existingBadge.status === "issued") {
      return res
        .status(400)
        .json({ message: "이미 발급된 출입증이 있습니다." });
    }

    // 출입증 발급
    const badgeId = await Badge.issue(db, {
      requestId,
      badgeNumber,
      issuedBy,
      notes,
    });

    // 활동 로그 기록
    await ActivityLog.create(db, {
      requestId,
      userId: issuedBy,
      actionType: "badge_issued",
      description: `출입증 발급: ${badgeNumber}`,
    });

    const newBadge = await Badge.findByBadgeNumber(db, badgeNumber);

    res.status(201).json({
      success: true,
      message: "출입증이 발급되었습니다.",
      data: newBadge,
    });
  } catch (error) {
    console.error("출입증 발급 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 출입증 반납
router.post("/return/:badgeId", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { badgeId } = req.params;
    const { returnedBy } = req.body;

    // 출입증 반납
    await Badge.return(db, badgeId, returnedBy);

    // 출입증 정보 조회
    const badge = await Badge.findByBadgeNumber(
      db,
      (await db.execute("SELECT badgeNumber FROM visit_badges WHERE id = ?", [badgeId]))[0][0]
        .badgeNumber
    );

    // 활동 로그 기록
    await ActivityLog.create(db, {
      requestId: badge.requestId,
      userId: returnedBy,
      actionType: "badge_returned",
      description: `출입증 반납: ${badge.badgeNumber}`,
    });

    res.json({
      success: true,
      message: "출입증이 반납되었습니다.",
    });
  } catch (error) {
    console.error("출입증 반납 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 출입증 번호로 조회
router.get("/number/:badgeNumber", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const badge = await Badge.findByBadgeNumber(db, req.params.badgeNumber);

    if (!badge) {
      return res.status(404).json({ message: "출입증을 찾을 수 없습니다." });
    }

    // 방문 요청 정보도 함께 조회
    const request = await VisitorRequest.findById(db, badge.requestId);

    res.json({
      success: true,
      data: {
        badge,
        request,
      },
    });
  } catch (error) {
    console.error("출입증 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 출입증 목록 조회
router.get("/", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.visitDate) filters.visitDate = req.query.visitDate;

    const badges = await Badge.findAll(db, filters);

    res.json({ success: true, data: badges });
  } catch (error) {
    console.error("출입증 목록 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;

