const express = require("express");
const router = express.Router();
const Approval = require("../models/Approval");
const VisitorRequest = require("../models/VisitorRequest");
const ActivityLog = require("../models/ActivityLog");

// 내부자 승인 (User)
router.post("/user/:requestId", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { requestId } = req.params;
    const { userId, comment } = req.body;

    const request = await VisitorRequest.findById(db, requestId);
    if (!request) {
      return res.status(404).json({ message: "방문 요청을 찾을 수 없습니다." });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "이미 처리된 요청입니다." });
    }

    // 승인 생성
    await Approval.create(db, {
      requestId,
      approverId: userId,
      approvalLevel: "user",
      status: "approved",
      comment,
    });

    // 요청 상태 업데이트
    await VisitorRequest.updateStatus(db, requestId, "user_approved");

    // 활동 로그 기록
    await ActivityLog.create(db, {
      requestId,
      userId,
      actionType: "user_approved",
      description: "내부자 승인 완료",
    });

    res.json({
      success: true,
      message: "내부자 승인이 완료되었습니다.",
    });
  } catch (error) {
    console.error("내부자 승인 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 1차 승인 (Approver Lv1)
router.post("/approver-lv1/:requestId", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { requestId } = req.params;
    const { userId, comment } = req.body;

    const request = await VisitorRequest.findById(db, requestId);
    if (!request) {
      return res.status(404).json({ message: "방문 요청을 찾을 수 없습니다." });
    }

    if (request.status !== "user_approved") {
      return res
        .status(400)
        .json({ message: "내부자 승인이 먼저 필요합니다." });
    }

    // 승인 생성
    await Approval.create(db, {
      requestId,
      approverId: userId,
      approvalLevel: "approver_lv1",
      status: "approved",
      comment,
    });

    // 요청 상태 업데이트
    await VisitorRequest.updateStatus(db, requestId, "approver_lv1_approved");

    // 활동 로그 기록
    await ActivityLog.create(db, {
      requestId,
      userId,
      actionType: "approver_lv1_approved",
      description: "1차 승인 완료",
    });

    res.json({
      success: true,
      message: "1차 승인이 완료되었습니다.",
    });
  } catch (error) {
    console.error("1차 승인 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 2차 승인 (Approver Lv2)
router.post("/approver-lv2/:requestId", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { requestId } = req.params;
    const { userId, comment } = req.body;

    const request = await VisitorRequest.findById(db, requestId);
    if (!request) {
      return res.status(404).json({ message: "방문 요청을 찾을 수 없습니다." });
    }

    if (request.status !== "approver_lv1_approved") {
      return res
        .status(400)
        .json({ message: "1차 승인이 먼저 필요합니다." });
    }

    // 승인 생성
    await Approval.create(db, {
      requestId,
      approverId: userId,
      approvalLevel: "approver_lv2",
      status: "approved",
      comment,
    });

    // 요청 상태 업데이트
    await VisitorRequest.updateStatus(db, requestId, "approver_lv2_approved");

    // 활동 로그 기록
    await ActivityLog.create(db, {
      requestId,
      userId,
      actionType: "approver_lv2_approved",
      description: "2차 승인 완료 (최종 승인)",
    });

    res.json({
      success: true,
      message: "2차 승인이 완료되었습니다. 출입증 발급이 가능합니다.",
    });
  } catch (error) {
    console.error("2차 승인 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 승인 반려
router.post("/reject/:requestId", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { requestId } = req.params;
    const { userId, rejectionReason, approvalLevel } = req.body;

    const request = await VisitorRequest.findById(db, requestId);
    if (!request) {
      return res.status(404).json({ message: "방문 요청을 찾을 수 없습니다." });
    }

    // 승인 생성 (반려)
    await Approval.create(db, {
      requestId,
      approverId: userId,
      approvalLevel: approvalLevel || "user",
      status: "rejected",
      comment: rejectionReason,
    });

    // 요청 상태 업데이트
    await VisitorRequest.updateStatus(
      db,
      requestId,
      "rejected",
      rejectionReason
    );

    // 활동 로그 기록
    await ActivityLog.create(db, {
      requestId,
      userId,
      actionType: "request_rejected",
      description: `승인 반려: ${rejectionReason}`,
    });

    res.json({
      success: true,
      message: "방문 요청이 반려되었습니다.",
    });
  } catch (error) {
    console.error("승인 반려 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 승인 이력 조회
router.get("/:requestId", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const approvals = await Approval.findByRequestId(db, req.params.requestId);

    res.json({ success: true, data: approvals });
  } catch (error) {
    console.error("승인 이력 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;

