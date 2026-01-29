// MariaDB용 Contact 모델 - SQL 쿼리 헬퍼 함수들
class CardManagement {
  // 특정 문의글 찾은 후 삭제
  // static async findReqByIdAndDelete(db, contactId) {

  //   const [result] = await db.execute(
  //     "DELETE FROM visit_contacts where id = ?",
  //     [contactId]
  //   );
  //   return result;
  // }
  // 특정 문의글 찾은 후 수정
  // static async findReqByIdAndUpdate(db, contactData) {
  //   const { id, status } = contactData;

  //   const [result] = await db.execute(
  //     "UPDATE visit_contacts SET status = ? where id = ?",
  //     [status, id]
  //   );
  //   return result;
  // }

  // 특정 문의글 찾기
  // static async findReqById(db, noticeId) {
  //   const [rows] = await db.execute("SELECT * FROM notices where id = ?", [
  //     noticeId,
  //   ]);
  //   return rows.length > 0 ? rows[0] : null;
  // }

  // 전체 문의글 찾기
  static async findCardAll(db) {
    const [rows] = await db.execute(
      `SELECT * FROM visit_cards 
      ORDER BY accessCardNo asc`    );
    return rows || null;
  }

  // 새 카드 생성
  static async create(db, cardData) {
    const { accessCardNo, accessCardType, accessCardUse, status, createdBy, updatedBy } = cardData;

    const [result] = await db.execute(
      `INSERT INTO visit_cards (accessCardNo, accessCardType, accessCardUse, status, createdAt, createdBy, updatedAt, updatedBy) 
       VALUES (?, ?, ?, ?, NOW(), ?, NOW(), ?)`,
      [accessCardNo, accessCardType, accessCardUse, status, createdBy, updatedBy]
    );
    

    return result.accessCardNo;
  }

  // 카드 수정
  static async update(db, accessCardNo, cardData) {
    const { accessCardType, accessCardUse } = cardData;

    const [result] = await db.execute(
      `UPDATE visit_cards 
       SET accessCardType = ?, accessCardUse = ?, updatedAt = NOW() 
       WHERE accessCardNo = ?`,
      [accessCardType, accessCardUse, accessCardNo]
    );

    return result;
  }
}

module.exports = CardManagement;
