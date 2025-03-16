import React, { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar_stu from "../../../components_s/Sidebar_stu";
import axiosConfig from "../../../config/axiosconfig";
import ExamCard_stu from "../../../components_s/ExamCard_stu";
import { useNavigate } from "react-router";

const Exam_stu = () => {
  const data = JSON.parse(localStorage.getItem("All_user_room")) || {}; // ดึงข้อมูล room และ user
  const user_name = localStorage.getItem("user_name");
  const room_id = data.state.room.Room_id
  const [ exam, setExam ] = useState([])
  const navigate = useNavigate()

  const getexam_online = async () => {
    try {
      const res = await axiosConfig.get(`/get-exam-online/${room_id}`)
      
      if (res.data && res.data.exam) {
        setExam(res.data.exam)
        console.log(exam)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const To_session = (session) => {
    navigate("../Session_Exam/Pre_exam", { state: { session, room_id }});
  }

  useEffect(() => {
    getexam_online()
  },[room_id])

  return (
    <>
      <div className="flex flex-col h-screen">
        <Navbar userInfo={user_name} />

        <div className="flex flex-grow">
          <Sidebar_stu />

          <div className="flex-grow p-4 bg-gray-100">
            <h1></h1>
            {exam.length > 0 ? (
              <div className="container mx-auto">
                {exam.map((i, index) => (
                  <ExamCard_stu
                    key={i.Exam_id}
                    ExamDetail={i}
                    session={() => {To_session(i)}}/>
                ))}
                </div>
            ) : (
              <p className="text-gray-500 text-center mt-4">
                No Exam found in this room.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Exam_stu;
