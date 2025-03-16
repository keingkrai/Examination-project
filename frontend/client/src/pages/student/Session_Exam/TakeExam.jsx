import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosConfig from "../../../config/axiosconfig";
import Modal from "react-modal";
import VerifyExam from "../../../components_s/VerifyExam";

const TakeExam = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { exam_detail } = location.state || {};
  const [actId, setActId] = useState([]);
  const student = JSON.parse(localStorage.getItem("alluser"));
  const [veritymodal, setVerifymodal] = useState({
    show: false,
    data: null,
  });

  if (!exam_detail) {
    return <div className="text-center text-red-500">ไม่พบข้อมูลข้อสอบ</div>;
  }

  const user_id = student.Id || "";
  const exam_id = exam_detail.Exam_id || "";
  const room_id = exam_detail.Room_id || "";
  const answer_teacher = exam_detail.Exam_Answer || "";
  const question_teacher = exam_detail.Exam_Question || "";

  const keyword = JSON.parse(exam_detail.Exam_keyword) || [];
  console.log(keyword);
  
  const questions = JSON.parse(exam_detail.Exam_Question || "[]");

  // เวลาที่กำหนดสำหรับทำข้อสอบ (นาที -> วินาที)
  const totalTime = exam_detail.Exam_Time * 60;

  // ดึงค่าที่เคยบันทึกไว้จาก localStorage
  const savedTime = localStorage.getItem(`exam_time_${exam_id}`);
  const initialTime = savedTime ? parseInt(savedTime, 10) : totalTime;
  const teacherq = answer_teacher

  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [userAnswers, setUserAnswers] = useState(
    Array(questions.length).fill("")
  );

  // อัปเดตค่าเวลาใน localStorage ทุกครั้งที่ timeLeft เปลี่ยน
  useEffect(() => {
    Modal.setAppElement("#root");
    localStorage.setItem(`exam_time_${exam_id}`, timeLeft);
  }, [timeLeft, exam_id]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit(); // หมดเวลาให้ส่งคำตอบอัตโนมัติ
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // แปลงเวลาที่เหลือเป็น mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${minutes}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // ฟังก์ชันอัปเดตคำตอบของผู้ใช้
  const handleAnswerChange = (index, value) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const embedding_cosine_answer_answer = async ({ actId }) => {
    try {
      const res = await axiosConfig.post(`/autogenprocess`, {
        teacher_answer: JSON.parse(answer_teacher),
        teacher_question: JSON.parse(question_teacher),
        student_answer: userAnswers,
        keyword: keyword,
        user: user_id,
        exam: exam_id,
        room: room_id,
        action: actId,
        maxscore: JSON.parse(exam_detail.Exam_Score),
      });


      if (res.data) {
        console.log(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };


  const getaction = async () => {
    try {
      const response = await axiosConfig.get(`/getaction/${exam_id}`, {
        params: { user: user_id, room: room_id },
      });
  
      if (response.data) {
        return response.data.action
        
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ฟังก์ชันส่งคำตอบไปที่ API
  const sendAnswer = async () => {
    try {
      const res = await axiosConfig.post(`/sendAnswer/${exam_id}`, {
        answers: userAnswers,
        user: user_id,
        room: room_id,
      });
      if(res.data){
        console.log(res.data) 
        const actId = await getaction()
        console.log(actId)
        embedding_cosine_answer_answer({ actId })
      }


    } catch (err) {
      console.log(err);
    }
  };

  // ฟังก์ชันส่งคำตอบ
  const handleSubmit = () => {
    localStorage.removeItem(`exam_time_${exam_id}`);

    sendAnswer();
    console.log("ส่งคำตอบ:", userAnswers);
    navigate("../rooms_stu/Exam_stu");

    // ลบค่าเวลาออกจาก localStorage หลังส่งคำตอบ
  };
  

  return (
    <>
      <div className="min-h-screen p-4 bg-red-300">
        <h1 className="text-2xl font-bold text-center">
          {exam_detail.Exam_Name}
        </h1>
        <p className="text-center text-gray-600">{exam_detail.Exam_Detail}</p>

        <div className="text-center text-red-500 text-lg font-semibold mt-4">
          Timer: {formatTime(timeLeft)}
        </div>

        <div className="mt-6 space-y-4">
          {questions.map((question, index) => (
            <div key={index} className={`p-4 border-2 rounded-md shadow`}>
              <p className="font-semibold">{`No ${index + 1}: ${question}`}</p>
              <textarea
                className={`w-full border p-2 mt-2 rounded`}
                rows="3"
                placeholder="typing your answer..."
                value={userAnswers[index]}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4 w-full hover:bg-blue-600"
          onClick={() => {
            setVerifymodal({
              show: true,
              data: null,
            });
          }}
        >
          Send Answer
        </button>
      </div>

      <Modal
        isOpen={veritymodal.show}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        className="fixed inset-0 flex justify-center items-center"
      >
        <div className="w-[40%] bg-white rounded-md p-3">
          <VerifyExam
            verify={handleSubmit}
            onClose={() => {
              setVerifymodal({ show: false, data: null });
            }}
          />
        </div>
      </Modal>
    </>
  );
};

export default TakeExam;
