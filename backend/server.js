require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const axios = require("axios");
const multer = require("multer");
const path = require("path");

//bcrypt ตัวปกป้องไม่ให้เห็นรหัสผ่าน ในฐานข้อมูล
const bcrypt = require("bcrypt");
const saltRounds = 8;

//call authen
const { authenticateToken } = require("./token_verify");
const secret = process.env.secret;

//npm jsonwebtoken
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

//ใช้ cors ในกรณีที่ทำหน้าและหลังบ้าน คนล่ะที่
const cors = require("cors");
app.use(
  cors({
    origin: "*",
  })
);

//My Sql connect
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "project",
});

const util = require("util");
const { json } = require("stream/consumers");
const { console } = require("inspector");
const con_async = util.promisify(con.query).bind(con);

//Check err where config database
con.connect((err) => {
  if (err) {
    console.log("Some think is error" + err);
  }

  console.log("Mysql in connect");
});
//Connect port
app.listen(3001, () => console.log("Server is run in port 3001"));

//cosine answer and answer
app.post("/cosine_process", authenticateToken, async (req, res) => {
  const {
    teacher_answer,
    teacher_question,
    student,
    user,
    exam,
    room,
    action,
    maxsocre,
  } = req.body;

  const maxScoreNumbers = maxsocre.map((score) => parseFloat(score));
  console.log("max_score as numbers: ", maxScoreNumbers);

  try {
    const response1 = await axios.post(
      "http://127.0.0.1:5000/process_answer_answer",
      { teacher_answer, student }
    );

    const response2 = await axios.post(
      "http://127.0.0.1:5000/process_question_answer",
      { teacher_question, student }
    );

    console.log("res1 is :", response1.data);
    console.log("res2 is :", response2.data);

    const data1 = response1.data.results1.map((i, index) => {
      const roundedScore = parseFloat(i.similarity_score.toFixed(4)); // ตัดเป็น 4 ตำแหน่ง
      console.log(
        `Similarity Score answer and answer [${index}]:`,
        roundedScore
      );
      return roundedScore;
    });

    const data2 = response2.data.results2.map((i, index) => {
      const roundedScore = parseFloat(i.similarity_score.toFixed(4)); // ตัดเป็น 4 ตำแหน่ง
      console.log(
        `Similarity Score question and answer [${index}]:`,
        roundedScore
      );
      return roundedScore;
    });

    console.log("Result_answer_and_answer : ", response1.data);
    console.log("Result_question_and_answer : ", response2.data);

    // คูณคะแนนที่ได้ใน data1 กับ maxScoreNumbers เพื่อได้คะแนนเต็ม
    const Real_Scores = data1.map((score, index) =>
      (score * maxScoreNumbers[index]).toFixed(4)
    );
    console.log("Adjusted Scores (Final Scores) : ", Real_Scores);

    const query = `INSERT INTO result (cosine_answer_answer, cosine_question_answer, user_id, exam_id, room_id, act_student) VALUES(?, ?, ?, ?, ?, ?)`;
    const query2 = `INSERT INTO final_score (score, model_score, user_id, exam_id, room_id, act_student) VALUES(?,?, ?, ?, ?, ?)`;

    const result = await con_async(query, [
      JSON.stringify(data1),
      JSON.stringify(data2),
      user,
      exam,
      room,
      action,
    ]);

    const result2 = await con_async(query2, [
      JSON.stringify(Real_Scores),
      JSON.stringify(data1),
      user,
      exam,
      room,
      action,
    ]);

    if (result) {
      console.log("Data1 is : ", data1);
      console.log("Data2 is : ", data2);
      return res.json({
        result1: response1.data,
        result2: response2.data,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/autogenprocess", authenticateToken, async (req, res) => {
  const {
    teacher_answer,
    teacher_question,
    student_answer,
    user,
    exam,
    room,
    action,
    maxscore,
    keyword,
  } = req.body;

  room_id = room;

  try {
    const response1 = await axios.post("http://127.0.0.1:5000/autogenprocess", {
      teacher_question,
      teacher_answer,
      student_answer,
      maxscore,
      room_id,
      keyword,
    });

    const jsondata = response1.data.model_results;
    console.log("Response from API:", jsondata);

    const translatorData_reason = jsondata.filter(
      (item) => item.source === "translator"
    );

    const translatorData_score = jsondata.filter(
      (item) => item.source === "assignscore_agent"
    );

    console.log("translatorData_reason:", translatorData_reason);
    console.log("translatorData_score:", translatorData_score);

    if (translatorData_reason.length > 0) {
      const reason_result = translatorData_reason.map((item) => {
        let functionCallString = item.content.trim();

        // ลบ Markdown เช่น ##, **, -, และ : ออกไป
        functionCallString = functionCallString
          .replace(/[#*_\-]+/g, "") // ลบ #, *, -, _
          .replace(/\n\s*\n/g, "\n") // ลดช่องว่างบรรทัดเกิน
          .replace(/\s*:\s*/g, ": ") // จัด format ให้สวย
          .trim();

        console.log("Function call string:", functionCallString);

        return {
          reason: functionCallString, // เก็บข้อมูลที่ประมวลผลแล้ว
        };
      });

      const score_result = translatorData_score
        .map((item) => {
          const functionCallString = item.content;
          console.log("Function call string:", functionCallString);

          const argumentsMatch =
            functionCallString.match(/"earnscore":\s*(\d+)/);
          if (argumentsMatch && argumentsMatch[1]) {
            try {
              const earnscore = parseInt(argumentsMatch[1], 10);
              return { score: earnscore };
            } catch (error) {
              console.log("Error parsing arguments:", error);
            }
          }

          return null;
        })
        .filter((item) => item !== null);

      const reason = reason_result.map((item) => item.reason);
      const score = score_result.map((item) => item.score);
      console.log("All reason is: ", reason);
      console.log("All score is: ", score);
      const query1 = `INSERT INTO result (earnscore, reason, user_id, exam_id, room_id, act_student) VALUES(?, ?, ?, ?, ?, ?)`;
      const query2 = `INSERT INTO final_score (model_score, reason, user_id, exam_id, room_id, act_student) VALUES(?,?, ?, ?, ?, ?)`;

      const result1 = await con_async(query1, [
        JSON.stringify(score) || [],
        JSON.stringify(reason) || [],
        user,
        exam,
        room,
        action,
      ]);

      const result2 = await con_async(query2, [
        JSON.stringify(score) || [],
        JSON.stringify(reason) || [],
        user,
        exam,
        room,
        action,
      ]);

      if (result1 && result2) {
        return res.json({
          output1: result1.data,
          output2: result2.data,
        });
      }
    } else {
      console.log("⚠️ No translator items found.");
      return res
        .status(404)
        .json({ success: false, message: "No valid translator items found" });
    }
  } catch (err) {
    console.error("Error during API call or processing:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

app.patch("/autogenprocessUpdata", authenticateToken, async (req, res) => {
  const {
    teacher_answer,
    teacher_question,
    student_answer,
    user,
    exam,
    room,
    maxscore,
    keyword,
  } = req.body;

  console.log(student_answer);
  console.log(typeof keyword);

  try {
    const response1 = await axios.post("http://127.0.0.1:5000/autogenprocess", {
      teacher_question,
      teacher_answer,
      student_answer,
      maxscore,
      room,
      keyword,
    });

    const jsondata = response1.data.model_results;
    console.log("Response from API:", jsondata);

    const translatorData_reason = jsondata.filter(
      (item) => item.source === "translator"
    );

    const translatorData_score = jsondata.filter(
      (item) => item.source === "assignscore_agent"
    );

    console.log("translatorData_reason:", translatorData_reason);
    console.log("translatorData_score:", translatorData_score);

    if (translatorData_reason.length > 0) {
      const reason_result = translatorData_reason.map((item) => {
        let functionCallString = item.content.trim();

        // ลบ Markdown เช่น ##, **, -, และ : ออกไป
        functionCallString = functionCallString
          .replace(/[#*_\-]+/g, "") // ลบ #, *, -, _
          .replace(/\n\s*\n/g, "\n") // ลดช่องว่างบรรทัดเกิน
          .replace(/\s*:\s*/g, ": ") // จัด format ให้สวย
          .trim();

        console.log("Function call string:", functionCallString);

        return {
          reason: functionCallString, // เก็บข้อมูลที่ประมวลผลแล้ว
        };
      });

      const score_result = translatorData_score
        .map((item) => {
          const functionCallString = item.content;
          console.log("Function call string:", functionCallString);

          const argumentsMatch =
            functionCallString.match(/"earnscore":\s*(\d+)/);
          if (argumentsMatch && argumentsMatch[1]) {
            try {
              const earnscore = parseInt(argumentsMatch[1], 10);
              return { score: earnscore };
            } catch (error) {
              console.log("Error parsing arguments:", error);
            }
          }

          return null;
        })
        .filter((item) => item !== null);

      const reason = reason_result.map((item) => item.reason);
      const score = score_result.map((item) => item.score);
      console.log("All reason is: ", reason);
      console.log("All score is: ", score);

      const query1 = `UPDATE result SET earnscore = ?, reason = ? WHERE user_id = ? AND exam_id = ? AND room_id = ?`;
      const query2 = `UPDATE final_score SET model_score = ?, reason = ? WHERE user_id = ? AND exam_id = ? AND room_id = ?`;

      await con_async(query1, [
        JSON.stringify(score) || "",
        JSON.stringify(reason) || "",
        user,
        exam,
        room,
      ]);

      await con_async(query2, [
        JSON.stringify(score) || "",
        JSON.stringify(reason) || "",
        user,
        exam,
        room,
      ]);
    } else {
      console.log("⚠️ No translator items found.");
      return res
        .status(404)
        .json({ success: false, message: "No valid translator items found" });
    }
  } catch (err) {
    console.error("Error during API call or processing:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

app.post("/autogenprocess2", authenticateToken, async (req, res) => {
  const {
    teacher_answer,
    teacher_question,
    student_answer,
    maxscore,
    room,
    user,
    exam,
    action,
  } = req.body;

  try {
    // 🔹 ยิง request ไปที่ FastAPI
    const response = await axios.post("http://127.0.0.1:5000/predict/task", {
      teacher_question,
      teacher_answer,
      student_answer,
      maxscore,
      room,
    });

    const jsondata = response.data.model_results;
    console.log("Response from FastAPI:", jsondata);

    // 🔹 ดึงค่าคะแนนและเหตุผลจาก response
    const result = jsondata.map((content) => {
      return { earnscore: 0, reason: content }; // ปรับโครงสร้างตาม API ของคุณ
    });

    // 🔹 เก็บค่าคะแนนและเหตุผลลงฐานข้อมูล
    const query1 = `INSERT INTO result (earnscore, reason, user_id, exam_id, room_id, act_student) VALUES(?, ?, ?, ?, ?, ?)`;
    const query2 = `INSERT INTO final_score (model_score, reason, user_id, exam_id, room_id, act_student) VALUES(?, ?, ?, ?, ?, ?)`;

    const result1 = await con_async(query1, [
      JSON.stringify(result.map((item) => item.earnscore)),
      JSON.stringify(result.map((item) => item.reason)),
      user,
      exam,
      room,
      action,
    ]);

    const result2 = await con_async(query2, [
      JSON.stringify(result.map((item) => item.earnscore)),
      JSON.stringify(result.map((item) => item.reason)),
      user,
      exam,
      room,
      action,
    ]);

    if (result1 && result2) {
      return res.json({ success: true, output1: result1, output2: result2 });
    }
  } catch (err) {
    console.error("Error during API call or processing:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//try python
app.post("/send-to-flask", async (req, res) => {
  try {
    // ส่งข้อมูลไปที่ Flask API
    const response = await axios.post("http://127.0.0.1:5000/hi", req.body);

    // แสดงค่าที่ได้รับจาก Flask
    console.log("Flask Response:", response.data);

    // ส่งค่าที่ได้จาก Flask กลับไปให้ Frontend หรือ Client
    res.json(response.data);
  } catch (error) {
    console.error("Error calling Flask API:", error);
    res.status(500).json({ error: "Failed to communicate with Flask" });
  }
});

//Routes

//Api Create account
app.post("/create-account", async (req, res) => {
  const { Name, Email, Password, role } = req.body;
  // สร้าง hash ของรหัสผ่าน
  const hashPassword = await bcrypt.hash(Password, saltRounds);

  try {
    // ตรวจสอบว่า Email ซ้ำหรือไม่
    const checkEmail = await con_async("SELECT * FROM user WHERE Email = ?", [
      Email,
    ]);
    if (checkEmail.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Email already exists",
      });
    }

    // หาก Email ไม่ซ้ำ ให้เพิ่มข้อมูลผู้ใช้ใหม่
    await con_async(
      "INSERT INTO user(Name, Email, Password, U_role) VALUES(?,?,?,?)",
      [Name, Email, hashPassword, role]
    );

    return res.json({
      status: "ok",
      message: "account success",
      Name,
      Email,
      Password,
    });
  } catch (err) {
    console.error("Error creating account:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

//Api Login
app.post("/login", async (req, res) => {
  const { Email, Password } = req.body;
  try {
    const results = await con_async("SELECT * FROM user WHERE Email = ?", [
      Email,
    ]);

    if (results.length === 0) {
      return res.status(401).json({
        status: "error",
        msg: "User not found",
      });
    }

    const role = results[0].U_role;
    const isPasswordMatch = await bcrypt.compare(Password, results[0].Password);

    if (isPasswordMatch) {
      const token = jwt.sign(
        { user_id: results[0].Id, email: results[0].Email },
        secret,
        { expiresIn: "3h" }
      );

      return res.status(200).json({
        status: "ok",
        message: "Login is successful",
        token,
        role,
      });
    } else {
      return res.status(401).json({
        status: "error",
        message: "Incorrect password",
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(401).json({
      status: "error",
      message: "Internal server error",
    });
  }
});
//Get user
app.get("/get-user", authenticateToken, async (req, res) => {
  // ดึง user_id จาก req.user ที่ authenticateToken เก็บไว้
  const user_id = req.user.user_id;

  try {
    const results = await con_async(
      "SELECT Id, Name, Email, profile_image FROM user WHERE Id = ?",
      [user_id]
    );

    return res.status(200).json({
      status: "ok",
      user: results[0], // ส่งข้อมูล user ที่พบ
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(401).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

//API ยืนยันตัวตน
app.post("/authen", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decode = jwt.verify(token, secret);
    res.json({
      status: "ok",
      decode,
    });
  } catch (err) {
    res.status("error");
  }
});

//API create room
app.post("/create-room", authenticateToken, async (req, res) => {
  const { Room_Name, Room_Detail } = req.body;
  const { user_id } = req.user;

  //reduce room code
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // ตัวอักษรและตัวเลข
  let roomCode = "";
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    roomCode += characters[randomIndex];
  }

  try {
    const result = await con_async(
      "INSERT INTO room(Room_Name, Room_Detail, user_id, room_code) VALUES(?, ?, ?, ?)",
      [Room_Name, Room_Detail, user_id, roomCode]
    );

    const room_id = result.insertId;
    const role = "teacher";
    await con_async(
      "INSERT INTO room_relation(user_id, room_id, role) VALUES (?, ?, ?)",
      [user_id, room_id, role]
    );

    return res.status(201).json({
      status: "ok",
      message: "Create Room Successfully",
      Room_Name,
      Room_Detail,
      room_id,
      user_id,
      roomCode,
    });
  } catch (err) {
    console.error("Error creating room:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

//api เมื่ออาจาร์สร้างห้องจะเพิ่มไป ตารางบอกว่าใครอยู่ไหนบ้าง
app.post("/teacher-create", authenticateToken, async (req, res) => {
  const { room_id } = req.body;
  const { user_id } = req.user;
  const role = "teacher";

  try {
    const result = await con_async(
      "INSERT INTO room_relation(user_id, room_id, role) VALUES(?, ?, ?)",
      [user_id, room_id, role]
    );

    return res.status(201).json({
      status: "ok",
      message: "Teacher Create Room Successfully",
    });
  } catch (err) {
    console.error("Error creating room:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

//Getall Room
app.get("/get-room", authenticateToken, async (req, res) => {
  // ดึง user_id จาก req.user ที่ authenticateToken เก็บไว้
  const user_id = req.user.user_id;

  try {
    const results = await con_async("SELECT * FROM room WHERE user_id = ?", [
      user_id,
    ]);

    if (results) {
      return res.status(200).json({
        status: "ok",
        room: results, // ส่งข้อมูล room ที่พบ
      });
    } else {
      return res.json({
        status: "error",
        message: "not found room",
      });
    }
  } catch (err) {
    console.error("Error fetching room:", err);
    return res.status(401).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

//Get Room
app.get("/get-room/:Room_id", authenticateToken, async (req, res) => {
  // ดึง user_id จาก req.user ที่ authenticateToken เก็บไว้
  const user_id = req.user.user_id;
  const room_id = req.params.Room_id;

  try {
    const results = await con_async(
      "SELECT * FROM room WHERE user_id = ? AND Room_id = ?",
      [user_id, room_id]
    );
    console.log(user_id, room_id);

    if (results) {
      return res.status(200).json({
        status: "ok",
        room: results[0], // ส่งข้อมูล room ที่พบ
      });
    } else {
      return res.json({
        status: "error",
        message: "not found room",
      });
    }
  } catch (err) {
    console.error("Error fetching room:", err);
    return res.status(401).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

//Edit room
app.patch("/edit-room/:Room_id", authenticateToken, async (req, res) => {
  const room_id = req.params.Room_id;
  const user_id = req.user.user_id;
  const { Room_Name, Room_Detail } = req.body;

  try {
    // ดึงข้อมูลเดิมของห้องจากฐานข้อมูล
    const [DefaultRoom] = await con_async(
      "SELECT Room_Name, Room_Detail FROM room WHERE Room_id = ? AND user_id = ?",
      [room_id, user_id]
    );
    console.log(DefaultRoom);
    // ตรวจสอบว่าพบห้องที่ต้องการแก้ไขหรือไม่
    if (!DefaultRoom) {
      return res.status(404).json({
        status: "error",
        message: "Room not found or no permission to edit",
      });
    }

    // ใช้ค่าจากข้อมูลเดิม ถ้าค่าจาก `req.body` เป็น undefined
    const DefaultRoomName = Room_Name ?? DefaultRoom.Room_Name;
    const DefaultRoomDetail = Room_Detail ?? DefaultRoom.Room_Detail;

    const result = await con_async(
      "UPDATE room SET Room_Name = ?, Room_Detail = ? WHERE Room_id = ? AND user_id = ?",
      [DefaultRoomName, DefaultRoomDetail, room_id, user_id]
    );

    // ตรวจสอบว่ามีการอัปเดตข้อมูลหรือไม่
    if (result.affectedRows > 0) {
      return res.status(200).json({
        status: "ok",
        message: "Room updated successfully",
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "Room not found or no permission to edit",
      });
    }
  } catch (err) {
    console.error("Error updating room:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

//Delete Room
app.delete("/delete-room/:Room_id", authenticateToken, async (req, res) => {
  const room_id = req.params.Room_id;
  const user_id = req.user.user_id;

  try {
    const result = await con_async("DELETE FROM room WHERE Room_id = ?", [
      room_id,
    ]);

    console.log(room_id, user_id);

    console.log("Deleting Room ID:", room_id);
    if (result.affectedRows > 0) {
      return res.status(200).json({
        status: "ok",
        message: "Room Delete successfully",
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "Room not found to Delete",
      });
    }
  } catch (err) {
    console.error("Error Delete room:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

//Getall exam
app.get("/get-exam/:Room_id", authenticateToken, async (req, res) => {
  room_id = req.params.Room_id;

  try {
    const results = await con_async("SELECT * FROM exam WHERE Room_id = ?", [
      room_id,
    ]);

    if (results) {
      return res.status(200).json({
        status: "ok",
        exam: results, // ส่งข้อมูล exam ที่พบ
      });
    } else {
      return res.json({
        status: "error",
        message: "not found exam--",
      });
    }
  } catch (err) {
    console.error("Error fetching exam:", err);
    return res.status(401).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

//getall exam where online
app.get("/get-exam-online/:room_id", authenticateToken, async (req, res) => {
  const { room_id } = req.params;
  const status = "online";

  try {
    const results = await con_async(
      "SELECT * FROM exam WHERE Room_id = ? AND Status = ?",
      [room_id, status]
    );

    if (results) {
      return res.status(200).json({
        status: "ok",
        exam: results, // ส่งข้อมูล exam ที่พบ
      });
    } else {
      return res.json({
        status: "error",
        message: "not found exam--",
      });
    }
  } catch (err) {
    console.error("Error fetching exam:", err);
    return res.status(401).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

//create exam
app.post("/create-exam", authenticateToken, async (req, res) => {
  const {
    Exam_title,
    Exam_detail,
    Exam_time,
    Exam_question,
    Exam_answer,
    Exam_score,
    Room_id,
    Exam_keyword,
  } = req.body;
  const User_id = req.user.user_id;

  try {
    // ตรวจสอบประเภทของข้อมูลและแปลงให้เป็น array ถ้าจำเป็น
    const questions =
      typeof Exam_question === "string"
        ? JSON.parse(Exam_question)
        : Exam_question;
    const answers =
      typeof Exam_answer === "string" ? JSON.parse(Exam_answer) : Exam_answer;
    const scores =
      typeof Exam_score === "string" ? JSON.parse(Exam_score) : Exam_score;

    // ตรวจสอบว่าข้อมูลเป็น array และไม่ใช่ undefined/null
    if (
      !Array.isArray(questions) ||
      !Array.isArray(answers) ||
      !Array.isArray(scores)
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Exam_question, Exam_answer, and Exam_score must be arrays or valid JSON strings.",
      });
    }

    console.log("มีการสร้างข้อสอบใหม่");
    console.log(Exam_title);
    console.log("Questions:", questions);
    console.log("Answers:", answers);
    console.log("Scores:", scores);
    console.log("Exam_keyword:", Exam_keyword);
    // เก็บข้อมูลในฐานข้อมูล
    const result = await con_async(
      "INSERT INTO exam(Exam_Name, Exam_Detail, Exam_Time, Exam_Question, Exam_Answer, Exam_Score, Exam_keyword, Room_id, User_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        Exam_title,
        Exam_detail,
        Exam_time,
        JSON.stringify(questions), // เก็บ questions เป็น JSON string
        JSON.stringify(answers), // เก็บ answers เป็น JSON string
        JSON.stringify(scores), // เก็บ scores เป็น JSON string
        Exam_keyword, // เก็บ keyword เป็น JSON string
        Room_id,
        User_id,
      ]
    );

    console.log("Room_id:", Room_id);
    return res.status(201).json({
      status: "ok",
      message: "Create Exam Successfully",
    });
  } catch (err) {
    console.error("Error creating exam:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

//edit exam
app.patch("/edit-exam/:Exam_id", authenticateToken, async (req, res) => {
  const exam_id = req.params.Exam_id; // ID ของ Exam ที่ต้องการแก้ไข
  const {
    Exam_title,
    Exam_detail,
    Exam_time,
    Exam_question,
    Exam_answer,
    Exam_score,
    Exam_keyword,
  } = req.body;
  console.log(JSON.stringify(Exam_keyword));

  try {
    // ดึงข้อมูลเดิมของ Exam
    const [DefaultExam] = await con_async(
      "SELECT Exam_Name, Exam_Detail, Exam_Time, Exam_Question, Exam_Answer, Exam_Score, Exam_keyword FROM exam WHERE Exam_id = ?",
      [exam_id]
    );

    // ตรวจสอบว่าพบข้อมูล Exam หรือไม่
    if (!DefaultExam) {
      return res.status(404).json({
        status: "error",
        message: "Exam not found",
      });
    }

    // ดำเนินการอัปเดตข้อมูล
    await con_async(
      `UPDATE exam 
       SET Exam_Name = ?, 
           Exam_Detail = ?, 
           Exam_Time = ?, 
           Exam_Question = ?, 
           Exam_Answer = ?, 
           Exam_Score = ?,
           Exam_keyword = ?
       WHERE Exam_ID = ?`,
      [
        Exam_title || DefaultExam.Exam_Name,
        Exam_detail || DefaultExam.Exam_Detail,
        Exam_time || DefaultExam.Exam_Time,
        JSON.stringify(Exam_question) || DefaultExam.Exam_Question,
        JSON.stringify(Exam_answer) || DefaultExam.Exam_Answer,
        JSON.stringify(Exam_score) || DefaultExam.Exam_Score,
        JSON.stringify(Exam_keyword) || DefaultExam.Exam_keyword,
        exam_id,
      ]
    );

    // ส่ง response สำเร็จ
    res.status(200).json({
      status: "success",
      message: "Exam updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "An error occurred while updating the exam",
    });
  }
});

//delete exam
app.delete("/delete-exam/:Exam_id", authenticateToken, async (req, res) => {
  const exam_id = req.params.Exam_id;

  try {
    const result = await con_async("DELETE FROM exam WHERE Exam_id = ?", [
      exam_id,
    ]);

    console.log("Deleting Exam ID:", exam_id);

    //row have action
    if (result.affectedRows > 0) {
      return res.status(200).json({
        success: "true",
        status: "ok",
        message: "exam Delete successfully",
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "exam not found to Delete",
      });
    }
  } catch (err) {
    console.error("Error Delete room:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

//set date exam
app.patch("/set-exam-date/:Exam_id", authenticateToken, async (req, res) => {
  const exam_id = req.params.Exam_id; // ID ของ Exam ที่ต้องการแก้ไข
  const { start_datetime, end_datetime } = req.body;

  console.log("Start At", start_datetime);
  console.log("End At", end_datetime);

  try {
    // ดึงข้อมูลเดิมของ Exam
    const [DefaultExam] = await con_async(
      "SELECT StartDate, EndDate FROM exam WHERE Exam_id = ?",
      [exam_id]
    );
    console.log(DefaultExam);

    // ตรวจสอบว่าพบข้อมูล Exam หรือไม่
    if (!DefaultExam) {
      return res.status(404).json({
        status: "error",
        message: "Exam not found",
      });
    }

    // ดำเนินการอัปเดตข้อมูล
    const result = await con_async(
      `UPDATE exam 
       SET StartDate = ?, EndDate = ? WHERE Exam_id = ?`,
      [
        start_datetime || DefaultExam.start_datetime,
        end_datetime || DefaultExam.end_datetime,
        exam_id,
      ]
    );

    console.log(result);

    // ส่ง response สำเร็จ
    res.status(200).json({
      status: "success",
      message: "Exam updated successfully",
    });
    console.log("gg");
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "An error occurred while updating the exam",
    });
  }
});

//set status exam online
app.patch(
  "/edit-status-online/:Exam_id",
  authenticateToken,
  async (req, res) => {
    const exam_id = req.params.Exam_id; // ID ของ Exam ที่ต้องการแก้ไข
    const status = "online";
    console.log(exam_id);

    try {
      // ดึงข้อมูลเดิมของ Exam
      const [DefaultExam] = await con_async(
        "SELECT * FROM exam WHERE Exam_id = ?",
        [exam_id]
      );

      // ตรวจสอบว่าพบข้อมูล Exam หรือไม่
      if (!DefaultExam) {
        return res.status(404).json({
          status: "error",
          message: "Exam not found",
        });
      }

      // ดำเนินการอัปเดตข้อมูล
      await con_async(
        `UPDATE exam 
       SET StartDate = ?, EndDate = ? , Status = ? WHERE Exam_ID = ?`,
        [DefaultExam.StartDate, DefaultExam.EndDate, status, exam_id]
      );

      // ส่ง response สำเร็จ
      res.status(200).json({
        status: "success",
        message: "Exam updated successfully",
      });
      console.log("Update online success");
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: "error",
        message: "An error occurred while updating the exam",
      });
      console.log("asdjfas;djfl");
    }
  }
);

//offline
app.patch(
  "/edit-status-offline/:Exam_id",
  authenticateToken,
  async (req, res) => {
    const exam_id = req.params.Exam_id; // ID ของ Exam ที่ต้องการแก้ไข
    const status = "offline";

    try {
      // ดึงข้อมูลเดิมของ Exam
      const [DefaultExam] = await con_async(
        "SELECT * FROM exam WHERE Exam_id = ?",
        [exam_id]
      );

      if (!DefaultExam) {
        return res.status(404).json({
          status: "error",
          message: "Exam not found",
        });
      }

      await con_async(
        `UPDATE exam 
       SET StartDate = ?, EndDate = ? , Status = ? WHERE Exam_ID = ?`,
        [DefaultExam.StartDate, DefaultExam.EndDate, status, exam_id]
      );

      // ส่ง response สำเร็จ
      res.status(200).json({
        status: "success",
        message: "Exam updated successfully",
      });
      console.log("gg");
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: "error",
        message: "An error occurred while updating the exam",
      });
    }
  }
);

//get all
app.get("/get-exam/:Room_id", authenticateToken, async (req, res) => {
  room_id = req.params.Room_id;

  try {
    const results = await con_async("SELECT * FROM exam WHERE Room_id = ?", [
      room_id,
    ]);

    if (results) {
      return res.status(200).json({
        status: "ok",
        exam: results, // ส่งข้อมูล exam ที่พบ
      });
    } else {
      return res.json({
        status: "error",
        message: "not found exam--",
      });
    }
  } catch (err) {
    console.error("Error fetching exam:", err);
    return res.status(401).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

//get all student
app.get("/get-allstudent", authenticateToken, async (req, res) => {
  const { room_id } = req.params;
  const role = "student";

  try {
    query = `SELECT * FROM user WHERE U_role = ?`;
    const result = await con_async(query, [role]);
    console.log(result);

    if (result) {
      return res.status(200).json({
        student: result,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

//check password room
app.get("/get-password-room", authenticateToken, async (req, res) => {
  const room_code = req.query.room_code;
  console.log("code room is :", room_code);

  try {
    const result = await con_async("SELECT * FROM room WHERE room_code = ?", [
      room_code,
    ]);

    if (result.length > 0) {
      return res.status(200).json({
        status: "ok",
        room: result[0],
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "Room is not found.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
});

app.post("/EnClass/:Room_id", authenticateToken, async (req, res) => {
  const room_id = req.params.Room_id;
  const user_id = req.user.user_id;
  const { role } = req.body;

  try {
    const result = await con_async(
      "INSERT INTO room_relation (user_id, room_id, role) VALUES (?, ?, ?)",
      [user_id, room_id, role]
    );

    // Update the room_relation table with the room_code from the room table
    const updateResult = await con_async(
      "UPDATE room_relation rr JOIN room r ON rr.room_id = r.Room_id SET rr.room_code = r.room_code WHERE rr.room_id = ? AND rr.user_id = ?",
      [room_id, user_id]
    );

    return res.status(200).json({
      status: "ok",
      message: "Successfully enrolled in the class.",
      result,
      updateResult,
    });
  } catch (err) {
    console.log(err);
  }
});

//Get Room for student
app.get("/get-room-student", authenticateToken, async (req, res) => {
  // ดึง user_id จาก req.user ที่ authenticateToken เก็บไว้
  const user_id = req.user.user_id;

  try {
    // ดึงข้อมูล room_id จาก room_relation ที่เชื่อมโยงกับ user_id
    const results = await con_async(
      `
      SELECT room.*
      FROM room_relation
      INNER JOIN room ON room_relation.Room_id = room.Room_id
      WHERE room_relation.User_id = ?
    `,
      [user_id]
    );

    if (results && results.length > 0) {
      return res.status(200).json({
        status: "ok",
        room: results, // ส่งข้อมูล room ที่พบ
      });
    } else {
      return res.json({
        status: "error",
        message: "No rooms found for this user",
      });
    }
  } catch (err) {
    console.error("Error fetching room:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

//check password used ทำเพื่อหาว่าใน table มีคนนั้นเคยอยู่แล้วยัง
app.get("/check-room-used", authenticateToken, async (req, res) => {
  const { room_code } = req.query; // ส่งเป็นข้อมูลของ room_id
  const user_id = req.user.user_id;

  try {
    // ตรวจสอบว่า room_id นี้มีการใช้งานใน room_relation แล้วหรือยัง
    const results = await con_async(
      "SELECT COUNT(*) AS count FROM room_relation WHERE room_code = ? AND user_id = ?",
      [room_code, user_id] // ค้นหาห้องตาม room_id ที่รับมา
    );

    console.log("Query Results:", results); // แสดงผลลัพธ์การ query
    console.log("count:", results[0].count); // ดูค่าผลลัพธ์ที่ส่งกลับมา

    // ถ้ามีการใช้งานห้องนี้ใน room_relation แล้ว (count มากกว่า 0)
    if (results[0].count > 0) {
      return res.json({ isUsed: true });
    } else {
      return res.json({ isUsed: false });
    }
  } catch (err) {
    console.error("Error checking if room code is used:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

//ดึงข้อมูลอาจาร์ที่อยู่ในห้อง
app.get("/TeacherinClass/:Room_id", authenticateToken, async (req, res) => {
  const { Room_id } = req.params;
  const user_id = req.user.user_id;
  const status = "teacher";
  console.log(Room_id);

  try {
    const query = `
      SELECT user.id, user.Name, user.Email
      FROM user 
      LEFT JOIN room_relation 
      ON user.Id = room_relation.user_id 
      WHERE room_relation.room_id = ? AND role = ?
    `;

    // ใช้ con_async พร้อมการป้องกัน SQL Injection
    const result = await con_async(query, [Room_id, status]);

    if (result) {
      console.log(result);
      return res.json({
        success: true,
        user: result,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No matching teacher found in the class.",
      });
    }
  } catch (error) {
    console.error("Error fetching teacher in class:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

//ดึงข้อมูลนักเรียนที่อยู่ในห้อง
app.get("/StudentinClass/:Room_id", authenticateToken, async (req, res) => {
  const { Room_id } = req.params;
  const status = "student";

  try {
    const query = `
      SELECT user.id,user.Name, user.Email
      FROM user 
      LEFT JOIN room_relation 
      ON user.Id = room_relation.user_id 
      WHERE room_relation.room_id = ? AND role = ?
    `;

    // ใช้ con_async พร้อมการป้องกัน SQL Injection
    const result = await con_async(query, [Room_id, status]);

    if (result) {
      console.log("student in class", result);
      return res.json({
        success: true,
        student: result,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No matching Student found in the class.",
      });
    }
  } catch (error) {
    console.error("Error fetching Student in class:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

//ดึงข้อมูลข้อสอบของอาจาร์
app.get("/get_exam_teacher/:Room_id", authenticateToken, async (req, res) => {
  const { Room_id } = req.params;
  const { exam_id } = req.query;
  try {
    const query = `SELECT * FROM exam WHERE Room_id = ? AND Exam_id = ?`;
    const result = await con_async(query, [Room_id, exam_id]);
    if (result) {
      const formattedResult = result.map((row) => {
        return {
          ...row,
          Exam_Question: JSON.parse(row.Exam_Question.replace(/\]\s*\]$/, "]")), // แก้ `] ]` ที่เกินมา
          Exam_Score: JSON.parse(row.Exam_Score), // แก้ `] ]` ที่เกินมา
        };
      });

      console.log("result", formattedResult);
      return res.json({
        success: true,
        state: formattedResult,
      });
    }
  } catch (error) {
    console.error("Error fetching Student in class:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

//เตะสมากชิก
app.delete("/Kick-Student/:user_id", authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  const { room_id } = req.query;
  console.log(user_id, room_id);

  try {
    query = `DELETE FROM room_relation WHERE user_id = ? AND room_id = ?`;

    const result = await con_async(query, [user_id, room_id]);

    if (result) {
      console.log("Delete user :", user_id);
      return res.json({
        student: result,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

//add student in class
app.post(
  "/add-studentinclass/:room_id",
  authenticateToken,
  async (req, res) => {
    const { room_id } = req.params;
    const { user_id } = req.body;
    const status = "student";

    try {
      query = `INSERT INTO room_relation(user_id, room_id, role) VALUES(?, ?, ?)`;

      const result = await con_async(query, [user_id, room_id, status]);

      if (result) {
        return res.json({
          student: result,
        });
      }
      console.log("add boommmmm", result);
    } catch (err) {
      console.log(err);
    }
  }
);

//send answers
app.post("/sendAnswer/:exam_id", authenticateToken, async (req, res) => {
  const { answers, user, room } = req.body;
  const { exam_id } = req.params;
  console.log(JSON.stringify(answers));

  try {
    query = `INSERT INTO answer_student(answer, user_id, exam_id, room_id) VALUES(?, ?, ?, ?)`;

    const result = await con_async(query, [
      JSON.stringify(answers),
      user,
      exam_id,
      room,
    ]);

    return res.json({
      state: result,
    });
  } catch (err) {
    console.log(err);
  }
});

//get คำตอบของนักเรียน
app.get("/getaction/:exam_id", authenticateToken, async (req, res) => {
  const { user, room } = req.query;
  const { exam_id } = req.params;

  try {
    query = `SELECT answer_student.act_id FROM answer_student WHERE user_id = ? AND exam_id = ? AND room_id = ?`;

    const result = await con_async(query, [user, exam_id, room]);

    if (result) {
      return res.json({
        action: result[0].act_id,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

//Student do and undo exam
app.get(
  "/studentdoexam_undoexam/:exam_id",
  authenticateToken,
  async (req, res) => {
    const role = "student";
    const { exam_id } = req.params;
    const { room_id } = req.query;

    try {
      const studentdo_query = `
        SELECT user.*
        FROM room_relation
        INNER JOIN answer_student ON room_relation.user_id = answer_student.user_id 
        INNER JOIN user ON room_relation.user_id = user.Id
        WHERE answer_student.exam_id = ? AND room_relation.room_id = ?`;

      const studentundo_query = `
        SELECT user.* 
        FROM room_relation
        LEFT JOIN answer_student ON room_relation.user_id = answer_student.user_id AND answer_student.exam_id = ?
        INNER JOIN user ON room_relation.user_id = user.Id
        WHERE room_relation.room_id = ? AND answer_student.user_id IS NULL AND room_relation.role = ?`;

      const do_result = await con_async(studentdo_query, [exam_id, room_id]);
      const undo_result = await con_async(studentundo_query, [
        exam_id,
        room_id,
        role,
      ]);

      if (Array.isArray(do_result) && Array.isArray(undo_result)) {
        console.log(undo_result);
        return res.json({
          do: do_result,
          undo: undo_result,
        });
      } else {
        return res
          .status(500)
          .json({ error: "Unexpected database response format" });
      }
    } catch (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

//Redo take Exam
app.delete("/redoexam/:exam_id", authenticateToken, async (req, res) => {
  const { exam_id } = req.params;
  const { user_id } = req.query;

  try {
    console.log(user_id);

    const query = `DELETE FROM answer_student WHERE exam_id = ? AND user_id =? `;
    const query2 = `DELETE FROM result WHERE exam_id = ? AND user_id = ?`;

    const result = await con_async(query, [exam_id, user_id]);
    const result2 = await con_async(query2, [exam_id, user_id]);

    if (result) {
      console.log("Redo succ");
      return res.json(result);
    }
  } catch (err) {
    console.log(err);
  }
});

//Get student condition to take exam
app.get("/studentcondition/:exam_id", authenticateToken, async (req, res) => {
  const { exam_id } = req.params;
  const { user_id } = req.query;

  try {
    const query = `SELECT user_id FROM answer_student WHERE exam_id = ? AND user_id = ?`;

    const result = await con_async(query, [exam_id, user_id]);
    console.log(result);

    if (result) {
      return res.json({
        status: result,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// get all score from student
app.get("/getscore_student/:exam_id", authenticateToken, async (req, res) => {
  const { exam_id } = req.params;
  const { room_id } = req.query;

  try {
    const query = `
      SELECT user.Id, user.Name, final_score.model_score
      FROM final_score 
      RIGHT JOIN user ON final_score.user_id = user.Id 
      WHERE final_score.exam_id = ? AND final_score.room_id = ?
    `;

    const result = await con_async(query, [exam_id, room_id]);
    console.log("this is result", result);

    if (result) {
      // แปลงค่า cosine_answer_answer และ cosine_question_answer เป็นตัวเลข
      const formattedResult = result.map((row) => {
        const model_score = JSON.parse(row.model_score);
        console.log(model_score);

        const total_score = model_score.reduce((sum, value) => sum + value, 0); // คำนวณผลรวมคะแนน

        return {
          ...row,
          model_score: model_score, // ส่งกลับเป็นอาร์เรย์ (ถ้าจำเป็น)
          total_score: total_score, // เพิ่มค่าคะแนนรวม
        };
      });

      console.log(formattedResult);

      return res.json({
        state: formattedResult,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

//Sumscore condition
app.get(
  "/getsumscore_student/:exam_id",
  authenticateToken,
  async (req, res) => {
    const { exam_id } = req.params;
    const { room_id } = req.query;

    try {
      const query = `
      SELECT user.Id, user.Name, final_score.model_score, result.earnscore, final_score.status
      FROM final_score
      RIGHT JOIN result ON final_score.user_id = result.user_id AND final_score.exam_id = result.exam_id
      RIGHT JOIN user ON final_score.user_id = user.Id
      WHERE final_score.exam_id = ? AND final_score.room_id = ?
    `;

      const result = await con_async(query, [exam_id, room_id]);
      console.log("this is result", result);

      if (result) {
        // แปลงค่า cosine_answer_answer และ cosine_question_answer เป็นตัวเลข
        const formattedResult = result.map((row) => {
          const modelAnswerArray = JSON.parse(row.model_score);
          console.log(modelAnswerArray);

          const total_score = modelAnswerArray.reduce(
            (sum, value) => sum + value,
            0
          ); // คำนวณผลรวมคะแนน

          return {
            ...row,
            model_answer_answer: modelAnswerArray, // ส่งกลับเป็นอาร์เรย์ (ถ้าจำเป็น)
            total_score: total_score, // เพิ่มค่าคะแนนรวม
          };
        });

        console.log(formattedResult);

        return res.json({
          state: formattedResult,
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

//get question, answer from teacher and student
app.get("/getquestion_answer/:user_id", authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  const { exam_id } = req.query;
  console.log(user_id, exam_id);

  try {
    const query = `SELECT answer_student.answer, answer_student.CreateAt, 
                          exam.Exam_Question, exam.Exam_Answer, exam.Exam_Score, exam.Exam_keyword,
                          final_score.model_score, final_score.reason, exam.Exam_id, final_score.score
                   FROM answer_student 
                   LEFT JOIN exam ON answer_student.exam_id = exam.Exam_id 
                   LEFT JOIN final_score ON final_score.user_id = answer_student.user_id 
                   WHERE answer_student.user_id = ? AND answer_student.exam_id = ? AND final_score.exam_id = ?`;

    const result = await con_async(query, [user_id, exam_id, exam_id]);

    if (result.length > 0) {
      const formattedResult = result.map((row) => {
        let modelScores = [];
        let examKeywords = [];
        const reason = row.reason ? JSON.parse(row.reason) : [];
        const ans = row.answer ? JSON.parse(row.answer) : [];
        const s = row.score ? JSON.parse(row.score) : [];

        try {
          modelScores = JSON.parse(row.model_score).map((score) => score);

          // เช็กว่า Exam_keyword เป็น string JSON ที่ถูกต้อง
          if (row.Exam_keyword) {
            examKeywords = JSON.parse(row.Exam_keyword);
            examKeywords = examKeywords.every((k) => Array.isArray(k))
              ? examKeywords
              : [examKeywords];

            console.log(examKeywords);
          }
        } catch (error) {
          console.error("Error parsing cosine_answer_answer:", error);
        }

        return {
          ...row,
          answer: ans,
          Exam_Question: JSON.parse(row.Exam_Question.replace(/\]\s*\]$/, "]")), // แก้ `] ]` ที่เกินมา
          Exam_Answer: JSON.parse(row.Exam_Answer),
          Exam_Score: JSON.parse(row.Exam_Score),
          Exam_keyword: examKeywords,
          model_answer_answer: modelScores, // เก็บเป็นอาร์เรย์
          reason: reason, // เก็บเป็นอาร์เรย์
          sc: s, // เก็บเป็นอาร์เรย์
        };
      });

      console.log(formattedResult);
      return res.json({
        state: formattedResult,
      });
    } else {
      return res.json({ state: [] });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//feedback
app.patch("/feedback", authenticateToken, async (req, res) => {
  const {
    feedback,
    score,
    total_score,
    exam_id,
    user_id,
    room_id,
    question,
    answer_teacher,
    answer_student,
  } = req.body;
  const score_str = JSON.stringify(score); // Declare score_str
  const score_ai = score;
  const status = "done";
  console.log(score_str);

  const re = null;
  const sco = null;

  try {
    const query = `SELECT total_score, score, feedback FROM final_score WHERE user_id = ? AND exam_id = ? AND room_id = ?`;
    const [oldresult] = await con_async(query, [user_id, exam_id, room_id]);

    if (!oldresult) {
      console.log("oldresult not found");
    }

    const defaultscore = score_str ?? oldresult.score;
    const defaulttotal_score = total_score ?? oldresult.total_score;
    const defaultfeedback = feedback ?? oldresult.feedback;
    console.log(defaultscore, defaulttotal_score, defaultfeedback);

    const response1 = await axios.post(
      "http://127.0.0.1:5000/autogenprocessfeedback",
      {
        question,
        answer_teacher,
        answer_student,
        score_ai,
        room_id,
      }
    );

    console.log("Response from API:", response1.data);
    const jsondata = response1.data.model_results;
    console.log("Response from API:", jsondata);

    const translatorData_reason = jsondata.filter(
      (item) => item.source === "translator"
    );

    const translatorData_score = jsondata.filter(
      (item) => item.source === "assignscore_agent"
    );

    console.log("translatorData_reason:", translatorData_reason);
    console.log("translatorData_score:", translatorData_score);

    if (translatorData_reason.length > 0) {
      const reason_result = translatorData_reason.map((item) => {
        let functionCallString = item.content.trim();

        // ลบ Markdown เช่น ##, **, -, และ : ออกไป
        functionCallString = functionCallString
          .replace(/[#*_\-]+/g, "") // ลบ #, *, -, _
          .replace(/\n\s*\n/g, "\n") // ลดช่องว่างบรรทัดเกิน
          .replace(/\s*:\s*/g, ": ") // จัด format ให้สวย
          .trim();

        console.log("Function call string:", functionCallString);

        return {
          reason: functionCallString, // เก็บข้อมูลที่ประมวลผลแล้ว
        };
      });

      const score_result = translatorData_score
        .map((item) => {
          const functionCallString = item.content;
          console.log("Function call string:", functionCallString);

          const argumentsMatch =
            functionCallString.match(/"earnscore":\s*(\d+)/);
          if (argumentsMatch && argumentsMatch[1]) {
            try {
              const earnscore = parseInt(argumentsMatch[1], 10);
              return { score: earnscore };
            } catch (error) {
              console.log("Error parsing arguments:", error);
            }
          }

          return null;
        })
        .filter((item) => item !== null);

      const reason = reason_result.map((item) => item.reason);
      const score = score_result.map((item) => item.score);
      console.log("Score array:", score);
      console.log("Reason array:", reason);
    

    // After processing translatorItems, update the database
    const result = await con_async(
      "UPDATE final_score SET score = ?, model_score = ?, total_score = ?, feedback = ?, status = ?, reason = ? WHERE user_id = ? AND exam_id = ? AND room_id = ?",
      [
        defaultscore,
        defaultscore,
        defaulttotal_score,
        defaultfeedback,
        status,
        JSON.stringify(reason),
        user_id,
        exam_id,
        room_id,
      ]
    );

    console.log(result);

    if (result.affectedRows > 0) {
      console.log("success update feedback");
      return res.json({
        state: "success",
      });
    } else {
      return res.json({
        state: "fail",
      });
    }}
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      state: "fail",
      message: "An error occurred while processing the request.",
    });
  }
});

app.patch("/refeedback", authenticateToken, async (req, res) => {
  const {
    score,
    exam_id,
    user_id,
    room_id,
    question,
    answer_teacher,
    answer_student,
  } = req.body;
  const score_str = JSON.stringify(score); // Declare score_str
  const score_ai = score;
  console.log(
    exam_id,
    user_id,
    room_id,
    score_ai,
    question,
    answer_teacher,
    answer_student
  );

  try {
    const response1 = await axios.post(
      "http://127.0.0.1:5000/autogenprocessfeedback",
      {
        question,
        answer_teacher,
        answer_student,
        score_ai,
      }
    );

    const jsondata = response1.data.model_results;
    console.log("Response from API:", jsondata);

    const translatorData_reason = jsondata.filter(
      (item) => item.source === "translator"
    );

    const translatorData_score = jsondata.filter(
      (item) => item.source === "assignscore_agent"
    );

    console.log("translatorData_reason:", translatorData_reason);
    console.log("translatorData_score:", translatorData_score);

    if (translatorData_reason.length > 0) {
      const reason_result = translatorData_reason.map((item) => {
        let functionCallString = item.content.trim();

        // ลบ Markdown เช่น ##, **, -, และ : ออกไป
        functionCallString = functionCallString
          .replace(/[#*_\-]+/g, "") // ลบ #, *, -, _
          .replace(/\n\s*\n/g, "\n") // ลดช่องว่างบรรทัดเกิน
          .replace(/\s*:\s*/g, ": ") // จัด format ให้สวย
          .trim();

        console.log("Function call string:", functionCallString);

        return {
          reason: functionCallString, // เก็บข้อมูลที่ประมวลผลแล้ว
        };
      });

      const score_result = translatorData_score
        .map((item) => {
          const functionCallString = item.content;
          console.log("Function call string:", functionCallString);

          const argumentsMatch =
            functionCallString.match(/"earnscore":\s*(\d+)/);
          if (argumentsMatch && argumentsMatch[1]) {
            try {
              const earnscore = parseInt(argumentsMatch[1], 10);
              return { score: earnscore };
            } catch (error) {
              console.log("Error parsing arguments:", error);
            }
          }

          return null;
        })
        .filter((item) => item !== null);

      const reason = reason_result.map((item) => item.reason);
      const score = score_result.map((item) => item.score);
      console.log("All reason is: ", reason);
      console.log("All score is: ", score);
    

    // After processing translatorItems, update the database
    const result = await con_async(
      "UPDATE final_score SET reason = ? WHERE user_id = ? AND exam_id = ? AND room_id = ?",
      [JSON.stringify(reason), user_id, exam_id, room_id]
    );
  }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      state: "fail",
      message: "An error occurred while processing the request.",
    });
  }
});

app.get("/getfeedback/:exam_id", authenticateToken, async (req, res) => {
  const { exam_id } = req.params;
  const { room_id } = req.query;
  const user_id = req.user.user_id;

  console.log(exam_id, room_id, user_id);

  try {
    const query = `SELECT 
    final_score.*, 
    exam.Exam_Name, 
    exam.Exam_Question, 
    exam.Exam_Score,
    MAX(final_score.total_score) AS max_score, 
    AVG(final_score.total_score) AS avg_score, 
    MIN(final_score.total_score) AS min_score 
    FROM final_score 
    LEFT JOIN exam ON final_score.exam_id = exam.Exam_id 
    WHERE final_score.exam_id = ? 
    AND final_score.room_id = ? AND final_score.user_id = ?
    GROUP BY final_score.exam_id`;

    const result = await con_async(query, [exam_id, room_id, user_id]);
    console.log("this is result", result);

    if (result.length > 0) {
      const formattedResult = result.map((row) => {
        return {
          ...row,
          Exam_Question: JSON.parse(row.Exam_Question.replace(/\]\s*\]$/, "]")), // แก้ `] ]` ที่เกินมา
          Exam_Score: JSON.parse(row.Exam_Score),
        };
      });
      console.log(formattedResult);
      return res.json({
        state: formattedResult,
      });
    } else {
      return res.json({ state: [] });
    }
  } catch (err) {
    console.log(err);
  }
});

app.get(
  "/get_maxminavg_score_feedback/:exam_id",
  authenticateToken,
  async (req, res) => {
    const { exam_id } = req.params;
    const { room_id } = req.query;

    console.log(exam_id, room_id);

    try {
      const query = `SELECT 
    MAX(final_score.total_score) AS max_score, 
    AVG(final_score.total_score) AS avg_score, 
    MIN(final_score.total_score) AS min_score 
    FROM final_score 
    LEFT JOIN exam ON final_score.exam_id = exam.Exam_id 
    WHERE final_score.exam_id = ? 
    AND final_score.room_id = ?
    GROUP BY final_score.exam_id`;

      const result = await con_async(query, [exam_id, room_id]);
      console.log("this is result", result);

      return res.json({
        state: result,
      });
    } catch (err) {
      console.log(err);
    }
  }
);

//per exam
app.get("/getallexam_final/:exam_id", authenticateToken, async (req, res) => {
  const { exam_id } = req.params;
  const { room_id } = req.query;

  try {
    const query = `SELECT final_score.*, exam.Exam_Name, exam.Exam_Question, exam.Exam_Score FROM final_score LEFT JOIN exam ON final_score.exam_id = exam.Exam_id WHERE final_score.exam_id = ? AND final_score.room_id = ?`;

    const result = await con_async(query, [exam_id, room_id]);
    console.log("this is result", result);

    return res.json({
      state: result,
    });
  } catch (err) {
    console.log(err);
  }
});

//it real allexam in room
app.get(
  "/getallexam_final_real/:room_id",
  authenticateToken,
  async (req, res) => {
    const { room_id } = req.params;

    try {
      const query = `SELECT final_score.*, exam.Exam_Name, exam.Exam_Question, exam.Exam_Score, MAX(final_score.total_score) AS max_score, AVG(final_score.total_score) AS avg_score, MIN(final_score.total_score) AS min_score FROM final_score LEFT JOIN exam ON final_score.exam_id = exam.Exam_id WHERE final_score.room_id = ?`;

      const result = await con_async(query, [room_id]);
      console.log("this is result", result);

      return res.json({
        state: result,
      });
    } catch (err) {
      console.log(err);
    }
  }
);

app.get(
  "/getalluser_final_real/:room_id",
  authenticateToken,
  async (req, res) => {
    const { room_id } = req.params;

    try {
      const query = `SELECT final_score.*, user.*, exam.* FROM final_score LEFT JOIN user ON final_score.user_id = user.Id LEFT JOIN exam ON final_score.exam_id = exam.Exam_id WHERE final_score.room_id = ?`;

      const result = await con_async(query, [room_id]);
      console.log("this is result", result);

      return res.json({
        state: result,
      });
    } catch (err) {
      console.log(err);
    }
  }
);

//per user
app.get(
  "/getallexam_final_real_perUser/:user_id",
  authenticateToken,
  async (req, res) => {
    const { user_id } = req.params;
    const { room_id } = req.query;
    console.log(user_id, room_id);

    try {
      const query = `SELECT final_score.*, user.*, exam.* FROM final_score LEFT JOIN user ON final_score.user_id = user.Id LEFT JOIN exam ON final_score.exam_id = exam.Exam_id WHERE final_score.user_id = ? AND final_score.room_id = ?`;

      const result = await con_async(query, [user_id, room_id]);
      console.log("this is result", result);

      return res.json({
        state: result,
      });
    } catch (err) {
      console.log(err);
    }
  }
);

//save old score
app.post("/save_old_score", authenticateToken, async (req, res) => {
  const { exam_id, user_id, room_id, score } = req.body;
  const score_str = JSON.stringify(score);
  console.log(exam_id, user_id, room_id, score);
  try {
    const query = `INSERT INTO old_score (exam_id, user_id, room_id, score) VALUES (?, ?, ?, ?)`;
    const result = await con_async(query, [
      exam_id,
      user_id,
      room_id,
      score_str,
    ]);
    console.log(result);
    if (result) {
      console.log("success save old score");
      return res.json({
        state: "success",
      });
    } else {
      return res.json({
        state: "fail",
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post(
  "/update_profile",
  upload.single("image"),
  authenticateToken,
  async (req, res) => {
    const { name, email } = req.body;
    const { user_id } = req.user;
    const image = req.file.filename; // Ensure image exists

    console.log(image, user_id);

    try {
      const q_before = `SELECT * FROM user WHERE Id = ?`;
      const [before] = await con_async(q_before, [user_id]);
      console.log(before);

      if (!before) {
        // If user not found, return a proper response
        return res.status(404).json({
          state: "fail",
          message: "User not found",
        });
      }

      // Using the values directly
      const updatedName = name || before.Name;
      const updatedEmail = email || before.Email;
      const updatedPic = image || before.profile_image;

      const query = `UPDATE user SET Name = ?, Email = ?, profile_image = ? WHERE Id = ?`;
      const result = await con_async(query, [
        updatedName,
        updatedEmail,
        updatedPic,
        user_id,
      ]);

      console.log(result);

      if (result.affectedRows > 0) {
        return res.json({
          state: "success",
        });
      } else {
        return res.json({
          state: "fail",
          message: "No changes made to the profile",
        });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      return res.status(500).json({
        state: "fail",
        message: "An error occurred while updating the profile",
      });
    }
  }
);
