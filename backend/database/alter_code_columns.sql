-- code 테이블의 codegroupId와 codeValue 컬럼을 VARCHAR로 변경
-- 주의: 외래키 제약조건이 있으므로 순서대로 실행해야 합니다.

-- 외래키 제약조건 이름 확인 (실행 전에 확인)
-- SHOW CREATE TABLE code;

-- 방법 1: 외래키 제약조건을 제거하고 컬럼 타입 변경
-- 1-1. 외래키 제약조건 제거 (제약조건 이름은 실제 테이블 생성 시 자동 생성된 이름을 사용)
-- 일반적으로 MariaDB/MySQL에서는 '테이블명_ibfk_번호' 형식입니다.
-- 실제 제약조건 이름을 확인하려면: SHOW CREATE TABLE code;
ALTER TABLE code 
DROP FOREIGN KEY code_ibfk_1;

-- 1-2. codegroupId 컬럼을 VARCHAR(50)로 변경
ALTER TABLE code 
MODIFY COLUMN codegroupId VARCHAR(50) NOT NULL COMMENT '코드 그룹 ID';

-- 1-3. codeValue 컬럼을 VARCHAR(10)로 변경
ALTER TABLE code 
MODIFY COLUMN codeValue VARCHAR(10) NOT NULL COMMENT '코드 값 (0, 1, 2 등)';

-- 1-4. (선택사항) codegroupId를 codegroup의 groupCode를 참조하도록 외래키 재생성
-- ALTER TABLE code
-- ADD CONSTRAINT fk_code_codegroup 
-- FOREIGN KEY (codegroupId) REFERENCES codegroup(groupCode) ON DELETE CASCADE;

-- 방법 2: 외래키를 유지하면서 codegroup의 groupCode를 참조하도록 변경하려면
-- 2-1. 외래키 제거
-- ALTER TABLE code DROP FOREIGN KEY code_ibfk_1;
-- 2-2. codegroupId를 VARCHAR(50)로 변경
-- ALTER TABLE code MODIFY COLUMN codegroupId VARCHAR(50) NOT NULL COMMENT '코드 그룹 ID';
-- 2-3. codeValue를 VARCHAR(10)로 변경
-- ALTER TABLE code MODIFY COLUMN codeValue VARCHAR(10) NOT NULL COMMENT '코드 값 (0, 1, 2 등)';
-- 2-4. codegroup(groupCode)를 참조하는 외래키 추가
-- ALTER TABLE code ADD CONSTRAINT fk_code_codegroup FOREIGN KEY (codegroupId) REFERENCES codegroup(groupCode) ON DELETE CASCADE;

