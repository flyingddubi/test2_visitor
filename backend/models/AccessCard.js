// MariaDB용 AccessCard 모델
class AccessCard {
  // 사용 가능한 카드 목록 조회
  static async findAvailableCards(db) {
    try {
      const [rows] = await db.execute(
        `SELECT accessCardNo FROM visit_cards 
         WHERE accessCardUse = 'Y' AND status = '0' 
         ORDER BY accessCardNo ASC`
      );
      return rows || [];
    } catch (error) {
      console.error("사용 가능한 카드 조회 오류:", error);
      throw error;
    }
  }

  // 방문자에게 카드 발급 (accessCardNo 업데이트)
  static async issueCard(db, reqId, visitorSeq, cardNo) {
    try {
      const [result] = await db.execute(
        `UPDATE visit_visitor_requests_visitors 
         SET accessCardNo = ?, accessCardIssueStat = ?, updatedAt = NOW() 
         WHERE reqId = ? AND visitorSeq = ?`,
        [cardNo, 'Y', reqId, visitorSeq]
      );
      
      if (result.affectedRows === 0) {
        throw new Error("방문자를 찾을 수 없습니다.");
      }
      
      return result;
    } catch (error) {
      console.error("카드 발급 오류:", error);
      throw error;
    }
  }

  // 카드 정보 업데이트 (status를 '1'로 변경)
  static async updateCardInfo(db, cardNo) {
    try {
      const [result] = await db.execute(
        `UPDATE visit_cards 
         SET status = '1', updatedAt = NOW() 
         WHERE accessCardUse = 'Y' AND accessCardNo = ?`,
        [cardNo]
      );
      
      if (result.affectedRows === 0) {
        console.warn(`카드 정보 업데이트 실패: accessCardNo=${cardNo}인 카드를 찾을 수 없습니다.`);
      }
      
      return result;
    } catch (error) {
      console.error("카드 정보 업데이트 오류:", error);
      throw error;
    }
  }

  // 카드 반납
  static async returnCard(db, reqId, visitorSeq, cardNo) {
    try {
      // 1. visit_visitor_requests_visitors 테이블 업데이트 (accessCardIssueStat = 'R')
      const [result1] = await db.execute(
        `UPDATE visit_visitor_requests_visitors 
         SET accessCardIssueStat = 'R', updatedAt = NOW() 
         WHERE reqId = ? AND visitorSeq = ?`,
        [reqId, visitorSeq]
      );
      
      if (result1.affectedRows === 0) {
        throw new Error("방문자를 찾을 수 없습니다.");
      }

      // 2. visit_cards 테이블 업데이트 (status = '0')
      const [result2] = await db.execute(
        `UPDATE visit_cards 
         SET status = '0', updatedAt = NOW() 
         WHERE accessCardNo = ?`,
        [cardNo]
      );
      
      if (result2.affectedRows === 0) {
        console.warn(`카드 정보 업데이트 실패: accessCardNo=${cardNo}인 카드를 찾을 수 없습니다.`);
      }
      
      return { result1, result2 };
    } catch (error) {
      console.error("카드 반납 오류:", error);
      throw error;
    }
  }

  // 미출입 처리
  static async updateNoIssue(db, reqId, visitorSeq) {
    try {
      const [result] = await db.execute(
        `UPDATE visit_visitor_requests_visitors 
         SET accessCardIssueStat = 'P', updatedAt = NOW() 
         WHERE reqId = ? AND visitorSeq = ?`,
        [reqId, visitorSeq]
      );
      
      if (result.affectedRows === 0) {
        throw new Error("방문자를 찾을 수 없습니다.");
      }
      
      return result;
    } catch (error) {
      console.error("미출입 처리 오류:", error);
      throw error;
    }
  }

  // 재발급 처리
  static async reIssueCard(db, reqId, visitorSeq, cardNo) {
    try {
      // 1. visit_visitor_requests_visitors 테이블 업데이트 (accessCardNo = null, accessCardIssueStat = null)
      const [result1] = await db.execute(
        `UPDATE visit_visitor_requests_visitors 
         SET accessCardNo = NULL, accessCardIssueStat = NULL, updatedAt = NOW() 
         WHERE reqId = ? AND visitorSeq = ?`,
        [reqId, visitorSeq]
      );
      
      if (result1.affectedRows === 0) {
        throw new Error("방문자를 찾을 수 없습니다.");
      }

      // 2. visit_cards 테이블 업데이트 (status = '0') - cardNo가 있을 때만
      let result2 = null;
      if (cardNo) {
        [result2] = await db.execute(
          `UPDATE visit_cards 
           SET status = '0', updatedAt = NOW() 
           WHERE accessCardUse = 'Y' AND accessCardNo = ?`,
          [cardNo]
        );
        
        if (result2.affectedRows === 0) {
          console.warn(`카드 정보 업데이트 실패: accessCardNo=${cardNo}인 카드를 찾을 수 없습니다.`);
        }
      }
      
      return { result1, result2 };
    } catch (error) {
      console.error("재발급 처리 오류:", error);
      throw error;
    }
  }
}

module.exports = AccessCard;

