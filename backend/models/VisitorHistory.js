// MariaDB용 VisitorHistory 모델 (과거 방문 기록)
class VisitorHistory {
  // 최근 방문 기록 찾기 (전화번호로)
  static async findByPhone(db, phone) {
    const [rows] = await db.execute(
      "SELECT * FROM visit_visitor_history WHERE visitorPhone = ? ORDER BY lastVisitDate DESC LIMIT 1",
      [phone]
    );
    return rows[0] || null;
  }

  // 방문 기록 생성 또는 업데이트
  static async createOrUpdate(db, historyData) {
    const {
      visitorPhone,
      visitorName,
      visitorCompany,
      visitPurpose,
      internalContact,
      location,
      visitDate,
    } = historyData;

    // 기존 기록 확인
    const existing = await this.findByPhone(db, visitorPhone);

    if (existing) {
      // 업데이트
      const [result] = await db.execute(
        `UPDATE visit_visitor_history 
         SET visitorName = ?, visitorCompany = ?, visitPurpose = ?, 
             internalContact = ?, location = ?, lastVisitDate = ?, 
             visitCount = visitCount + 1, updatedAt = NOW()
         WHERE visitorPhone = ?`,
        [
          visitorName,
          visitorCompany,
          visitPurpose,
          internalContact,
          location,
          visitDate,
          visitorPhone,
        ]
      );
      return result;
    } else {
      // 새로 생성
      const [result] = await db.execute(
        `INSERT INTO visit_visitor_history 
         (visitorPhone, visitorName, visitorCompany, visitPurpose, 
          internalContact, location, lastVisitDate, visitCount) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          visitorPhone,
          visitorName,
          visitorCompany,
          visitPurpose,
          internalContact,
          location,
          visitDate,
        ]
      );
      return result;
    }
  }
}

module.exports = VisitorHistory;

