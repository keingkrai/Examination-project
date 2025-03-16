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


const Seestudent = ({ user_id, onClose }) => {
  const [examData, setExamData] = useState([]);
  const [user, setUser] = useState([]);
  const data =  JSON.parse(localStorage.getItem("All_user_room"));

  const id = user_id;
  const exam_id = user && user.length > 0 ? user[0].Exam_id : "";
  const room_id = data?.state?.room?.Room_id;
  console.log(user)



  const getuser = async () => {
    try {
      const res = await axiosConfig.get(`/getallexam_final_real_perUser/${id}`,{
        params: {
          room_id: room_id,
        },
      });
      console.log(res.data.state);

      if (res.data) {
        // Group exams by name
        const examScores = res.data.state.reduce((acc, exam) => {
          const examName = exam.Exam_Name;
          if (!acc[examName]) {
            acc[examName] = { totalScore: 0, count: 0, examScoresJSON: [] };
          }

          // Aggregate exam scores
          const scores = JSON.parse(exam.model_score); // Assuming the scores are stored as an array
          acc[examName].examScoresJSON.push(...scores); // Add this exam's scores to the array
          const totalExamScore = scores.reduce((sum, score) => sum + score, 0);
          acc[examName].totalScore += totalExamScore;
          acc[examName].count += scores.length;

          return acc;
        }, {});

        // Format data for graph
        const formattedData = Object.keys(examScores).map((examName) => {
          const scores = examScores[examName].examScoresJSON;

          // Calculate max, min, and average
          const total = examScores[examName].totalScore;
          const maxScore = Math.max(...scores);
          const minScore = Math.min(...scores);
          const averageScore =
            examScores[examName].totalScore / examScores[examName].count;

          return {
            name: examName,
            total: total,
            average: averageScore,
            max: maxScore,
            min: minScore,
          };
        });
        setUser(res.data.state);
        setExamData(formattedData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  
  useEffect(() => {
    getuser();
  }, []);

  return (
    <>
      <div className="p-4 bg-white shadow-md rounded-lg mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold mb-4">
            รายละเอียดของ{" "}
            {user && user.length > 0 ? user[0].Name : "ข้อมูลไม่พบ"}
          </h2>
          <button className="text-blue-400 hover:text-red-500" onClick={() => onClose()}>Cancel</button>
        </div>

        {/* Line Chart */}
        {examData.length > 0 ? (
          <div>
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

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full table-auto border-collapse border border-gray-300 text-center">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">ข้อสอบ</th>
                    <th className="border border-gray-300 px-4 py-2">
                      คะแนนเฉลี่ย
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center">ไม่มีข้อมูลข้อสอบ</p>
        )}
      </div>
    </>
  );
};

export default Seestudent;
