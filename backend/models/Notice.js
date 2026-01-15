// MariaDB용 Contact 모델 - SQL 쿼리 헬퍼 함수들
class Notice {
  // 특정 문의글 찾은 후 삭제
  static async findReqByIdAndDelete(db, contactId) {

    const [result] = await db.execute(
      "DELETE FROM visit_contacts where id = ?",
      [contactId]
    );
    return result;
  }
  // 특정 문의글 찾은 후 수정
  static async findReqByIdAndUpdate(db, contactData) {
    const { id, status } = contactData;

    const [result] = await db.execute(
      "UPDATE visit_contacts SET status = ? where id = ?",
      [status, id]
    );
    return result;
  }

  // 특정 문의글 찾기
  static async findReqById(db, noticeId) {
    const [rows] = await db.execute("SELECT * FROM notices where id = ?", [
      noticeId,
    ]);
    return rows.length > 0 ? rows[0] : null;
  }

  // 전체 문의글 찾기
  static async findNoticeAll(db) {
    const [rows] = await db.execute(
      `SELECT A.*, B.codeName FROM notices A, code B 
      where A.businessGroup='VIST' 
      and A.purpose = B.codeValue 
      and B.codegroupId = 'COMM_001' 
      ORDER BY isPinned desc, id desc`    );
    return rows || null;
  }

  // 새 문의 생성
  static async create(db, contactData) {
    const { businessGroup, purpose, title, content, isPinned, authorId } = contactData;

    const [result] = await db.execute(
      `INSERT INTO notices (businessGroup, purpose, title, content, isPinned, authorId, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [businessGroup, purpose, title, content, isPinned ?? 0, authorId]
    );
    

    return result.insertId;
  }

  // 공지사항 수정
  static async update(db, noticeData) {
    const { id, businessGroup, purpose, title, content, isPinned, authorId } = noticeData;

    const [result] = await db.execute(
      `UPDATE notices 
       SET businessGroup = ?, purpose = ?, title = ?, content = ?, isPinned = ?, authorId = ?, updatedAt = NOW()
       WHERE id = ?`,
      [businessGroup, purpose, title, content, isPinned ?? 0, authorId, id]
    );

    return result;
  }
}

module.exports = Notice;
