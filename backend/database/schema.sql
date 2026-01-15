-- visit_users 테이블 생성 (내부 사용자)
CREATE TABLE IF NOT EXISTS visit_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  userType ENUM('user', 'approver_lv1', 'approver_lv2', 'desk', 'admin') DEFAULT 'user',
  department VARCHAR(100) NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- visit_users 샘플 데이터 삽입
-- 비밀번호는 모두 'password123'을 bcrypt로 해시한 값입니다
-- 실제 사용 시: node -e "const bcrypt = require('bcrypt'); bcrypt.hash('password123', 10).then(hash => console.log(hash));"
INSERT INTO visit_users (username, password, name, email, userType, department, isActive) VALUES
('user001', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '홍길동', 'hong@example.com', 'user', '개발팀', TRUE),
('approver1', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '김승인', 'approver1@example.com', 'approver_lv1', '인사팀', TRUE),
('approver2', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '이승인', 'approver2@example.com', 'approver_lv2', '경영지원팀', TRUE),
('desk001', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '박데스크', 'desk@example.com', 'desk', '총무팀', TRUE),
('admin001', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '최관리자', 'admin@example.com', 'admin', 'IT팀', TRUE);

-- 인덱스 생성
CREATE INDEX idx_username ON visit_users(username);
CREATE INDEX idx_userType ON visit_users(userType);

-- visit_visitor_requests 테이블 생성 (방문 요청)
CREATE TABLE IF NOT EXISTS visit_visitor_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visitorName VARCHAR(100) NOT NULL,
  visitorPhone VARCHAR(20) NOT NULL,
  visitorCompany VARCHAR(100) NULL,
  visitorEmail VARCHAR(255) NULL,
  visitDate DATE NOT NULL,
  visitPurpose TEXT NOT NULL,
  internalContact VARCHAR(100) NULL,
  location VARCHAR(255) NULL,
  status ENUM('pending', 'user_approved', 'approver_lv1_approved', 'approver_lv2_approved', 'rejected', 'expired', 'completed') DEFAULT 'pending',
  rejectionReason TEXT NULL,
  privacyConsent BOOLEAN DEFAULT FALSE,
  consentDate DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_visitorPhone ON visit_visitor_requests(visitorPhone);
CREATE INDEX idx_visitDate ON visit_visitor_requests(visitDate);
CREATE INDEX idx_status ON visit_visitor_requests(status);
CREATE INDEX idx_createdAt ON visit_visitor_requests(createdAt);

-- visit_approvals 테이블 생성 (승인 이력)
CREATE TABLE IF NOT EXISTS visit_approvals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  requestId INT NOT NULL,
  approverId INT NOT NULL,
  approvalLevel ENUM('user', 'approver_lv1', 'approver_lv2') NOT NULL,
  status ENUM('approved', 'rejected') NOT NULL,
  comment TEXT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requestId) REFERENCES visit_visitor_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (approverId) REFERENCES visit_users(id) ON DELETE CASCADE,
  INDEX idx_requestId (requestId),
  INDEX idx_approverId (approverId),
  INDEX idx_approvalLevel (approvalLevel)
);

-- visit_badges 테이블 생성 (출입증)
CREATE TABLE IF NOT EXISTS visit_badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  requestId INT NOT NULL,
  badgeNumber VARCHAR(50) NOT NULL UNIQUE,
  issuedAt DATETIME NULL,
  returnedAt DATETIME NULL,
  status ENUM('issued', 'returned', 'lost') DEFAULT 'issued',
  notes TEXT NULL,
  issuedBy INT NULL,
  returnedBy INT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requestId) REFERENCES visit_visitor_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (issuedBy) REFERENCES visit_users(id) ON DELETE SET NULL,
  FOREIGN KEY (returnedBy) REFERENCES visit_users(id) ON DELETE SET NULL,
  INDEX idx_requestId (requestId),
  INDEX idx_badgeNumber (badgeNumber),
  INDEX idx_status (status),
  INDEX idx_issuedAt (issuedAt)
);

-- visit_visitor_history 테이블 생성 (방문 이력 - 과거 기록 자동 불러오기용)
CREATE TABLE IF NOT EXISTS visit_visitor_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visitorPhone VARCHAR(20) NOT NULL,
  visitorName VARCHAR(100) NOT NULL,
  visitorCompany VARCHAR(100) NULL,
  visitPurpose TEXT NULL,
  internalContact VARCHAR(100) NULL,
  location VARCHAR(255) NULL,
  lastVisitDate DATE NULL,
  visitCount INT DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_visitorPhone (visitorPhone),
  INDEX idx_lastVisitDate (lastVisitDate)
);

-- visit_activity_logs 테이블 생성 (모든 승인/처리 이력 로깅)
CREATE TABLE IF NOT EXISTS visit_activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  requestId INT NULL,
  userId INT NULL,
  actionType VARCHAR(50) NOT NULL,
  description TEXT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requestId) REFERENCES visit_visitor_requests(id) ON DELETE SET NULL,
  FOREIGN KEY (userId) REFERENCES visit_users(id) ON DELETE SET NULL,
  INDEX idx_requestId (requestId),
  INDEX idx_userId (userId),
  INDEX idx_actionType (actionType),
  INDEX idx_createdAt (createdAt)
);

