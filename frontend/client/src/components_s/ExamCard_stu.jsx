import React from "react";
import moment from "moment";

const ExamCard_stu = ({ ExamDetail, session }) => {

  return (
    <div
      className={
        "flex items-center border rounded p-4 hover:shadow-xl transition-all ease-in-out  cursor-pointer"
      }
    >
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4">
            <h6 className="text-xl font-bold">{ExamDetail.Exam_Name}</h6>
            <h4 className="text-sm mt-1">{"Exam Time : "}{ExamDetail.Exam_Time}{" Minutes"}</h4>
          </div>
        </div>

        <div className="flex justify-between">
          <p className="font-medium">{"Time limited : "}{moment(ExamDetail.StartDate).format("Do MMM YYYY, HH:mm")} {"-"} {moment(ExamDetail.EndDate).format("Do MMM YYYY, HH:mm")}</p>
          <button className="h-10 border p-2 bg-green-500 rounded-xl hover:bg-fuchsia-500 hover:shadow-xl hover:text-white"
          onDoubleClick={session}>To Session</button>
        </div>
      </div>
    </div>
  );
};

export default ExamCard_stu;
