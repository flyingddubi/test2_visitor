// MariaDB용 VisitorRequest 모델
class VisitorRequest {
  // 새 방문 요청 생성
  static async create(db, requestData) {
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
    } = requestData;

    const [result] = await db.execute(
      `INSERT INTO visit_visitor_requests 
       (visitorName, visitorPhone, visitorCompany, visitorEmail, visitDate, 
        visitPurpose, internalContact, location, privacyConsent, consentDate, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), '0')`,
      [
        visitorName,
        visitorPhone,
        visitorCompany,
        visitorEmail,
        visitDate,
        visitPurpose,
        internalContact,
        location,
        privacyConsent,
      ]
    );

    return result.insertId;
  }

  // 특정 방문 요청 찾기
  static async findById(db, requestId) {
    const [rows] = await db.execute(
      "SELECT * FROM visit_visitor_requests WHERE id = ?",
      [requestId]
    );
    return rows[0] || null;
  }

  // 전체 방문 요청 찾기 (필터링 옵션)
  static async findAll(db, filters = {}) {
    let query = "SELECT * FROM visit_visitor_requests WHERE 1=1";
    const params = [];

    if (filters.status) {
      query += " AND status = ?";
      params.push(filters.status);
    }

    if (filters.visitDate) {
      query += " AND visitDate = ?";
      params.push(filters.visitDate);
    }

    if (filters.visitorPhone) {
      query += " AND visitorPhone = ?";
      params.push(filters.visitorPhone);
    }

    query += " ORDER BY createdAt DESC";

    const [rows] = await db.execute(query, params);
    return rows || [];
  }

  // 방문 요청 상태 업데이트
  static async updateStatus(db, requestId, status, rejectionReason = null) {
    const [result] = await db.execute(
      "UPDATE visit_visitor_requests SET status = ?, rejectionReason = ?, updatedAt = NOW() WHERE id = ?",
      [status, rejectionReason, requestId]
    );
    return result;
  }

  // 방문 요청 삭제
  static async delete(db, requestId) {
    const [result] = await db.execute(
      "DELETE FROM visit_visitor_requests WHERE id = ?",
      [requestId]
    );
    return result;
  }
}

module.exports = VisitorRequest;

