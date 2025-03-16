import React, { useState, useEffect } from "react";
import axiosConfig from "../config/axiosconfig";
import Exam from "../pages/teacher/rooms/Exam";

const AddEditExam = ({ examData, type, getAllexam, onclose, Detailroom }) => {
  const [questions, setQuestions] = useState(
    examData && Array.isArray(examData.Exam_Question)
      ? examData.Exam_Question.map((q, i) => ({
          question: q,
          answer: examData.Exam_Answer[i],
          score: examData.Exam_Score[i],
          keyword: Array.isArray(examData.Exam_Keyword[i]) 
          ? examData.Exam_Keyword[i] 
          : []
        }))
      : [{ question: "", answer: "", score: "", keyword: [] }]
  );
  // เริ่มต้นด้วย 1 ข้อที่มีคำถาม, คำตอบ, และคะแนน
  const [title, setTitle] = useState(examData ? examData.Exam_Name : "");
  const [detail, setDetail] = useState(examData ? examData.Exam_Detail : "");
  const [time, setTime] = useState(examData ? examData.Exam_Time : "");
  const [error, setError] = useState("");

  console.log(questions);

  // ใช้ useEffect เพื่อตรวจสอบเมื่อ examData เปลี่ยนแปลง
  useEffect(() => {
    if (examData) {
      const parsedQuestions = JSON.parse(examData.Exam_Question);
      const parsedAnswers = JSON.parse(examData.Exam_Answer);
      const parsedScores = JSON.parse(examData.Exam_Score);
      const parsedKeywords = examData.Exam_keyword 
        ? JSON.parse(examData.Exam_keyword) 
        : []; // ตรวจสอบว่าไม่มีค่าเป็น undefined
  
      setQuestions(
        parsedQuestions.map((q, i) => ({
          question: q,
          answer: parsedAnswers[i],
          score: parsedScores[i],
          keyword: Array.isArray(parsedKeywords[i]) ? parsedKeywords[i] : []
        }))
      );
    }
  }, [examData]);
  

  const AddExam = async () => {
    try {
      const res = await axiosConfig.post("/create-exam", {
        Room_id: Detailroom.Room_id,
        Exam_title: title,
        Exam_detail: detail,
        Exam_time: time,
        Exam_question: JSON.stringify(questions.map((q) => q.question)),
        Exam_answer: JSON.stringify(questions.map((q) => q.answer)),
        Exam_score: JSON.stringify(questions.map((q) => q.score)),
        Exam_keyword: JSON.stringify(questions.map((q) => q.keyword)),
      });

      if (res.data) {
        console.log("sdafsajfoieajriogj;earoij", res.data);
        getAllexam();
        onclose();
      }
    } catch (err) {
      setError(err.response.data.message);
    }
  };

  const EditExam = async () => {
    try {
      const res = await axiosConfig.patch(`/edit-exam/${examData.Exam_id}`, {
        Exam_title: title,
        Exam_detail: detail,
        Exam_time: time,
        Exam_question: questions.map((q) => q.question),
        Exam_answer: questions.map((q) => q.answer),
        Exam_score: questions.map((q) => q.score),
        Exam_keyword: questions.map((q) => q.keyword),
      });

      if (res.data) {
        console.log(res.data);
        getAllexam(); //ดึงค่าห้องทั้งหมดใหม่
        onclose(); //ปิด modal
      }
    } catch (err) {
      setError(err.response.data.message);
    }
  };

  const handleKeywordChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].keyword = value.split(",").map(k => k.trim()); // แปลงเป็น array
    setQuestions(updatedQuestions);
  };
  

  // ฟังก์ชันเพิ่มข้อสอบใหม่
  const handleAddQuestion = () => {
    setQuestions([...questions, { question: "", answer: "", score: "", keyword: [] }]);
  };

  // ฟังก์ชันลบข้อสอบ
  const handleRemoveQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  // ฟังก์ชันอัปเดตคำถาม
  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };

  // ฟังก์ชันอัปเดตคำตอบ
  const handleAnswerChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].answer = value;
    setQuestions(updatedQuestions);
  };

  // ฟังก์ชันอัปเดตคะแนน
  const handleScoreChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].score = value;
    setQuestions(updatedQuestions);
  };

  // ฟังก์ชันส่งข้อมูล
  const handleSubmit = () => {
    if (
      questions.some(
        (q) =>
          q.question.trim() === "" ||
          q.answer.trim() === "" ||
          q.score.trim() === "" ||
          isNaN(Number(q.score)) || // ตรวจสอบว่าคะแนนต้องเป็นตัวเลข
          q.keyword.length === 0
      )
    ) {
      setError("Please fill in all title, questions, answers, and scores.");
      return
    }

    if (questions[0].score < 0) {
      setError("Please set score more then 0.");
      return;
    }

    setError("");
    console.log("Exam Data:", questions);
    console.log("fsla;jdf", Detailroom.Room_id);

    if (type === "edit") {
      EditExam();
    } else {
      AddExam();
    }
    onclose(); // ปิด modal หรือ component
  };

  return (
    <div className="p-2 drop-shadow">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold">
          {type === "add" ? "Create Exam" : "Edit Exam"}
        </h2>
        <button
          className="bg-red-500 p-1 rounded text-white  hover:bg-red-600"
          onClick={onclose}
        >
          Close
        </button>
      </div>

      <div className="flex mb-5 gap-4">
        <div className="flex-1">
          <label className="block text-xl font-medium mb-2">
            Title of Exam
          </label>
          <input
            type="text"
            placeholder="Enter your Title of Exam"
            className="w-full p-2 border border-gray-300 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xl font-medium mb-2">Time of Exam</label>
          <input
            type="number"
            placeholder="Enter time of Exam (Minute)"
            className="w-full p-2 border border-gray-300 rounded"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-5 drop-shadow">
        <label className="block text-xl font-medium mb-2">Detail of Exam</label>
        <textarea
          type="text"
          placeholder="Enter Detail"
          className="w-full p-2 border border-gray-300 rounded"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />
      </div>
      <hr className="border mb-5" />

      {/* แสดงข้อสอบ */}
      {questions.map((q, index) => (
        <div key={index} className="mb-6">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium">
              Question {index + 1}
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder={`Enter question ${index + 1}`}
              value={q.question}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <label className="block text-sm font-medium">Answer</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded"
              placeholder={`Enter answer for question ${index + 1}`}
              value={q.answer}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="block text-sm font-medium">Key Words</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded"
              placeholder={`Enter keywords for question ${
                index + 1
              } (Use coomma to separate)`}
              value={q.keyword.join(", ")} // แสดงเป็น string ที่คั่นด้วย comma
              onChange={(e) => handleKeywordChange(index, e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="block text-sm font-medium">Score</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder={`Enter score for question ${index + 1}`}
              value={q.score}
              onChange={(e) => handleScoreChange(index, e.target.value)}
            />
          </div>

          <button
            className="bg-red-500 text-white mt-3 p-2 rounded"
            onClick={() => handleRemoveQuestion(index)}
            disabled={questions.length === 1} // ห้ามลบถ้ามีแค่ข้อเดียว
          >
            Remove Question
          </button>
        </div>
      ))}

      {/* ข้อผิดพลาด */}
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <div className="flex flex-col gap-4 items-end">
        {/* ปุ่มเพิ่มข้อ */}
        <button
          className="btn-primary text-white px-4 py-2 rounded mb-5 w-32"
          onClick={handleAddQuestion}
        >
          Add Question
        </button>

        {/* ปุ่มยืนยัน */}
        <button
          className="bg-green-500 w-32 h-16 hover:bg-green-600 text-white px-4 py-2 rounded mb-5"
          onClick={handleSubmit}
        >
          {type === "add" ? "Create Exam" : "Edit Exam"}
        </button>
      </div>
    </div>
  );
};

export default AddEditExam;
