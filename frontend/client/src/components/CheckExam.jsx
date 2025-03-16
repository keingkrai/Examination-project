import React, { useEffect, useState } from "react";
import axiosConfig from "../config/axiosconfig";
import { MdBorderColor, MdCheck } from "react-icons/md";
import moment from "moment";

const CheckExam = ({ students, currentIndex, onClose, exam_id }) => {
  const [currentindex, setCurrentindex] = useState(currentIndex);
  const student = students[currentindex] || {};
  const [allAnswers, setAllAnswers] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [updatedScores, setUpdatedScores] = useState({});
  const [editingScore, setEditingScore] = useState(null);
  const [oldScores, setOldScores] = useState({});
  const [error, setError] = useState("");

  console.log(allAnswers);

  const data = JSON.parse(localStorage.getItem("All_user_room"));
  const room_id = data?.state?.room?.Room_id;
  const exam = exam_id || "";
  const time = allAnswers.length > 0 ? allAnswers[0].CreateAt : "";
  const question = allAnswers.length > 0 ? allAnswers[0].Exam_Question : "";
  const answer_teacher = allAnswers.length > 0 ? allAnswers[0].Exam_Answer : "";
  const answer_student = allAnswers.length > 0 ? allAnswers[0].answer : "";
  const maxscore = allAnswers.length > 0 ? allAnswers[0].Exam_Score : "";
  const keyword =
    allAnswers.length > 0 ? JSON.stringify(allAnswers[0].Exam_keyword) : [];
  console.log(keyword);
  const [isReprocessing, setIsReprocessing] = useState(false);

  const handleReprocess = async () => {
    setIsReprocessing(true);
    await reprocess(); // รอให้ reprocess() ทำงานเสร็จก่อน
    setTimeout(() => {
      setIsReprocessing(false);
      fetchDetailExam();
    }, 50000);
  };

  console.log("allAnswers:", allAnswers);
  console.log("students:", students);
  console.log("currentindex:", currentindex);
  console.log("current student:", students[currentindex]);

  useEffect(() => {
    if (student.Id) {
      fetchDetailExam();
      setFeedbackSent(false); // แสดง textarea ใหม่เมื่อนักเรียนเปลี่ยน
    }
  }, [student.Id]);

  const fetchDetailExam = async () => {
    try {
      const res = await axiosConfig.get(`/getquestion_answer/${student.Id}`, {
        params: { exam_id: exam },
      });
      console.log(student.Id);
      if (res.data) {
        setAllAnswers(res.data.state);
        console.log(res.data.state);
        const initialScores = {};
        res.data.state.forEach((answerSet, index) => {
          answerSet.Exam_Question.forEach((_, i) => {
            initialScores[`${index}-${i}`] = answerSet.model_answer_answer[i];
          });
        });

        console.log(initialScores);
        setOldScores(initialScores);
        setUpdatedScores({});
        console.log(allAnswers);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleScoreChange = (index, i, value, max_score) => {
    const numericValue = Math.max(0, Math.min(Number(value), max_score));
    setUpdatedScores((prev) => ({
      ...prev,
      [`${index}-${i}`]: numericValue,
    }));
  };

  const toggleEditing = (index, i) => {
    setEditingScore(editingScore === `${index}-${i}` ? null : `${index}-${i}`);
  };

  console.log(answer_student);

  const reprocess = async () => {
    try {
      const res = await axiosConfig.patch("/autogenprocessUpdata", {
        exam: exam,
        user: student.Id,
        room: room_id,
        maxscore: maxscore,
        teacher_question: question,
        teacher_answer: answer_teacher,
        student_answer: answer_student,
        keyword: keyword,
      });

      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  console.log(Object.values(updatedScores));

  const Feedback = async () => {
    // ตรวจสอบว่ามีการให้คะแนนครบทุกข้อหรือไม่
    const allQuestionsAnswered = allAnswers.every((answerSet, index) =>
      answerSet.Exam_Question.every(
        (_, i) =>
          updatedScores.hasOwnProperty(`${index}-${i}`) &&
          updatedScores[`${index}-${i}`] !== ""
      )
    );

    if (feedback.trim() === "") {
      alert("กรุณากรอกข้อความก่อนส่งคำตอบ");
      return;
    }

    if (!allQuestionsAnswered) {
      {
        alert("กรุณากรอกคะแนนก่อนส่งคำตอบ");
        return;
      }
    }
    try {
      const scores = Object.values(updatedScores).map(Number);
      const totalScore = scores.reduce((sum, score) => sum + score, 0);
      const str = JSON.stringify(scores);
      console.log(scores);
      console.log(typeof scores);
      setError("ส่ง Feedback สำเร็จแล้ว!");
      setFeedback("");
      setFeedbackSent(true); // ซ่อน textarea หลังจากส่ง

      const res = await axiosConfig.patch("/feedback", {
        exam_id: exam,
        user_id: student.Id,
        room_id: room_id,
        feedback: feedback,
        score: Object.values(updatedScores),
        total_score: totalScore,
        question: question,
        answer_teacher: answer_teacher,
        answer_student: answer_student,
      });

      const oldScores = await axiosConfig.post(`save_old_score`, {
        exam_id: exam,
        user_id: student.Id,
        room_id: room_id,
        score: scores,
      });

      if (res.data && oldScores.data) {
        console.log(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  console.log(updatedScores);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-[100%] mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-bold">
            รายละเอียดข้อสอบของ {student.Name}
          </h2>
        </div>
        <div className="flex items-center space-x-2 gap-5">
          <button
            onClick={handleReprocess}
            disabled={isReprocessing}
            className={`p-2 px-4 rounded-md ${
              isReprocessing
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isReprocessing ? "กำลังประมวลผล..." : "Reset Process"}
          </button>
          <button className="text-red-500 font-semibold" onClick={onClose}>
            ✖ ปิด
          </button>
        </div>
      </div>

      {allAnswers.length > 0 ? (
        allAnswers.map((answerSet, index) =>
          answerSet.Exam_Question.map((question, i) => (
            <div
              key={`${index}-${i}`}
              className="mb-6 p-4 border rounded-md bg-gray-50"
            >
              <p className="text-gray-700">
                <strong>โจทย์:</strong> {question}
              </p>
              <p className="text-gray-700">
                <strong>คะแนนเต็ม:</strong> {answerSet.Exam_Score[i]}
              </p>
              <p className="text-gray-700 flex items-center">
                <strong>คะแนนที่คาดว่าจะได้รับ:</strong>&nbsp;
                {editingScore === `${index}-${i}` ? (
                  <input
                    type="number"
                    min="0"
                    max={answerSet.Exam_Score[i]}
                    value={updatedScores[`${index}-${i}`] || ""}
                    onChange={(e) =>
                      handleScoreChange(
                        index,
                        i,
                        e.target.value,
                        answerSet.Exam_Score[i]
                      )
                    }
                    className="w-16 p-1 border rounded-md text-center"
                  />
                ) : (
                  <span>{updatedScores[`${index}-${i}`]}</span>
                )}
                &nbsp;
                <button onClick={() => toggleEditing(index, i)}>
                  {editingScore === `${index}-${i}` ? (
                    <MdCheck className="h-5 w-5 text-green-500" />
                  ) : (
                    <MdBorderColor className="h-5 w-5 text-blue-500" />
                  )}
                </button>
              </p>
              <div className="mt-3">
                <p className="text-green-600 font-semibold">คำตอบอาจารย์:</p>
                <div className="p-2 bg-green-100 border border-green-300 rounded-md">
                  {answerSet.Exam_Answer[i]}
                </div>
                <p className="mt-2 text-red-500 font-semibold">KeyWord:</p>
                <div className="p-2 bg-red-100 border border-green-300 rounded-md">
                  {answerSet.Exam_keyword[i]
                    ? answerSet.Exam_keyword[i].join(", ")
                    : ""}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-blue-600 font-semibold">คำตอบของนักเรียน:</p>
                <div className="p-2 bg-blue-100 border border-blue-300 rounded-md">
                  {answerSet.answer[i]}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-purple-600 font-semibold">เหตุผล:</p>
                <div className="p-2 bg-purple-100 border border-blue-300 rounded-md">
                  {!answerSet.reason[i]
                    ? "ผู้ทำข้อสอบไม่มีการตอบใดๆ (เป็นค่าว่าง)"
                    : answerSet.reason[i].split("\n").map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                </div>
              </div>
            </div>
          ))
        )
      ) : (
        <p className="text-gray-500 text-center">
          ไม่มีข้อมูลข้อสอบของนักเรียนคนนี้
        </p>
      )}

      {error && <p className="text-green-500 text-center">{error}</p>}

      {!feedbackSent && (
        <div className="mt-4">
          <label className="block font-semibold text-gray-700">Feedback:</label>
          <textarea
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="พิมพ์ความคิดเห็นเกี่ยวกับคำตอบของนักเรียน..."
          />
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          className={`p-2 px-4 rounded-md ${
            currentindex > 0
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-200 cursor-not-allowed"
          }`}
          disabled={currentindex === 0}
          onClick={() => setCurrentindex(currentindex - 1, setError(""))}
        >
          ◀ ก่อนหน้า
        </button>

        <div className="flex gap-4">
          {!feedbackSent && (
            <button
              className="p-2 px-4 rounded-md bg-green-500 text-white hover:bg-green-600"
              onClick={() => Feedback()}
            >
              บันทึกผลลัพธ์
            </button>
          )}

          <button
            className={`p-2 px-4 rounded-md ${
              currentindex < students.length - 1
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 cursor-not-allowed"
            }`}
            disabled={currentindex === students.length - 1}
            onClick={() => setCurrentindex(currentindex + 1, setError(""))}
          >
            ถัดไป ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckExam;
