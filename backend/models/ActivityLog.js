// MariaDB용 ActivityLog 모델
class ActivityLog {
  // 활동 로그 생성
  static async create(db, logData) {
    const { requestId, userId, actionType, description } = logData;

    const [result] = await db.execute(
      `INSERT INTO visit_activity_logs (requestId, userId, actionType, description) 
       VALUES (?, ?, ?, ?)`,
      [requestId, userId, actionType, description]
    );

    return result.insertId;
  }

  // 요청 ID로 로그 조회
  static async findByRequestId(db, requestId) {
    const [rows] = await db.execute(
      `SELECT al.*, u.name as userName 
       FROM visit_activity_logs al 
       LEFT JOIN visit_users u ON al.userId = u.id 
       WHERE al.requestId = ? 
       ORDER BY al.createdAt DESC`,
      [requestId]
    );
    return rows || [];
  }

  // 사용자 ID로 로그 조회
  static async findByUserId(db, userId) {
    const [rows] = await db.execute(
      "SELECT * FROM visit_activity_logs WHERE userId = ? ORDER BY createdAt DESC",
      [userId]
    );
    return rows || [];
  }
}

module.exports = ActivityLog;

