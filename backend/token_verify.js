//สร้างการยืนยันตัวโดยใช้ jsonwebtoken
const jwt = require("jsonwebtoken");

// Middleware ยืนยัน token
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token not provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" }); // 403 สำหรับ token ไม่ผ่าน
    }

    req.user = decoded; // เก็บข้อมูลที่ decode จาก token ลงใน req.user
    next(); // ส่งต่อไปยัง middleware หรือ route handler ถัดไป
  });
}

module.exports = {authenticateToken};
