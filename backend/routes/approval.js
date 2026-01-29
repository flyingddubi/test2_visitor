const express = require("express");
const router = express.Router();
const Approval = require("../models/Approval");
const Request = require("../models/Request");
const ActivityLog = require("../models/ActivityLog");

// // 내부자 승인 (User)
// router.post("/user/:requestId", async (req, res) => {
//   const db = req.app.locals.db;
//   if (!db) {
//     return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
//   }

//   try {
//     const { requestId } = req.params;
//     const { userId, comment } = req.body;

//     const request = await VisitorRequest.findById(db, requestId);
//     if (!request) {
//       return res.status(404).json({ message: "방문 요청을 찾을 수 없습니다." });
//     }

//     if (request.status !== "pending") {
//       return res
//         .status(400)
//         .json({ message: "이미 처리된 요청입니다." });
//     }

//     // 승인 생성
//     await Approval.create(db, {
//       requestId,
//       approverId: userId,
//       approvalLevel: "user",
//       status: "approved",
//       comment,
//     });

//     // 요청 상태 업데이트
//     await VisitorRequest.updateStatus(db, requestId, "user_approved");

//     // 활동 로그 기록
//     await ActivityLog.create(db, {
//       requestId,
//       userId,
//       actionType: "user_approved",
//       description: "내부자 승인 완료",
//     });

//     res.json({
//       success: true,
//       message: "내부자 승인이 완료되었습니다.",
//     });
//   } catch (error) {
//     console.error("내부자 승인 오류:", error);
//     res.status(500).json({ message: "서버 오류가 발생했습니다." });
//   }
// });


// 결재 상신
router.post("/:id", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { id } = req.params;
    const { BusinessId, ...formData } = req.body;

    // 방문 요청 조회
    // const request = await Request.findByRequestId(db, id);
    // if (!request) {
    //   return res.status(404).json({ message: "방문 요청을 찾을 수 없습니다." });
    // }

    // if (request.status !== "0") {
    //   return res
    //     .status(400)
    //     .json({ message: "이미 처리된 요청입니다." });
    // }

    // apprId 생성
    const apprId = await Approval.createApprId(db, id, BusinessId);

    // 승인 생성
    await Approval.create(db, {
      BusinessId: BusinessId,
      apprId: apprId,
      apprType: formData.apprType || "VIST-001",
      apprTitle: "방문요청",
      status: "1",
      status_trans: "0",
      apprContents: JSON.stringify(formData),
      apprSubmitDt: new Date(),
      compCd: "516",
      createdBy: "test",
      updatedBy: "test",
    });

    // 요청 상태 업데이트
    await Request.updateStatus(db, id, "2");

    res.json({
      success: true,
      message: "결재 상신이 완료되었습니다.",
    });
  } catch (error) {
    console.error("결재 상신 오류:", error);
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

