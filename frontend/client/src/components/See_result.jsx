import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { MdArrowBack } from "react-icons/md";
import { useLocation, useNavigate, Link, Outlet } from "react-router-dom";
import Modal from "react-modal";
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

const SeeResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [exam] = useState(JSON.parse(localStorage.getItem("exam")) || {});
  const data = JSON.parse(localStorage.getItem("All_user_room"));
  const [students, setStudents] = useState([]);
  const [teacher, setteacher] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState("ทั้งหมด");

  const tabs = [
    //{ name: "Summary", path: "SumScore" },
    //{ name: "PerQuestion", path: "PerQuestion" },
  ];
  const room_id = data?.state?.room?.Room_id;
  const exam_id = exam?.exam_id;

  const score_exam = exam ? JSON.parse(exam.score).map(Number) : "";
  const sumscore_exam = score_exam.reduce((sum, value) => sum + value, 0);
  console.log(score_exam);

  const mapscore = (studentscore) => {
    return studentscore.map((score) => score.model_score);
  };

  const calculateScores = (score_student, score_exam) => {
    console.log(score_exam);
    const finalScores = score_student.map((studentScores) =>
      studentScores.map((score, index) => score * score_exam[index])
    );
    const sumscore_student = finalScores.map((studentScores) =>
      studentScores.reduce((sum, value) => sum + value, 0)
    );

    return {
      finalScores,
      sumscore_student,
    };
  };

  const fetchtecher_exam = async () => {
    try {
      const res = await axiosConfig.get(`/get_exam_teacher/${room_id}`, {
        params: { exam_id: exam_id },
      });
      if (res?.data?.state) {
        setteacher(res.data.state);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetch_allstudent = async () => {
    try {
      const res = await axiosConfig.get(`/getscore_student/${exam_id}`, {
        params: { room_id: room_id },
      });

      if (res?.data?.state) {
        const fetchedStudents = res.data.state;
        console.log(fetchedStudents);
        const score_student = mapscore(fetchedStudents);
        console.log(score_student);
        const { finalScores, sumscore_student } = calculateScores(
          score_student,
          score_exam
        );

        const updatedStudents = fetchedStudents.map((student, index) => ({
          ...student,
          finalScores: finalScores[index],
          sumscore_student: sumscore_student[index],
        }));
        setStudents(updatedStudents);
        setCategories(categorizeStudent(updatedStudents));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const sumscore = (students) => {
    console.log(students);
    const scores = students?.map((student) => student.model_score) || [];
    console.log(scores);

    // คำนวณผลรวม, ค่าเฉลี่ย, ค่ามากสุด และค่าน้อยสุดของคะแนนในแต่ละข้อ
    const scoreStatsPerQuestion = scores[0]?.map((_, index) => {

      const validScores = scores.map(studentScores => studentScores?.[index] ?? 0);
      // คำนวณผลรวมของคะแนนในแต่ละข้อ
      const sum = validScores.reduce((sum, score) => {
        return sum + score // บวกคะแนนของแต่ละข้อ
      }, 0);

      // หาค่าเฉลี่ย
      const average = sum / scores.length;
      console.log(sum)

      // หาค่ามากสุดและค่าน้อยสุด
      const max = Math.max(...validScores);
      const min = Math.min(...validScores);

      console.log(max)
      console.log(min)

      return {
        sum, // ผลรวม
        average, // ค่าเฉลี่ย
        max, // ค่ามากสุด
        min, // ค่าน้อยสุด
      };
    });

    return scoreStatsPerQuestion;
  };

  const ChartComponent = ({ students }) => {
    console.log(students)

    const sum = sumscore(students);
    console.log(students)

    if (!Array.isArray(sum)) {

      return <p>Loading...</p>;
    }

    // แปลงข้อมูลสำหรับกราฟ
    const data = sum.map((stats, index) => ({
      name: `ข้อที่ ${index + 1}`, // ชื่อข้อสอบ
      average: stats.average, // ค่าเฉลี่ย
      max: stats.max, // ค่ามากสุด
      min: stats.min, // ค่าน้อยสุด
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="max" fill="#FF7F50" name="คะแนนมากสุด" />
          <Bar dataKey="average" fill="#DE3163" name="ค่าเฉลี่ย" />
          <Bar dataKey="min" fill="#ff0000" name="คะแนนน้อยสุด" />
          <Legend />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  useEffect(() => {
    Modal.setAppElement("#root");
    fetch_allstudent();
    fetchtecher_exam();
  }, [exam_id, room_id]);

  useEffect(() => {
    if (location.pathname === "/rooms/See_result") {
      navigate("SumScore", { state: { exam_id } });
    }
  }, [location, navigate]);

  return (
    <div className="flex flex-col h-screen">
      <Navbar userInfo={localStorage.getItem("user_name")} />
      <div className="flex flex-grow">
        <Sidebar />
        <div className="flex-grow p-4 bg-gray-100">
          <button
            onClick={() => navigate("/rooms/Compare")}
            className="mb-4 flex items-center"
          >
            <MdArrowBack className="size-6 icon-btn text-gray-500 hover:text-gray-700" />
            <span className="ml-2">ย้อนกลับ</span>
          </button>

          {students.length > 0 ? (
            <>
              <ChartComponent students={students} />

              <div className="flex space-x-4 mb-2">
                {tabs.map((tab, index) => {
                  const isActive = location.pathname.endsWith(tab.path);
                  return (
                    <Link
                      key={index}
                      to={tab.path}
                      className={`py-2 px-4 ${
                        isActive
                          ? "bg-gray-400 text-black"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    >
                      {tab.name}
                    </Link>
                  );
                })}
              </div>

              <Outlet />
            </>
          ) : (
            <p className="text-gray-500 text-center mt-4">
              No students exam found in this room.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeeResult;
