import React, { useState, useEffect } from "react";
import axiosConfig from "../config/axiosconfig";

const SeeQuestion = ({ questions, currentIndex, onClose }) => {
  const [currentIndexState, setCurrentIndexState] = useState(currentIndex);
  const [allAnswers, setAllAnswers] = useState([]);
  const data = JSON.parse(localStorage.getItem("All_user_room"));
  const [isReprocessing, setIsReprocessing] = useState(false);
  console.log(data.state.room.Room_id);
  console.log(allAnswers);
  console.log(currentIndexState)

  const question = questions || {}; // ตรวจสอบให้แน่ใจว่าเราดึงข้อมูลคำถามจากอาร์เรย์ที่ index ปัจจุบัน
  console.log(question);
  const exam_id = question ? question.exam_id : "";
  const room_id = question ? question.room_id : "";
  const user_id = question ? question.user_id : "";
  const ownscore = question ? question.model_score : "";
  const question_real = question ? question.Exam_Question : "";
  const answer_teacher = allAnswers.length > 0 ? allAnswers[0].Exam_Answer : "";
  const answer_student = allAnswers.length > 0 ? allAnswers[0].answer : "";

  console.log(question)

  const handleReprocess = async () => {
    setIsReprocessing(true);
    await reprocess(); // รอให้ reprocess() ทำงานเสร็จก่อน
    setTimeout(() => {
      setIsReprocessing(false);
      fetchDetailExam();
    }, 50000);
  };

  

  const fetchDetailExam = async () => {
    try {
      if (question.user_id && question.exam_id) {
        const res = await axiosConfig.get(
          `/getquestion_answer/${question.user_id}`,
          {
            params: { exam_id: question.exam_id },
          }
        );
        if (res.data) {
          setAllAnswers(res.data.state);
        }
      }
    } catch (err) {
      console.error("Error fetching exam details:", err);
    }
  };

  const reprocess = async () => {
    try {
      const res = await axiosConfig.patch("/refeedback", {
        exam_id: exam_id,
        user_id: user_id,
        room_id: room_id,
        score: JSON.parse(ownscore),
        question: question_real,
        answer_teacher: answer_teacher,
        answer_student: answer_student,
      });

      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDetailExam();
  }, [question.user_id, question.exam_id]); // โหลดข้อมูลใหม่เมื่อคำถามเปลี่ยน

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">รายละเอียดข้อสอบ</h2>
        <div className="flex gap-5">
          <button onClick={handleReprocess}
                  disabled={isReprocessing}
                  className={`p-2 px-4 rounded-md ${
                    isReprocessing
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}>{isReprocessing ? "กำลังประมวลผล..." : "Reset Process"}
                  </button>
          <button className="text-red-500 font-semibold" onClick={onClose}>
            ✖ ปิด
          </button>
        </div>
      </div>

      {question && question.Exam_Question ? (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <p className="text-gray-700">
            <strong>คะแนนเต็ม:</strong>{" "}
            {question.Exam_Score
              ? question.Exam_Score[currentIndexState]
              : "N/A"}
          </p>
          <p className="text-gray-700 flex items-center">
            <strong>คะแนนที่ได้รับ:</strong>&nbsp;
            {question.user_id
              ? JSON.parse(question.model_score)[currentIndexState]
              : "N/A"}
          </p>
          <div className="mt-3">
            <p className="text-green-600 font-semibold">โจทย์ :</p>
            <div className="p-2 bg-green-100 border border-green-300 rounded-md">
              {question.Exam_Question[currentIndexState] || "ไม่มีข้อมูล"}
            </div>
          </div>
          <div className="mt-3">
            <p className="text-blue-600 font-semibold">คำตอบของนักเรียน :</p>
            <div className="p-2 bg-blue-100 border border-blue-300 rounded-md">
              {allAnswers.length > 0
                ? allAnswers[0]?.answer?.[currentIndexState] || "ไม่มีข้อมูล"
                : "กำลังโหลดข้อมูล..."}
            </div>
          </div>
          <div className="mt-3">
            <p className="text-purple-600 font-semibold">เหตุผลโดยระบบ :</p>
            <div className="p-2 bg-purple-100 border border-blue-300 rounded-md">
              {allAnswers.length > 0
                ? allAnswers[0]?.reason?.[currentIndexState] || "ไม่มีข้อมูล"
                : "กำลังโหลดข้อมูล..."}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">ไม่มีข้อมูล</p>
      )}

      {question.feedback && (
        <div className="mt-3">
          <p className="text-blue-600 font-semibold">ผลตอบกลับจากอาจารย์:</p>
          <div className="p-2 bg-yellow-100 border border-blue-300 rounded-md">
            {question.feedback}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeeQuestion;
