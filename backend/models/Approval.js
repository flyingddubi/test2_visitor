// MariaDB용 Approval 모델
class Approval {
  // 결재 ID 생성 (BusinessId + YYYYMMDDHHMMSS + 시퀀스)
  static async createApprId(db, requestId, BusinessId) {
    // 현재 시간을 YYYYMMDDHHMMSS 형식으로 변환
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

    // 시퀀스 값 가져오기
    const [seqResult] = await db.execute(
      `SELECT NEXT VALUE FOR apprId_seq AS seqValue`
    );
    const seqValue = String(seqResult[0].seqValue).padStart(4, '0');

    // apprId 생성: BusinessId + - + YYYYMMDDHHMMSS + 시퀀스
    const apprId = `${BusinessId}-${timestamp}${seqValue}`;

    return apprId;
  }

  // 승인 생성
  static async create(db, approvalData) {
    const {
      BusinessId,
      apprId,
      apprType,
      apprTitle,
      status,
      status_trans,
      apprContents,
      apprSubmitDt,
      compCd,
      createdBy,
      updatedBy,
    } = approvalData;

    const [result] = await db.execute(
      `INSERT INTO visit_approvals 
       (BusinessId, apprId, apprType, apprTitle, status, status_trans, apprContents, apprSubmitDt, compCd, createdBy, updatedBy) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        BusinessId,
        apprId,
        apprType,
        apprTitle,
        status,
        status_trans,
        apprContents,
        apprSubmitDt,
        compCd,
        createdBy,
        updatedBy,
      ]
    );

    return result.insertId;
  }

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

  // 특정 레벨의 승인 확인
  static async findByRequestIdAndLevel(db, requestId, approvalLevel) {
    const [rows] = await db.execute(
      "SELECT * FROM visit_approvals WHERE requestId = ? AND approvalLevel = ?",
      [requestId, approvalLevel]
    );
    return rows[0] || null;
  }
}

module.exports = Approval;

