// MariaDB용 Request 모델
class Request {
  // reqId 생성 (BusinessId + YYMMDD + 시퀀스)
  static async createReqId(db, businessId) {
    // 현재 시간을 YYMMDD 형식으로 변환 (2자리 년도)
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2); // 마지막 2자리만
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // 시퀀스 값 가져오기
    const [seqResult] = await db.execute(
      `SELECT NEXT VALUE FOR reqid_seq AS seqValue`
    );
    const seqValue = String(seqResult[0].seqValue).padStart(4, '0');

    // reqId 생성: BusinessId + - + YYMMDD + 시퀀스
    const reqId = `${businessId}-${dateStr}${seqValue}`;

    return reqId;
  }

  // 새 방문 요청 생성
  static async create(db, requestData) {
    const {
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
      createdBy,
      updatedBy,
    } = requestData;

    const [result] = await db.execute(
      `INSERT INTO visit_visitor_requests 
       (reqId, visitorName, visitorPhone, visitorCompany, visitorEmail, visitDateFrom, visitDateTo, 
        visitPurpose, internalContact, location, privacyConsent, consentDate, status, createdBy, updatedBy) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), '0', ?, ?)`,
      [
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
        createdBy,
        updatedBy,
      ]
    );

    return result.insertId;
  }

  // 특정 방문 요청 찾기
  static async findById(db, requestId) {
    const [rows] = await db.execute(
      "SELECT * FROM visit_visitor_requests WHERE reqId = ?",
      [requestId]
    );
    return rows[0] || null;
  }

  // 승인 생성
  // static async create(db, approvalData) {
  //   const { requestId, approverId, approvalLevel, status, comment } =
  //     approvalData;

  //   const [result] = await db.execute(
  //     `INSERT INTO visit_approvals (requestId, approverId, approvalLevel, status, comment) 
  //      VALUES (?, ?, ?, ?, ?)`,
  //     [requestId, approverId, approvalLevel, status, comment]
  //   );

  //   return result.insertId;
  // }

  // 특정 요청의 승인 이력 조회
  // static async findByRequestId(db, requestId) {
  //   const [rows] = await db.execute(
  //     `SELECT a.*, u.name as approverName, u.userType 
  //      FROM visit_approvals a 
  //      LEFT JOIN visit_users u ON a.approverId = u.id 
  //      WHERE a.requestId = ? 
  //      ORDER BY a.createdAt ASC`,
  //     [requestId]
  //   );
  //   return rows || [];
  // }
  // static async findByRequestId(db, requestId) {
  //   const [rows] = await db.execute(
  //     `SELECT * FROM visit_visitor_requests WHERE id = ?`,
  //     [requestId]
  //   );
  //   return rows[0] || null;
  // }

  // 특정 레벨의 승인 확인
  // static async findByRequestIdAndLevel(db, requestId, approvalLevel) {
  //   const [rows] = await db.execute(
  //     "SELECT * FROM visit_approvals WHERE requestId = ? AND approvalLevel = ?",
  //     [requestId, approvalLevel]
  //   );
  //   return rows[0] || null;
  // }


  // 전체 방문요청건 전체목록 조회
  static async findRequestAll(db) {
    const [rows] = await db.execute(
      `SELECT 
         A.reqId, 
         A.visitorName, 
         A.visitorPhone, 
         A.visitorCompany, 
         A.visitorEmail, 
          DATE_FORMAT(A.visitDateFrom, '%Y-%m-%d') as visitDateFrom,
          DATE_FORMAT(A.visitDateTo, '%Y-%m-%d') as visitDateTo,
         A.visitPurpose, 
         A.internalContact, 
         A.location, 
         A.status, 
         A.createdAt, 
         A.updatedAt, 
      B.codeName FROM visit_visitor_requests A
      LEFT JOIN code B ON A.status = B.codeValue AND B.codegroupId = 'COMM_002'
      ORDER BY A.reqId desc`    );
    return rows || null;
  }

  // 방문 요청 수정
  static async update(db, requestData) {
    const { id, status, rejectionReason } = requestData;
    const [result] = await db.execute(
      `UPDATE visit_visitor_requests SET status = ?, rejectionReason = ?, updatedAt = NOW() WHERE reqId = ?`,
      [status, rejectionReason, id]
    );

    return result;
  }

  // 방문 요청 상태 업데이트
  static async updateStatus(db, requestId, status) {
    const [result] = await db.execute(
      `UPDATE visit_visitor_requests SET status = ?, updatedAt = NOW() WHERE reqId = ?`,
      [status, requestId]
    );
    return result;
  }

  // reqId로 추가 방문자 목록 조회
  static async findVisitorsByReqId(db, reqId) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          reqId,
          visitorSeq,
          visitorName,
          visitorPhone,
          visitorCompany,
          visitorEmail,
          DATE_FORMAT(visitDateFrom, '%Y-%m-%d') as visitDateFrom,
          DATE_FORMAT(visitDateTo, '%Y-%m-%d') as visitDateTo,
          carNo,
          itemCnt,
          accessCardNo,
          accessCardIssueStat,
          createdAt,
          createdBy,
          updatedAt,
          updatedBy
         FROM visit_visitor_requests_visitors 
         WHERE reqId = ? 
         ORDER BY visitorSeq ASC`,
        [reqId]
      );
      return rows || [];
    } catch (error) {
      console.error("추가 방문자 조회 오류:", error);
      throw error;
    }
  }

  // 방문자 정보 저장 (visit_visitor_history 테이블에 저장/업데이트)
  static async createVisitorInfo(db, visitorData) {
    try {
      const {
        reqId,
        visitorSeq,
        visitorPhone,
        visitorName,
        visitorCompany,
        visitorEmail,
        visitDateFrom,
        visitDateTo,
        carNo,
        itemCnt,
        createdBy,
        updatedBy,
      } = visitorData;

      console.log("createVisitorInfo 호출됨:", { reqId, visitorSeq, visitorPhone, visitorName, visitDateFrom, visitDateTo, carNo, itemCnt, createdBy, updatedBy });

      // 필수 필드 검증
      if (!reqId || !visitorSeq || !visitorPhone || !visitorName || !visitDateFrom) {
        throw new Error(`필수 필드 누락: reqId=${reqId}, visitorSeq=${visitorSeq}, visitorPhone=${visitorPhone}, visitorName=${visitorName}, visitDateFrom=${visitDateFrom}, createdBy=${createdBy}, updatedBy=${updatedBy}`);
      }

      // 새로 생성
      console.log("새 방문자 정보 생성");
      const [result] = await db.execute(
        `INSERT INTO visit_visitor_requests_visitors 
         (reqId, visitorSeq, visitorName, visitorPhone, visitorCompany, visitorEmail, visitDateFrom, visitDateTo, carNo, itemCnt, createdBy, updatedBy) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [reqId, visitorSeq, visitorName, visitorPhone, visitorCompany, visitorEmail, visitDateFrom, visitDateTo, carNo || null, itemCnt || 0, createdBy, updatedBy]
      );
      console.log("방문자 정보 생성 완료:", result);
      return result;

    } catch (error) {
      console.error("createVisitorInfo 에러 발생:", error);
      console.error("에러 상세:", {
        message: error.message,
        stack: error.stack,
        visitorData,
      });
      throw error; // 에러를 다시 던져서 상위에서 처리할 수 있도록
    }
  }

  // 방문자 정보 업데이트 (carNo, itemCnt)
  static async updateVisitorInfo(db, visitorData) {
    try {
      const {
        reqId,
        visitorSeq,
        carNo,
        itemCnt,
      } = visitorData;

      const [result] = await db.execute(
        `UPDATE visit_visitor_requests_visitors 
         SET carNo = ?, itemCnt = ?, updatedAt = NOW() 
         WHERE reqId = ? AND visitorSeq = ?`,
        [carNo || null, itemCnt || 0, reqId, visitorSeq]
      );
      console.log("방문자 정보 업데이트 완료:", result);
      return result;
    } catch (error) {
      console.error("updateVisitorInfo 에러 발생:", error);
      throw error;
    }
  }

  // 전산기기 정보 저장
  static async createItemInfo(db, itemData) {
    try {
      const {
        reqId,
        visitorSeq,
        itemSeq,
        itemGubun,
        itemDesc,
        itemModel,
        itemNo,
        createdBy,
        updatedBy,
      } = itemData;

      console.log("createItemInfo 호출됨:", { reqId, visitorSeq, itemSeq, itemGubun, itemDesc, itemModel, itemNo });

      // 필수 필드 검증
      if (!reqId || !visitorSeq || !itemSeq) {
        throw new Error(`필수 필드 누락: reqId=${reqId}, visitorSeq=${visitorSeq}, itemSeq=${itemSeq}`);
      }

      const [result] = await db.execute(
        `INSERT INTO visit_visitor_requests_Items 
         (reqId, visitorSeq, itemSeq, itemGubun, itemDesc, itemModel, itemNo, createdBy, updatedBy) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [reqId, visitorSeq, itemSeq, itemGubun || "", itemDesc || "", itemModel || "", itemNo || "", createdBy, updatedBy]
      );
      console.log("전산기기 정보 생성 완료:", result);
      return result;
    } catch (error) {
      console.error("createItemInfo 에러 발생:", error);
      console.error("에러 상세:", {
        message: error.message,
        stack: error.stack,
        itemData,
      });
      throw error;
    }
  }

  // reqId와 visitorSeq로 전산기기 목록 조회
  static async findItemsByReqIdAndVisitorSeq(db, reqId, visitorSeq) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          reqId,
          visitorSeq,
          itemSeq,
          itemGubun,
          itemDesc,
          itemModel,
          itemNo,
          createdAt,
          createdBy,
          updatedAt,
          updatedBy
         FROM visit_visitor_requests_Items 
         WHERE reqId = ? AND visitorSeq = ? 
         ORDER BY itemSeq ASC`,
        [reqId, visitorSeq]
      );
      return rows || [];
    } catch (error) {
      console.error("전산기기 조회 오류:", error);
      throw error;
    }
  }

  // 전화번호로 최근 방문 기록 조회 (visitorSeq = 1인 메인 방문 요청자)
  static async findByPhone(db, phone) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          r.reqId,
          r.visitorName,
          r.visitorPhone,
          r.visitorCompany,
          r.visitorEmail,
          DATE_FORMAT(r.visitDateFrom, '%Y-%m-%d') as visitDateFrom,
          DATE_FORMAT(r.visitDateTo, '%Y-%m-%d') as visitDateTo,
          r.visitPurpose,
          r.internalContact,
          r.location,
          r.status,
          r.createdAt,
          r.updatedAt,
          v.visitorSeq,
          v.carNo,
          v.itemCnt
         FROM visit_visitor_requests_visitors v
         INNER JOIN visit_visitor_requests r ON v.reqId = r.reqId
         WHERE v.visitorSeq = 1 AND v.visitorPhone = ?
         ORDER BY v.reqId DESC
         LIMIT 1`,
        [phone]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("전화번호로 방문 기록 조회 오류:", error);
      throw error;
    }
  }
}

module.exports = Request;

