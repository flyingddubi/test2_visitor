const express = require("express");
const router = express.Router();
const CardManagement = require("../models/CardManagement");
const jwt = require("jsonwebtoken");

// const authenticateToken = (req, res, next) => {
//   const token = req.cookies.token;

//   if (!token) {
//     return res.status(401).json({ message: "토큰이 없습니다." });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(403).json({ messgae: "유효하지 않은 토큰입니다." });
//   }
// };

router.post("/", async (req, res) => {
  // 데이터베이스 연결 가져오기
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { accessCardNo, accessCardType, accessCardUse, status } = req.body;

    // 새 카드 생성
    await CardManagement.create(db, {
      accessCardNo,
      accessCardType,
      accessCardUse,
      status,
      createdBy: 'test',
      updatedBy: 'test',
    });

    res.status(201).json({ message: "카드가 성공적으로 등록되었습니다." });
  } catch (error) {
    console.error("카드 등록 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

//router.get("/", authenticateToken, async (req, res) => {
router.get("/", async (req, res) => {
  // 데이터베이스 연결 가져오기
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const cardManagement = await CardManagement.findCardAll(db);

    res.json(cardManagement);
  } catch (error) {
    console.error("전체 카드 목록 불러오기 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

//router.get("/:id", authenticateToken, async (req, res) => {
// router.get("/:id", async (req, res) => {
//   // 데이터베이스 연결 가져오기
//   const db = req.app.locals.db;
//   if (!db) {
//     return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
//   }

//   try {
//     const cardManagement = await CardManagement.findReqById(db, req.params.id);

//     //res.json(contact);
//     //const contact = await Contact.findById(req.params.id);
//     if (!cardManagement) {
//       return res.status(404).json({ message: "문의를 찾을 수 없습니다." });
//     }
//     res.json(cardManagement);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "서버 오류가 발생했습니다." });
//   }
// });

// 카드 수정
router.put("/:accessCardNo", async (req, res) => {
  // 데이터베이스 연결 가져오기
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { accessCardType, accessCardUse } = req.body;
    const { accessCardNo } = req.params;

    if (!accessCardType || !accessCardUse) {
      return res.status(400).json({ message: "필수 항목을 입력해주세요." });
    }

    const result = await CardManagement.update(db, accessCardNo, {
      accessCardType,
      accessCardUse,
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "카드를 찾을 수 없습니다." });
    }

    res.json({ message: "카드가 성공적으로 수정되었습니다.", success: true });
  } catch (error) {
    console.error("카드 수정 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// router.delete("/:id", async (req, res) => {
//   // 데이터베이스 연결 가져오기
//   const db = req.app.locals.db;
//   if (!db) {
//     return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
//   }

//   try {
//     const id = req.params.id;
//     console.log("DELETE 요청 받음 - id:", id);
    
//     const result = await Contact.findReqByIdAndDelete(db, id);
    
//     console.log("삭제 결과:", result, "affectedRows:", result.affectedRows);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "문의를 찾을 수 없습니다." });
//     }

//     res.json({ message: "문의가 정상적으로 삭제되었습니다." });
//   } catch (error) {
//     console.error("DELETE 요청 오류:", error);
//     res.status(500).json({ message: "서버 에러가 발생했습니다.", error: error.message });
//   }
// });

module.exports = router;
