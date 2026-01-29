const express = require("express");
const router = express.Router();
const AccessCard = require("../models/AccessCard");

// 사용 가능한 카드 목록 조회
router.get("/", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const cards = await AccessCard.findAvailableCards(db);
    
    res.json({ 
      success: true, 
      data: cards
    });
  } catch (error) {
    console.error("카드 목록 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 카드 발급
router.put("/", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { reqId, visitorSeq, cardNo } = req.body;

    if (!reqId || !visitorSeq || !cardNo) {
      return res.status(400).json({ message: "필수 항목을 입력해주세요." });
    }

    await AccessCard.issueCard(db, reqId, visitorSeq, cardNo);
    
    // 카드 상태 업데이트 (사용 중으로 변경)
    await AccessCard.updateCardInfo(db, cardNo);
    
    res.json({ 
      success: true, 
      message: "카드가 성공적으로 발급되었습니다."
    });
  } catch (error) {
    console.error("카드 발급 오류:", error);
    res.status(500).json({ 
      message: error.message || "서버 오류가 발생했습니다." 
    });
  }
});

// 카드 반납
router.put("/return", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { reqId, visitorSeq, cardNo } = req.body;

    if (!reqId || !visitorSeq || !cardNo) {
      return res.status(400).json({ message: "필수 항목을 입력해주세요." });
    }

    await AccessCard.returnCard(db, reqId, visitorSeq, cardNo);
    
    res.json({ 
      success: true, 
      message: "카드가 성공적으로 반납되었습니다."
    });
  } catch (error) {
    console.error("카드 반납 오류:", error);
    res.status(500).json({ 
      message: error.message || "서버 오류가 발생했습니다." 
    });
  }
});

// 미출입 처리
router.put("/NoIssue", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { reqId, visitorSeq } = req.body;

    if (!reqId || !visitorSeq) {
      return res.status(400).json({ message: "필수 항목을 입력해주세요." });
    }

    await AccessCard.updateNoIssue(db, reqId, visitorSeq);
    
    res.json({ 
      success: true, 
      message: "미출입으로 처리되었습니다."
    });
  } catch (error) {
    console.error("미출입 처리 오류:", error);
    res.status(500).json({ 
      message: error.message || "서버 오류가 발생했습니다." 
    });
  }
});

// 재발급 처리
router.put("/reIssue", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { reqId, visitorSeq, cardNo } = req.body;

    if (!reqId || !visitorSeq) {
      return res.status(400).json({ message: "필수 항목을 입력해주세요." });
    }

    await AccessCard.reIssueCard(db, reqId, visitorSeq, cardNo || null);
    
    res.json({ 
      success: true, 
      message: "재발급이 가능한 상태로 변경되었습니다."
    });
  } catch (error) {
    console.error("재발급 처리 오류:", error);
    res.status(500).json({ 
      message: error.message || "서버 오류가 발생했습니다." 
    });
  }
});

module.exports = router;

