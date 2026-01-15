// MariaDB용 Badge 모델
class Badge {
  // 출입증 발급
  static async issue(db, badgeData) {
    const { requestId, badgeNumber, issuedBy, notes } = badgeData;

    const [result] = await db.execute(
      `INSERT INTO visit_badges (requestId, badgeNumber, issuedAt, status, issuedBy, notes) 
       VALUES (?, ?, NOW(), 'issued', ?, ?)`,
      [requestId, badgeNumber, issuedBy, notes]
    );

    return result.insertId;
  }

  // 출입증 반납
  static async return(db, badgeId, returnedBy) {
    const [result] = await db.execute(
      `UPDATE visit_badges 
       SET returnedAt = NOW(), status = 'returned', returnedBy = ?, updatedAt = NOW() 
       WHERE id = ?`,
      [returnedBy, badgeId]
    );
    return result;
  }

  // 출입증 번호로 찾기
  static async findByBadgeNumber(db, badgeNumber) {
    const [rows] = await db.execute(
      "SELECT * FROM visit_badges WHERE badgeNumber = ?",
      [badgeNumber]
    );
    return rows[0] || null;
  }

  // 요청 ID로 출입증 찾기
  static async findByRequestId(db, requestId) {
    const [rows] = await db.execute(
      "SELECT * FROM visit_badges WHERE requestId = ? ORDER BY createdAt DESC",
      [requestId]
    );
    return rows[0] || null;
  }

  // 출입증 목록 조회 (필터링)
  static async findAll(db, filters = {}) {
    let query = "SELECT * FROM visit_badges WHERE 1=1";
    const params = [];

    if (filters.status) {
      query += " AND status = ?";
      params.push(filters.status);
    }

    if (filters.visitDate) {
      query +=
        " AND DATE(issuedAt) = ?";
      params.push(filters.visitDate);
    }

    query += " ORDER BY issuedAt DESC";

    const [rows] = await db.execute(query, params);
    return rows || [];
  }
}

module.exports = Badge;

