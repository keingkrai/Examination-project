import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axiosConfig from "../config/axiosconfig";

const ExamAnalysis = () => {
  const [examData, setExamData] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [score, setScore] = useState([]);
  console.log(examData);

  useEffect(() => {
    // ดึงข้อมูลห้องสอบจาก localStorage
    const allExams = JSON.parse(localStorage.getItem("All_user_room")) || {};
    if (allExams.state?.room?.Room_id) {
      setRoomId(allExams.state.room.Room_id);
    }
  }, []);

  useEffect(() => {
    if (roomId) {
      getAllExam();
    }
  }, [roomId]);

  const getAllExam = async () => {
    try {
      const res = await axiosConfig.get(`/getalluser_final_real/${roomId}`);

      if (res.data) {
        console.log("All Exams:", res.data.state);
        setScore(res.data.state);

        // จัดกลุ่มข้อสอบตามชื่อ
        const examScores = res.data.state.reduce((acc, exam) => {
          console.log(exam.total_score);
          const examName = exam.Exam_Name;
          if (!acc[examName]) {
            acc[examName] = { totalScore: 0, count: 0, totalScores: [] };
          }

          // เพิ่มคะแนนรวมจาก exam.total_score
          acc[examName].totalScores.push(exam.total_score); // เก็บ total_score ของแต่ละคน
          acc[examName].totalScore += exam.total_score; // รวมคะแนนทั้งหมด
          acc[examName].count += 1; // เพิ่มจำนวนคนที่ทำข้อสอบ

          console.log(acc);

          return acc;
        }, {});

        // แปลงข้อมูลให้อยู่ในรูปแบบที่ใช้กับกราฟ
        const formattedData = Object.keys(examScores).map((examName) => {
          const scores = examScores[examName].totalScores;

          // คำนวณ max, min, และ average
          const maxScore = Math.max(...scores); // คะแนนมากสุด
          const minScore = Math.min(...scores); // คะแนนน้อยสุด
          const averageScore =
            examScores[examName].totalScore / examScores[examName].count; // คะแนนเฉลี่ย

          return {
            name: examName,
            average: averageScore,
            max: maxScore,
            min: minScore,
          };
        });

        setExamData(formattedData);
      }
    } catch (err) {
      console.log("Error fetching exams:", err);
    }
  };

  return (
    <>
      <div className="p-4 bg-white shadow-md rounded-lg mb-4">
        <h2 className="text-xl font-bold mb-4">การวิเคราะห์ข้อสอบแต่ล่ะชุด</h2>

        {/* Bar Chart */}
        {examData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={examData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="max" fill="#ed5b3b" name="ค่ามากสุด" />
              <Bar dataKey="average" fill="#82ca9d" name="ค่าเฉลี่ย" />
              <Bar dataKey="min" fill="#7d6de2" name="ค่าน้อยสุด" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center">ไม่มีข้อมูลข้อสอบ</p>
        )}

        {/* Table */}
        {examData.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-300 text-center">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">ข้อสอบ</th>
                  <th className="border border-gray-300 px-4 py-2">
                    คะแนนเฉลี่ย
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    คะแนนมากสุด
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    คะแนนน้อยสุด
                  </th>
                </tr>
              </thead>
              <tbody>
                {examData.map((exam, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">
                      {exam.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {exam.average.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {exam.max.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {exam.min.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ExamAnalysis;
