// MariaDB용 User 모델
class User {
  // 사용자 생성
  static async create(db, userData) {
    const { username, password, name, email, userType, department } = userData;

    const [result] = await db.execute(
      `INSERT INTO visit_users (username, password, name, email, userType, department) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, password, name, email, userType, department]
    );

    return result.insertId;
  }

  // 사용자명으로 찾기
  static async findByUsername(db, username) {
    const [rows] = await db.execute(
      "SELECT * FROM visit_users WHERE username = ?",
      [username]
    );
    return rows[0] || null;
  }

  // ID로 찾기
  static async findById(db, userId) {
    const [rows] = await db.execute("SELECT * FROM visit_users WHERE id = ?", [
      userId,
    ]);
    return rows[0] || null;
  }

  // 사용자 타입별 조회
  static async findByUserType(db, userType) {
    const [rows] = await db.execute(
      "SELECT * FROM visit_users WHERE userType = ? AND isActive = TRUE",
      [userType]
    );
    return rows || [];
  }

  // 전체 사용자 조회
  static async findAll(db) {
    const [rows] = await db.execute(
      "SELECT id, username, name, email, userType, department, isActive, createdAt FROM visit_users ORDER BY createdAt DESC"
    );
    return rows || [];
  }
}

module.exports = User;

