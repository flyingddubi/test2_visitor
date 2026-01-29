const express = require("express");
const router = express.Router();
const Approval = require("../models/Approval");
const ActivityLog = require("../models/ActivityLog");
const Request = require("../models/Request");

// 방문 요청 등록 (외부자용)
router.post("/", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const {
      businessId,
      visitorName,
      visitorPhone,
      visitorCompany,
      visitorEmail,
      visitDateFrom,
      visitDateTo,
      visitPurpose,
      internalContact,
      location,
      privacyConsent,
      additionalVisitors = [],
    } = req.body;

    if (!visitorName || !visitorPhone || !visitDateFrom || !visitDateTo || !visitPurpose) {
      return res.status(400).json({ message: "필수 항목을 입력해주세요." });
    }

    if (!privacyConsent) {
      return res
        .status(400)
        .json({ message: "개인정보 처리 동의가 필요합니다." });
    }

    // reqId 생성 (businessId가 없으면 기본값 "REQ" 사용)
    const reqId = await Request.createReqId(db, businessId || "REQ");

    // 방문 요청 생성
    const requestId = await Request.create(db, {
      reqId,
      visitorName,
      visitorPhone,
      visitorCompany,
      visitorEmail,
      visitDateFrom,
      visitDateTo,
      visitPurpose,
      internalContact,
      location,
      privacyConsent,
      createdBy: "test",
      updatedBy: "test",
    });

    // 요청 작성자 방문자 정보 저장 (에러가 발생해도 메인 요청은 성공)
    const { mainCarNumber, mainItemCount, mainItems } = req.body;
    try {
      await Request.createVisitorInfo(db, {
        reqId: reqId,
        visitorSeq: 1,
        visitorEmail: visitorEmail,
        visitorPhone: visitorPhone,
        visitorName: visitorName,
        visitorCompany: visitorCompany,
        visitDateFrom: visitDateFrom,
        visitDateTo: visitDateTo,
        carNo: mainCarNumber || null,
        itemCnt: mainItemCount || 0,
        createdBy: "test",
        updatedBy: "test",
      });
      console.log("요청 작성자 방문자 정보 저장 성공");
      
      // 메인 방문 요청자의 전산기기 정보 저장
      if (mainItems && Array.isArray(mainItems) && mainItems.length > 0) {
        try {
          let itemSeq = 1;
          for (const item of mainItems) {
            await Request.createItemInfo(db, {
              reqId: reqId,
              visitorSeq: 1,
              itemSeq: itemSeq,
              itemGubun: item.itemGubun || "",
              itemDesc: item.itemDesc || "",
              itemModel: item.itemModel || "",
              itemNo: item.itemNo || "",
              createdBy: "test",
              updatedBy: "test",
            });
            itemSeq++;
          }
          console.log(`메인 방문 요청자 전산기기 정보 저장 성공 (${mainItems.length}개)`);
        } catch (itemError) {
          console.error("메인 방문 요청자 전산기기 정보 저장 실패:", itemError);
        }
      }
    } catch (visitorInfoError) {
      console.error("요청 작성자 방문자 정보 저장 실패:", visitorInfoError);
      // 에러가 발생해도 메인 요청은 계속 진행
    }

    // 추가 방문자들 정보 저장
    if (additionalVisitors && Array.isArray(additionalVisitors)) {
      let visitorSeq = 2; // 요청 작성자가 1이므로 추가 방문자는 2부터 시작
      for (const visitor of additionalVisitors) {
        if (visitor.visitorName && visitor.visitorPhone && visitor.visitDateFrom && visitor.visitDateTo) {
          try {
            await Request.createVisitorInfo(db, {
              reqId: reqId,
              visitorSeq: visitorSeq,
              visitorName: visitor.visitorName || "",
              visitorCompany: visitor.visitorCompany || "",
              visitorPhone: visitor.visitorPhone || "",
              visitorEmail: visitor.visitorEmail || "",
              visitDateFrom: visitor.visitDateFrom || "",
              visitDateTo: visitor.visitDateTo || "",
              carNo: visitor.carNumber || null,
              itemCnt: visitor.itemCount || 0,
              createdBy: "test",
              updatedBy: "test",
            });
            console.log(`추가 방문자 정보 저장 성공: ${visitor.visitorName} (seq: ${visitorSeq})`);
            
            // 전산기기 정보 저장
            if (visitor.items && Array.isArray(visitor.items) && visitor.items.length > 0) {
              try {
                let itemSeq = 1; // 전산기기 시퀀스는 1부터 시작
                for (const item of visitor.items) {
                  await Request.createItemInfo(db, {
                    reqId: reqId,
                    visitorSeq: visitorSeq,
                    itemSeq: itemSeq,
                    itemGubun: item.itemGubun || "",
                    itemDesc: item.itemDesc || "",
                    itemModel: item.itemModel || "",
                    itemNo: item.itemNo || "",
                    createdBy: "test",
                    updatedBy: "test",
                  });
                  itemSeq++; // 다음 전산기기를 위해 seq 증가
                }
                console.log(`추가 방문자 전산기기 정보 저장 성공: ${visitor.visitorName} (${visitor.items.length}개)`);
              } catch (itemError) {
                console.error(`추가 방문자 전산기기 정보 저장 실패 (${visitor.visitorName}):`, itemError);
              }
            }
            
            visitorSeq++; // 다음 방문자를 위해 seq 증가
          } catch (additionalVisitorError) {
            console.error(`추가 방문자 정보 저장 실패 (${visitor.visitorName}):`, additionalVisitorError);
            // 개별 방문자 저장 실패해도 계속 진행
            visitorSeq++; // 실패해도 seq는 증가시켜야 함
          }
        }
      }
    }

    // 방문 이력 저장/업데이트
    // await VisitorHistory.createOrUpdate(db, {
    //   visitorPhone,
    //   visitorName,
    //   visitorCompany,
    //   visitPurpose,
    //   internalContact,
    //   location,
    //   visitDate,
    // });

    // 활동 로그 기록
    // await ActivityLog.create(db, {
    //   requestId,
    //   userId: null,
    //   actionType: "request_created",
    //   description: `방문 요청 생성: ${visitorName}`,
    // });

    const newRequest = await Request.findById(db, requestId);

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

// 내부자 승인 (User)
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

// 1차 승인 (Approver Lv1)
// router.post("/approver-lv1/:requestId", async (req, res) => {
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

//     if (request.status !== "user_approved") {
//       return res
//         .status(400)
//         .json({ message: "내부자 승인이 먼저 필요합니다." });
//     }

//     // 승인 생성
//     await Approval.create(db, {
//       requestId,
//       approverId: userId,
//       approvalLevel: "approver_lv1",
//       status: "approved",
//       comment,
//     });

//     // 요청 상태 업데이트
//     await VisitorRequest.updateStatus(db, requestId, "approver_lv1_approved");

//     // 활동 로그 기록
//     await ActivityLog.create(db, {
//       requestId,
//       userId,
//       actionType: "approver_lv1_approved",
//       description: "1차 승인 완료",
//     });

//     res.json({
//       success: true,
//       message: "1차 승인이 완료되었습니다.",
//     });
//   } catch (error) {
//     console.error("1차 승인 오류:", error);
//     res.status(500).json({ message: "서버 오류가 발생했습니다." });
//   }
// });

// 2차 승인 (Approver Lv2)
// router.post("/approver-lv2/:requestId", async (req, res) => {
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

//     if (request.status !== "approver_lv1_approved") {
//       return res
//         .status(400)
//         .json({ message: "1차 승인이 먼저 필요합니다." });
//     }

//     // 승인 생성
//     await Approval.create(db, {
//       requestId,
//       approverId: userId,
//       approvalLevel: "approver_lv2",
//       status: "approved",
//       comment,
//     });

//     // 요청 상태 업데이트
//     await VisitorRequest.updateStatus(db, requestId, "approver_lv2_approved");

//     // 활동 로그 기록
//     await ActivityLog.create(db, {
//       requestId,
//       userId,
//       actionType: "approver_lv2_approved",
//       description: "2차 승인 완료 (최종 승인)",
//     });

//     res.json({
//       success: true,
//       message: "2차 승인이 완료되었습니다. 출입증 발급이 가능합니다.",
//     });
//   } catch (error) {
//     console.error("2차 승인 오류:", error);
//     res.status(500).json({ message: "서버 오류가 발생했습니다." });
//   }
// });

// 승인 반려
// router.post("/reject/:requestId", async (req, res) => {
//   const db = req.app.locals.db;
//   if (!db) {
//     return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
//   }

//   try {
//     const { requestId } = req.params;
//     const { userId, rejectionReason, approvalLevel } = req.body;

//     const request = await VisitorRequest.findById(db, requestId);
//     if (!request) {
//       return res.status(404).json({ message: "방문 요청을 찾을 수 없습니다." });
//     }

//     // 승인 생성 (반려)
//     await Approval.create(db, {
//       requestId,
//       approverId: userId,
//       approvalLevel: approvalLevel || "user",
//       status: "rejected",
//       comment: rejectionReason,
//     });

//     // 요청 상태 업데이트
//     await VisitorRequest.updateStatus(
//       db,
//       requestId,
//       "rejected",
//       rejectionReason
//     );

//     // 활동 로그 기록
//     await ActivityLog.create(db, {
//       requestId,
//       userId,
//       actionType: "request_rejected",
//       description: `승인 반려: ${rejectionReason}`,
//     });

//     res.json({
//       success: true,
//       message: "방문 요청이 반려되었습니다.",
//     });
//   } catch (error) {
//     console.error("승인 반려 오류:", error);
//     res.status(500).json({ message: "서버 오류가 발생했습니다." });
//   }
// });

// 방문자 목록 조회 (reqId로)
router.get("/visitors/:reqId", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const visitors = await Request.findVisitorsByReqId(db, req.params.reqId);
    
    res.json({ 
      success: true, 
      data: visitors
    });
  } catch (error) {
    console.error("방문자 목록 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 전산기기 목록 조회 (reqId와 visitorSeq로)
router.get("/items/:reqId/:visitorSeq", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { reqId, visitorSeq } = req.params;
    const items = await Request.findItemsByReqIdAndVisitorSeq(db, reqId, visitorSeq);
    
    res.json({ 
      success: true, 
      data: items
    });
  } catch (error) {
    console.error("전산기기 목록 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 방문 요청 상세 조회
router.get("/:requestId", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const requestDetail = await Request.findById(db, req.params.requestId);

    if (!requestDetail) {
      return res.status(404).json({ message: "방문 요청을 찾을 수 없습니다." });
    }

    // 추가 방문자 목록 조회 (visitorSeq가 2 이상인 방문자들)
    const additionalVisitors = await Request.findVisitorsByReqId(db, requestDetail.reqId);
    // visitorSeq가 2 이상인 것만 필터링 (요청 작성자는 1이므로)
    const filteredVisitors = additionalVisitors.filter(v => v.visitorSeq >= 2);

    res.json({ 
      success: true, 
      data: {
        ...requestDetail,
        additionalVisitors: filteredVisitors
      }
    });
  } catch (error) {
    console.error("방문 요청 상세 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});


//router.get("/", authenticateToken, async (req, res) => {
router.get("/", async (req, res) => {
  // 데이터베이스 연결 가져오기
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const request = await Request.findRequestAll(db);

    res.json(request);
  } catch (error) {
    console.error("전체 방문요청 불러오기 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});


router.put("/:id", async (req, res) => {
  // 데이터베이스 연결 가져오기
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { status, rejectionReason, additionalVisitors = [] } = req.body;

    const result = await Request.update(db, {
      id: req.params.id,
      status: '6', // 6: 반려
      rejectionReason,
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "방문 요청을 찾을 수 없습니다." });
    }

    // reqId 가져오기
    const request = await Request.findById(db, req.params.id);
    if (!request) {
      return res.status(404).json({ message: "방문 요청을 찾을 수 없습니다." });
    }

    // 추가 방문자들의 차량번호, 전산기기 정보 업데이트 및 저장
    if (additionalVisitors && Array.isArray(additionalVisitors)) {
      for (const visitor of additionalVisitors) {
        if (visitor.visitorSeq) {
          try {
            // 방문자 정보 업데이트 (차량번호, 전산기기 수)
            if (visitor.carNumber !== undefined || visitor.itemCount !== undefined) {
              await Request.updateVisitorInfo(db, {
                reqId: request.reqId,
                visitorSeq: visitor.visitorSeq,
                carNo: visitor.carNumber || null,
                itemCnt: visitor.itemCount || 0,
              });
              console.log(`방문자 정보 업데이트 성공: seq ${visitor.visitorSeq}`);
            }

            // 전산기기 정보 저장
            if (visitor.items && Array.isArray(visitor.items) && visitor.items.length > 0) {
              let itemSeq = 1; // 전산기기 시퀀스는 1부터 시작
              for (const item of visitor.items) {
                await Request.createItemInfo(db, {
                  reqId: request.reqId,
                  visitorSeq: visitor.visitorSeq,
                  itemSeq: itemSeq,
                  itemGubun: item.itemGubun || "",
                  itemDesc: item.itemDesc || "",
                  itemModel: item.itemModel || "",
                  itemNo: item.itemNo || "",
                  createdBy: "test",
                  updatedBy: "test",
                });
                itemSeq++; // 다음 전산기기를 위해 seq 증가
              }
              console.log(`전산기기 정보 저장 성공: seq ${visitor.visitorSeq} (${visitor.items.length}개)`);
            }
          } catch (updateError) {
            console.error(`방문자 정보 업데이트 실패 (seq ${visitor.visitorSeq}):`, updateError);
          }
        }
      }
    }

    const updatedRequest = await Request.findById(db, req.params.id);
    res.json({ 
      success: true,
      message: "방문 요청이 성공적으로 수정되었습니다.", 
      data: updatedRequest 
    });
  } catch (error) {
    console.error("방문 요청 수정 오류:", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});



// 과거 방문 기록 조회 (전화번호로)
router.get("/history/:phone", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const history = await Request.findByPhone(db, req.params.phone);

    res.json({ success: true, data: history });
  } catch (error) {
    console.error("방문 이력 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;

