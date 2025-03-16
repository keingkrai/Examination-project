import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import moment from "moment";
import Modal from "react-modal";


const Result_card_stu = ({ exam }) => {
    const navigate = useNavigate();

    const Exam = {
        title: exam.Exam_Name,
        detail: exam.Exam_Detail,
        score: exam.Exam_Score,
        time: exam.Exam_Time,
        question: exam.Exam_Question,
        start: exam.StartDate,
        end: exam.EndDate,
        room_id: exam.Room_id,
        exam_id: exam.Exam_id,
      };

    console.log(exam)

    const moveon = (exam) =>{
        navigate("../rooms_stu/See_result_stu", { state: { exam }});
        
      }
    
      useEffect(() => {
        Modal.setAppElement("#root");
      }, []);
  return (
    <>
          <div className="ิh-24 flex justify-between mb-2 items-center border-2 rounded p-4 hover:shadow-xl transition-all ease-in-out">
            <div className="items-center justify-between mb-2 gap-4">
              <div className="flex gap-4 mb-2">
                <h6>{Exam.title}</h6>
              </div>
              <p className="text-xs text-slate-600 mb-2">
                {moment(Exam.start).format("Do MMM YYYY, HH:mm")}
                {" - "}
                {moment(Exam.end).format("Do MMM YYYY, HH:mm")}
              </p>
            </div>
    
            <div className="flex items-center gap-4">
              <button className="bg-green-500 rounded-lg p-2 hover:bg-green-600" onClick={() => moveon(Exam)}>
                See result
              </button>
            </div>
          </div>
        </>
  )
}

export default Result_card_stu