-- codegroup 테이블 생성 (코드 그룹 관리)
CREATE TABLE IF NOT EXISTS codegroup (
  id INT AUTO_INCREMENT PRIMARY KEY,
  groupCode VARCHAR(50) NOT NULL UNIQUE COMMENT '코드 그룹 코드 (예: CONTACT_STATUS)',
  groupName VARCHAR(100) NOT NULL COMMENT '코드 그룹 이름',
  description TEXT NULL COMMENT '코드 그룹 설명',
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_groupCode (groupCode),
  INDEX idx_isActive (isActive)
);

-- code 테이블 생성 (코드 관리)
CREATE TABLE IF NOT EXISTS code (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codegroupId VARCHAR(50) NOT NULL COMMENT '코드 그룹 ID',
  codeValue VARCHAR(10) NOT NULL COMMENT '코드 값 (0, 1, 2 등)',
  codeName VARCHAR(100) NOT NULL COMMENT '코드 이름',
  codeNameEn VARCHAR(100) NOT NULL COMMENT '코드 이름(영문)',
  codeDescription VARCHAR(255) NULL COMMENT '코드 설명',
  sortOrder INT DEFAULT 0 COMMENT '정렬 순서',
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (codegroupId) REFERENCES codegroup(groupCode) ON DELETE CASCADE,
  UNIQUE KEY uk_codegroup_codeValue (codegroupId, codeValue),
  INDEX idx_codegroupId (codegroupId),
  INDEX idx_codeValue (codeValue),
  INDEX idx_isActive (isActive)
);

-- contacts 테이블 생성 (문의)
CREATE TABLE IF NOT EXISTS visit_contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  company VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT '0',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt)
);

-- codegroup 샘플 데이터 삽입
INSERT INTO codegroup (groupCode, groupName, description, isActive) VALUES
('VIST_001', '문의 상태', '문의 처리 상태 코드 그룹', TRUE);

-- code 샘플 데이터 삽입 (CONTACT_STATUS 그룹)
INSERT INTO code (codegroupId, codeValue, codeName, codeNameEn, codeDescription, sortOrder, isActive) VALUES
('VIST_001', '0', '대기중', 'pending', '대기 중', 1, TRUE),
('VIST_001', '1', '처리중', 'in_progress', '처리 중', 2, TRUE),
('VIST_001', '2', '완료', 'completed', '완료', 3, TRUE);

-- visit_notices 테이블 생성 (공지사항)
CREATE TABLE IF NOT EXISTS visit_notices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  businessGroup VARCHAR(100) NULL COMMENT '업무 그룹',
  purpose VARCHAR(100) NULL COMMENT '업무/용도',
  title VARCHAR(255) NOT NULL COMMENT '제목',
  content TEXT NOT NULL COMMENT '내용',
  authorId INT NULL COMMENT '작성자 ID',
  isPinned BOOLEAN DEFAULT FALSE COMMENT '상단고정여부',
  endDate DATE NULL COMMENT '종료일',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '작성일',
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES visit_users(id) ON DELETE SET NULL,
  INDEX idx_isPinned (isPinned),
  INDEX idx_endDate (endDate),
  INDEX idx_createdAt (createdAt),
  INDEX idx_authorId (authorId)
);

-- visit_notices 샘플 데이터 삽입
INSERT INTO visit_notices (businessGroup, purpose, title, content, authorId, isPinned, endDate) VALUES
('총무팀', '안내', '2024년 방문자 출입 관리 규정 안내', '안녕하세요. 2024년 방문자 출입 관리 규정이 변경되었습니다. 모든 방문자는 사전에 방문 요청을 등록해야 하며, 방문 시 신분증을 지참해주시기 바랍니다. 자세한 내용은 총무팀으로 문의해주세요.', 4, TRUE, '2024-12-31'),
('IT팀', '점검', '시스템 점검 안내 (2024년 1월 15일)', '시스템 점검으로 인해 2024년 1월 15일 오전 2시부터 오전 4시까지 방문자 관리 시스템이 일시 중단됩니다. 점검 시간 동안 방문 요청 등록이 불가능하오니 참고 부탁드립니다.', 5, TRUE, '2024-01-15'),
('인사팀', '공지', '신규 직원 오리엔테이션 일정 안내', '2024년 신규 입사자 오리엔테이션이 1월 20일부터 시작됩니다. 관련 부서에서는 신규 직원들의 방문 요청을 사전에 확인해주시기 바랍니다.', 2, FALSE, '2024-01-20'),
('경영지원팀', '안내', '방문자 주차장 이용 안내', '방문자 주차장은 본관 지하 1층에 위치하고 있습니다. 방문 시 차량 등록이 필요하오니 방문 요청 시 차량 번호를 함께 기재해주시기 바랍니다.', 3, FALSE, '2024-06-30'),
('개발팀', '공지', '보안 강화를 위한 방문자 관리 절차 변경', '보안 강화를 위해 방문자 관리 절차가 변경되었습니다. 모든 방문자는 방문 전 최소 1일 전에 방문 요청을 등록해야 하며, 승인 절차를 거쳐야 합니다. 긴급 방문의 경우 담당자에게 직접 연락 부탁드립니다.', 1, FALSE, '2024-12-31');