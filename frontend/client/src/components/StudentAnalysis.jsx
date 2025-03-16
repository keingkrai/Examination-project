import React, { useEffect, useState } from "react";
import axiosConfig from "../config/axiosconfig";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Modal from "react-modal";
import Seestudent from "./Seestudent";

const StudentAnalysis = () => {
  const [studentData, setStudentData] = useState([]);
  const [examNames, setExamNames] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [seestudent, setSeestudent] = useState({
    show: false,
    type: "add",
    data: null,
  });

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#a83232", "#32a8a8", "#a832a8"];

  useEffect(() => {
    const allExams = JSON.parse(localStorage.getItem("All_user_room")) || {};
    if (allExams.state?.room?.Room_id) {
      setRoomId(allExams.state.room.Room_id);
    }
  }, []);

  useEffect(() => {
    if (roomId) {
      getStudentScores();
    }
  }, [roomId]);

  const getStudentScores = async () => {
    try {
      const res = await axiosConfig.get(`/getalluser_final_real/${roomId}`);
      if (res.data) {
        const exams = new Set();
        const studentScores = res.data.state.reduce((acc, student) => {
          const studentId = student.Id; // ✅ ดึง id ของนักเรียน
          const studentName = student.Name;
          const examName = student.Exam_Name;
          exams.add(examName);
          if (!acc[studentId]) {
            acc[studentId] = { id: studentId, name: studentName, totalScore: 0 };
          }
          const scores = JSON.parse(student.model_score) || [];
          const examScore = scores.reduce((sum, score) => sum + score, 0);
          acc[studentId][examName] = examScore;
          acc[studentId].totalScore += examScore;
          return acc;
        }, {});

        setExamNames(Array.from(exams));
        setStudentData(Object.values(studentScores));
      }
    } catch (err) {
      console.error("Error fetching student scores:", err);
    }
  };

  useEffect(() => {
    Modal.setAppElement("#root");
  }, []);

  return (
    <>
      <div className="p-4 bg-white shadow-md rounded-lg mb-4">
        <h2 className="text-xl font-bold mb-4">คะแนนนักเรียนต่อข้อสอบทั้งหมด</h2>
        {studentData.length > 0 && (
          <div className="mb-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {examNames.map((exam, index) => (
                  <Bar key={index} dataKey={exam} fill={colors[index % colors.length]} name={exam} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {studentData.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-300 text-center">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">นักเรียน</th>
                  {examNames.map((exam, index) => (
                    <th key={index} className="border border-gray-300 px-4 py-2">{exam}</th>
                  ))}
                  {/*<th className="border border-gray-300 px-4 py-2">SeeResult</th>*/}
                </tr>
              </thead>
              <tbody>
                {studentData.map((student, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">{student.name}</td>
                    {examNames.map((exam, idx) => (
                      <td key={idx} className="border border-gray-300 px-4 py-2">{student[exam] || 0} คะแนน</td>
                    ))}
                    {/*<td className="border border-gray-300 px-4 py-2">
                      <button
                        className="w-16 h-14 rounded-xl text-white bg-primary hover:bg-blue-600"
                        onClick={() => {
                          setSeestudent({ show: true, data: student.id });
                        }}
                      >
                        Result
                      </button>
                    </td>*/}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center">ไม่มีข้อมูลคะแนนนักเรียน</p>
        )}
      </div>

      <Modal
        isOpen={seestudent.show}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        className="w-[90%] bg-white rounded-md mx-auto mt-14 p-5"
      >
        <Seestudent
          user_id={seestudent.data}
          onClose={() => {
            setSeestudent({ show: false, data: null });
          }}
        />
      </Modal>
    </>
  );
};

export default StudentAnalysis;
