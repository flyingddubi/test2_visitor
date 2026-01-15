const express = require("express");
const router = express.Router();
const VisitorRequest = require("../models/VisitorRequest");
const VisitorHistory = require("../models/VisitorHistory");
const ActivityLog = require("../models/ActivityLog");

// 방문 요청 등록 (외부자용)
router.post("/", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const {
      visitorName,
      visitorPhone,
      visitorCompany,
      visitorEmail,
      visitDate,
      visitPurpose,
      internalContact,
      location,
      privacyConsent,
    } = req.body;

    if (!visitorName || !visitorPhone || !visitDate || !visitPurpose) {
      return res.status(400).json({ message: "필수 항목을 입력해주세요." });
    }

    if (!privacyConsent) {
      return res
        .status(400)
        .json({ message: "개인정보 처리 동의가 필요합니다." });
    }

    // 방문 요청 생성
    const requestId = await VisitorRequest.create(db, {
      visitorName,
      visitorPhone,
      visitorCompany,
      visitorEmail,
      visitDate,
      visitPurpose,
      internalContact,
      location,
      privacyConsent,
    });

    // 방문 이력 저장/업데이트
    await VisitorHistory.createOrUpdate(db, {
      visitorPhone,
      visitorName,
      visitorCompany,
      visitPurpose,
      internalContact,
      location,
      visitDate,
    });

    // 활동 로그 기록
    await ActivityLog.create(db, {
      requestId,
      userId: null,
      actionType: "request_created",
      description: `방문 요청 생성: ${visitorName}`,
    });

    const newRequest = await VisitorRequest.findById(db, requestId);

    res.status(201).json({
      success: true,
      message: "방문 요청이 성공적으로 등록되었습니다.",
      data: newRequest,
    });
  } catch (error) {
    console.error("방문 요청 등록 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 방문 요청 목록 조회
router.get("/", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.visitDate) filters.visitDate = req.query.visitDate;
    if (req.query.visitorPhone) filters.visitorPhone = req.query.visitorPhone;

    const requests = await VisitorRequest.findAll(db, filters);

    res.json({ success: true, data: requests });
  } catch (error) {
    console.error("방문 요청 목록 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 특정 방문 요청 조회
router.get("/:id", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const request = await VisitorRequest.findById(db, req.params.id);

    if (!request) {
      return res.status(404).json({ message: "방문 요청을 찾을 수 없습니다." });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    console.error("방문 요청 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 과거 방문 기록 조회 (전화번호로)
router.get("/history/:phone", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const history = await VisitorHistory.findByPhone(db, req.params.phone);

    res.json({ success: true, data: history });
  } catch (error) {
    console.error("방문 이력 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;

