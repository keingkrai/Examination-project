import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Sidebar_stu from "../../../components_s/Sidebar_stu";
import axiosConfig from "../../../config/axiosconfig";
import { MdArrowBack, MdSearch } from "react-icons/md";
import Modal from "react-modal";
import See_question from "../../../components_s/See_question";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const See_result_stu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [exam] = useState(location.state?.exam || {});
  const data = JSON.parse(localStorage.getItem("All_user_room"));
  const room_id = data?.state?.room?.Room_id;
  const [Result_exam, setResult_exam] = useState([]);
  const [Allresult, setAllresult] = useState([]);
  const user_name = localStorage.getItem("user_name");
  const [maxmin , setMaxmin] = useState([])
  const [Seemodal, setSeemodal] = useState({
    show: false,
    data: null,
  });
  const allscore =
    Result_exam.length > 0 &&
    Array.isArray(JSON.parse(Result_exam[0]?.model_score))
      ? JSON.parse(Result_exam[0]?.model_score)
      : []; // Default to an empty array if the score is not valid

  const max = maxmin.length > 0 && maxmin ? maxmin[0].max_score : 0;
  const min = maxmin.length > 0 && maxmin ? maxmin[0].min_score : 0;
  const avg = maxmin.length > 0 && maxmin ? maxmin[0].avg_score : 0;


  console.log(max, min, avg);
  console.log(allscore);

  // Now safely calculate the sum if allscore is a valid array
  const sumscore_real =
    allscore.length > 0 ? allscore.reduce((sum, num) => sum + num, 0) : 0;

  console.log(sumscore_real);

  const getExam = async () => {
    try {
      const res = await axiosConfig.get(`/getfeedback/${exam.exam_id}`, {
        params: {
          room_id: room_id,
        },
      });
      if (res.data.state) {
        setResult_exam(res.data.state);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getscore_Exam = async () => {
    try {
      const res = await axiosConfig.get(`/get_maxminavg_score_feedback/${exam.exam_id}`, {
        params: {
          room_id: room_id,
        },
      });
      if (res.data.state) {
        setMaxmin(res.data.state);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getallExam = async () => {
    try {
      const res = await axiosConfig.get(`/getallexam_final/${exam.exam_id}`, {
        params: {
          room_id: room_id,
        },
      });
      if (res.data.state) {
        setAllresult(res.data.state);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const sumscore = (students) => {
    console.log(students);
    const scores = students?.map((student) => JSON.parse(student.model_score));
    console.log(scores);

    // คำนวณผลรวม, ค่าเฉลี่ย, ค่ามากสุด และค่าน้อยสุดของคะแนนในแต่ละข้อ
    const scoreStatsPerQuestion = scores[0]?.map((_, index) => {
      // คำนวณผลรวมของคะแนนในแต่ละข้อ
      const validScores = scores.map(studentScores => studentScores?.[index] ?? 0);

      const sum = validScores.reduce((sum, score) => {
        return sum + score; // บวกคะแนนของแต่ละข้อ
      }, 0);

      console.log(sum);
      // หาค่าเฉลี่ย
      const average = sum / scores.length;

      // หาค่ามากสุดและค่าน้อยสุด
      const max = Math.max(...validScores);
      const min = Math.min(...validScores);

      return {
        sum, // ผลรวม
        average, // ค่าเฉลี่ย
        max, // ค่ามากสุด
        min, // ค่าน้อยสุด
      };
    });

    return scoreStatsPerQuestion;
  };

  const ChartComponent = ({ detail }) => {
    console.log(detail);
    if (!detail || !Array.isArray(detail) || detail.length === 0) {
      return <p>Loading...</p>; // If the data is empty or not in the expected format
    }

    const parse = JSON.parse(detail?.[0]?.model_score || "[]"); // Default to an empty array if model_score is invalid
    console.log(parse);
    if (!Array.isArray(parse)) {
      return <p>Invalid data for model_score</p>; // If the parsed data is not an array
    }

    const sum = sumscore(detail);
    console.log(sum);
    if (!Array.isArray(sum)) {
      return <p>Loading...</p>; // If the score calculation fails or is not an array
    }

    // Prepare data for the chart
    const questionStats = sum.map((stats, i) => ({
      name: `ข้อที่ ${i + 1}`,
      own: parse[i] || 0, // Default to 0 if the score for a question is not available
      average: stats.average,
      max: stats.max,
      min: stats.min,
    }));

    return (
      <div style={{ width: "100%", height: 500 }}>
        <h2 style={{ textAlign: "center" }}>📊 คะแนนแต่ละข้อ</h2>
        <ResponsiveContainer width="100%" height={450}>
          <BarChart data={questionStats}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="own" fill="#237756" name="คะแนนที่ได้" />
            <Bar dataKey="max" fill="#547DBD" name="คะแนนสูงสุด" />
            <Bar dataKey="average" fill="#8884d8" name="คะแนนเฉลี่ย" />
            <Bar dataKey="min" fill="#ff8042" name="คะแนนต่ำสุด" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  console.log(maxmin);

  useEffect(() => {
    Modal.setAppElement("#root");
    getExam();
    getallExam();
    getscore_Exam();
  }, []);

  return (
    <>
      <div className="flex flex-col h-screen">
        <Navbar userInfo={user_name} />

        <div className="flex flex-grow">
          <Sidebar_stu />

          <div className="flex-grow p-4 bg-gray-100">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center"
            >
              <MdArrowBack className="size-6 icon-btn text-gray-500 hover:text-gray-700" />
              <span className="ml-2">ย้อนกลับ</span>
            </button>
            {Result_exam.length > 0 ? (
              Result_exam.map((exam, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-2">
                  <ChartComponent detail={Allresult} />
                  <div className="flex justify-around">
                    <div>
                      <strong className="font-bold">Your Score :</strong>{" "}
                      {sumscore_real}
                    </div>
                    <div className="flex mb-8 place-content-around gap-10">
                      <div>
                        <strong className="font-bold">Max Score in Exam :</strong>{" "}
                        {(max).toFixed(2)}
                      </div>
                      <div>
                        <strong className="font-bold">Average Score in Exam :</strong>{" "}
                        {(avg).toFixed(2)}
                      </div>
                      <div>
                        <strong className="font-bold">Min Score in Exam :</strong>{" "}
                        {(min).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <table className="w-full border-collapse border border-gray-300 text-center">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2">No</th>
                        <th className="border border-gray-300 px-4 py-2">
                          Question
                        </th>
                        <th className="border border-gray-300 px-4 py-2">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Result_exam.length > 0 &&
                        Result_exam[0].Exam_Question.map((question, Index) => (
                          <tr key={Index}>
                            <td className="border border-gray-300 px-4 py-2">
                              {Index + 1}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {question}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <button
                                className="bg-green-500 px-6 py-4 rounded hover:bg-green-600"
                                onClick={() => {
                                  setSeemodal({
                                    show: true,
                                    data: Index,
                                  });
                                }}
                              >
                                <MdSearch />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center mt-4">
                No Result found in this Session.
              </p>
            )}
          </div>
        </div>
      </div>
      <Modal
        isOpen={Seemodal.show}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0,2)",
          },
        }}
        className="w-[80%] max-h-[90%] bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        {Seemodal && (
          <See_question
            questions={Result_exam[0]}
            currentIndex={Seemodal.data}
            onClose={() => setSeemodal({ show: false, data: null })}
          />
        )}
      </Modal>
    </>
  );
};

export default See_result_stu;
