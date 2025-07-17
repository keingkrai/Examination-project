
# 📝 Examination Project – AI Agent-based Exam Grading System  

โปรเจกต์นี้เป็น **ระบบตรวจข้อสอบอัตโนมัติ** โดยใช้หลักการ **AI Agent** ช่วยประเมินคะแนนและให้ Feedback โดยอ้างอิงจากคำตอบอาจารย์และ Keyword ที่กำหนด พร้อมมี Dashboard สำหรับอาจารย์และนักเรียน ผ่าน **React (Frontend)** และ **Node.js (Backend)**  

---

## ✅ คุณสมบัติเด่น (Features)
- ✅ **อัปโหลดข้อสอบ และข้อสอบอัตนัย**  
- ✅ **AI Agent ให้คะแนนโดยอ้างอิงคำตอบอาจารย์และ Keyword**  
- ✅ **ตรวจสอบความใกล้เคียงด้วย Embedding Similarity**  
- ✅ **แสดงผลคะแนนแบบ Real-time**  
- ✅ **ให้ Feedback พร้อมเหตุผลประกอบคะแนน**  
- ✅ **สรุปผลเป็นกราฟสถิติและรายงานผลการสอบ**  
- ✅ **รองรับ Manual Override โดยอาจารย์**  

---

## 🏗 สถาปัตยกรรมระบบ (Architecture)
```
React (Frontend)  <—API—>  Node.js (Backend)  <—>  AI Engine (LLM / Embedding Similarity)
```

- **Frontend (React)**  
    - หน้าเข้าสอบสำหรับนักเรียน  
    - Dashboard สำหรับอาจารย์  
- **Backend (Node.js + Express)**  
    - API สำหรับข้อสอบ, คะแนน, ผู้ใช้  
    - สื่อสารกับ AI Agent  
- **AI Agent Workflow**  
    - รับโจทย์ + คำตอบนักเรียน + คำตอบอาจารย์ + Keyword  
    - วิเคราะห์ความใกล้เคียงด้วย **Embedding Similarity**  
    - ใช้ **LLM** เพื่อประเมินและสร้าง Feedback พร้อมเหตุผล  
    - ส่งผลลัพธ์คะแนนกลับไปที่ระบบ  

---

## 🔍 AI Agent Workflow
1. **รับ Input:**  
   - คำถาม (Question)  
   - คำตอบอาจารย์ (Reference Answer)  
   - คำตอบนักเรียน (Student Answer)  
   - Keyword สำคัญ  
2. **การประเมิน:**  
   - คำนวณ Similarity → ประเมินความสอดคล้อง  
   - ใช้ LLM ให้ Feedback และแนะนำการปรับปรุง  
3. **ส่งออก Output:**  
   - คะแนน (EarnScore)  
   - เหตุผล (Reason)  
   - คำแนะนำ (Feedback)  

---

## 📊 ตัวอย่าง Output
```json
{
  "question": "อธิบายหลักการทำงานของ AI Agent",
  "teacher_answer": "AI Agent ทำงานโดยการรับข้อมูล ประมวลผล และตัดสินใจ",
  "student_answer": "AI Agent คือโปรแกรมที่ช่วยแก้ปัญหา",
  "max_score": 10,
  "earn_score": 7,
  "reason": "นักเรียนตอบได้ถูกต้องบางส่วน ขาดรายละเอียดเกี่ยวกับขั้นตอนการทำงาน",
  "feedback": "ควรเพิ่มรายละเอียดขั้นตอน เช่น การรับข้อมูลและการตัดสินใจ"
}
```

---

## 🖥 เทคโนโลยีที่ใช้ (Tech Stack)
- **Frontend:** React, Chart.js, Tailwind CSS  
- **Backend:** Node.js, Express, MongoDB  
- **AI:**  
    - OpenAI API (หรือ LLM อื่น)  
    - Embedding Similarity สำหรับความใกล้เคียงคำตอบ  
- **อื่น ๆ:** Axios, JWT Auth  

---

## 🚀 วิธีใช้งาน (Installation)
```bash
# Clone Project
git clone https://github.com/keingkrai/Examination-project.git

# เข้าโฟลเดอร์
cd Examination-project

# ติดตั้ง dependencies (Backend)
cd server
npm install

# ติดตั้ง dependencies (Frontend)
cd ../client
npm install

# รัน Backend
cd ../server
npm start

# รัน Frontend
cd ../client
npm start
```

---

## 🗂 โครงสร้างโปรเจกต์ (Project Structure)
```
Examination-project/
├── client/        # React Frontend
│   ├── src/
│   └── ...
├── server/        # Node.js Backend
│   ├── routes/
│   ├── models/
│   └── ...
└── README.md
```

---

## ✅ ฟีเจอร์ในอนาคต (Future Features)
- ✅ รองรับ **Multi-language Feedback**  
- ✅ เพิ่ม **Auto Categorization ของนักเรียนตามระดับคะแนน**  
- ✅ รองรับ **Exam Analytics แบบ Real-time**  

---

## 📌 License
MIT License

---

## 👤 ผู้พัฒนา
**Keingkrai Buakeaw**  
GitHub: [@keingkrai](https://github.com/keingkrai)  
