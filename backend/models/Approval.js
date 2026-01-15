// MariaDB용 Approval 모델
class Approval {
  // 승인 생성
  static async create(db, approvalData) {
    const { requestId, approverId, approvalLevel, status, comment } =
      approvalData;

    const [result] = await db.execute(
      `INSERT INTO visit_approvals (requestId, approverId, approvalLevel, status, comment) 
       VALUES (?, ?, ?, ?, ?)`,
      [requestId, approverId, approvalLevel, status, comment]
    );

    return result.insertId;
  }

  // 특정 요청의 승인 이력 조회
  static async findByRequestId(db, requestId) {
    const [rows] = await db.execute(
      `SELECT a.*, u.name as approverName, u.userType 
       FROM visit_approvals a 
       LEFT JOIN visit_users u ON a.approverId = u.id 
       WHERE a.requestId = ? 
       ORDER BY a.createdAt ASC`,
      [requestId]
    );
    return rows || [];
  }

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

