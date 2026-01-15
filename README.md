# 방문자 관리 시스템

React + Vite (Frontend)와 Node.js + Express (Backend)로 구성된 방문자 관리 시스템입니다.
test1_company 프로젝트의 구조와 스타일을 참고하여 제작되었습니다.

## 프로젝트 구조

```
.
├── frontend/          # React + Vite + Tailwind CSS 프론트엔드
│   ├── src/
│   │   ├── page/     # 페이지 컴포넌트
│   │   └── ...
│   └── ...
└── backend/          # Node.js + Express + MariaDB 백엔드
    ├── models/       # 데이터베이스 모델
    ├── routes/       # API 라우트
    ├── database/     # DB 스키마
    └── ...
```

## 시작하기

### 1. 데이터베이스 설정

MariaDB에 접속하여 `backend/database/schema.sql` 파일을 실행하여 테이블을 생성하세요.

### 2. 환경 변수 설정

`backend/.env` 파일을 생성하고 다음 내용을 추가하세요:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
PORT=3001
```

### 3. Backend 실행

```bash
cd backend
npm install
npm start
```

또는 개발 모드 (자동 재시작):

```bash
npm run dev
```

백엔드 서버가 http://localhost:3001 에서 실행됩니다.

### 4. Frontend 실행

새 터미널에서:

```bash
cd frontend
npm install
npm run dev
```

프론트엔드가 http://localhost:5173 에서 실행됩니다.

## 주요 기능

- 방문자 등록
- 방문자 목록 조회
- 방문자 삭제
- CORS 설정 완료

## 기술 스택

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router
- SweetAlert2
- NanumSquareNeo 폰트

### Backend
- Node.js
- Express
- MariaDB (mysql2)
- CORS
- dotenv
