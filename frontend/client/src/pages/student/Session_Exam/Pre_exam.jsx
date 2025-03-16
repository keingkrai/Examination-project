import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosConfig from "../../../config/axiosconfig";


const Pre_exam = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("When Start Exam, Timer will start")

  const user_id = JSON.parse(localStorage.getItem("alluser")).Id
  const [session] = useState(location.state?.session || {});
  const [room_id] = useState(location.state?.room_id || null);

  console.log(error)

  const examInfo = {
    title: session.Exam_Name,
    detail: session.Exam_Detail,
    time: session.Exam_Score,
    exam_id: session.Exam_id
  };

  const checkcondition = async () => {
    try{
      const res = await axiosConfig.get(`/studentcondition/${examInfo.exam_id}`, {
        params: { user_id: user_id}
      })

      console.log(res.data.status.length > 0)

      if(res.data.status.length > 0){
        setError("Exam has been done before")
      }else{
        TakeExam()
      }
    }catch(err){
      console.log(err)
    }
  }


  const TakeExam = () => {
    navigate("/Session_Exam/TakeExam", { state: { exam_detail: session }});
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cyan-600">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-96">
        <h2 className="text-2xl font-semibold mb-4">{examInfo.title}</h2>
        <p className="text-gray-700 mb-2">
          <strong>รายละเอียด: {examInfo.detail}</strong>
        </p>
        <div className="flex justify-between">
          <button
            className="bg-slate-300 px-6 py-2 rounded-lg hover:bg-slate-400 transition"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            onClick={() => checkcondition()}
          >
            Start Exam
          </button>
        </div>
        {error && <p className="text-red-500 mt-5 pb-1">{error}</p>}
      </div>
    </div>
  );
};

export default Pre_exam;
