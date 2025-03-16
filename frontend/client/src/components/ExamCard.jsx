import React, { useState, useEffect } from "react";
import moment from "moment";
import {
  MdCreate,
  MdDelete,
  MdShare,
  MdContactPage,
  MdAccessTime,
} from "react-icons/md";
import axiosConfig from "../config/axiosconfig";
import SeeStudentDoExam from "../components_s/SeeStudentDoExam";
import Modal from "react-modal";

const ExamCard = ({
  exam,
  id,
  title,
  detail,
  time,
  date,
  startDate,
  endDate,
  onEdit,
  keyword,
  onDelete,
  onShare,
  ToRoom,
}) => {
  const color = [
    "bg-gray-50",
    "bg-gray-100",
    "bg-gray-200",
    "bg-indigo-50",
    "bg-indigo-100",
    "bg-pink-50",
    "bg-pink-100",
    "bg-green-50",
    "bg-green-100",
  ];
  const data = JSON.parse(localStorage.getItem("All_user_room")) || {}; // ดึงข้อมูล room และ user
  const [isWithinTime, setIsWithinTime] = useState(); // สถานะว่าขณะนี้อยู่ในช่วงเวลา
  const randomColor = color[Math.floor(Math.random() * color.length)];
  const Room_id = data.state.room.Room_id;
  const [Student_exam, setStudent_exam] = useState({
    show: false,
    data: null,
  });

  console.log(isWithinTime);

  const updatastatus = async (isOnline) => {
    try {
      const endpoint = isOnline
        ? `/edit-status-online/${id}`
        : `/edit-status-offline/${id}`;
      const res = await axiosConfig.patch(endpoint);

      if (res) {
        console.log(
          `Exam status updated to: ${isOnline ? "online" : "offline"}`
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  useEffect(() => {
    // คำนวณช่วงเวลา
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);
    const isInTimeRange = moment().isBetween(startMoment, endMoment);

    console.log(startDate, endDate);

    // อัปเดตสถานะในฐานข้อมูลเมื่อสถานะเปลี่ยนแปลง
    if (isWithinTime !== isInTimeRange) {
      setIsWithinTime(isInTimeRange);
      updatastatus(isInTimeRange);
    }
  }, [startDate, endDate, isWithinTime]);

  return (
    <>
      <div
        className={`flex items-center border rounded p-4 hover:shadow-xl transition-all ease-in-out ${randomColor} cursor-pointer`}
        onClick={ToRoom}
      >
        {/* สัญลักษณ์วงกลมสีแดงหรือเขียว */}
        <div
          className={`flex-shrink-0 w-8 h-8 ${
            isWithinTime ? "bg-green-500" : "bg-red-500"
          } rounded-full mr-4`}
        ></div>

        {/* เนื้อหาหลัก */}
        <div className="flex-1 flex flex-col justify-between">
          {/* ส่วนหัว */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-4">
              <h6 className="font-medium text-xl">{title}</h6>
              <h4 className="font-small text-xs">Time : {time} Minutes</h4>
            </div>
          </div>

          {/* เนื้อหา */}
          <p className="text-base text-slate-600 mb-2">{detail}</p>
          <p className="text-xs text-slate-600 mb-2">
            {moment(startDate).format("Do MMM YYYY, HH:mm")} {"- "}
            {moment(endDate).format("Do MMM YYYY, HH:mm")}
          </p>
        </div>

        <div className="text-xs text-slate-500">
          Create : {moment(date).format("Do MMM YYYY")}
          {/* ปุ่ม Edit และ Delete */}
          <div className="flex items-center gap-4 mt-5 ml-7">
            <MdContactPage
              className="icon-btn hover:text-yellow-600"
              onClick={() => {
                setStudent_exam({
                  show: true,
                  data: null,
                });
              }}
            />
            <MdAccessTime
              className="icon-btn hover:text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
            />
            <MdCreate
              className="icon-btn hover:text-green-600"
              onClick={(e) => {
                e.stopPropagation();
                if (isWithinTime === true) {
                  alert(
                    "ยังอยู่ในช่วงเวลาทำข้อสอบ ไม่สามารถ แก้ไข หรือ ลบ ได้"
                  );
                } else {
                  onEdit();
                }
              }}
            />
            <MdDelete
              className="icon-btn hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                if (isWithinTime === true) {
                  alert(
                    "ยังอยู่ในช่วงเวลาทำข้อสอบ ไม่สามารถ แก้ไข หรือ ลบ ได้"
                  );
                } else {
                  onDelete();
                }
              }}
            />
          </div>
        </div>
      </div>
      <Modal
        isOpen={Student_exam.show}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0,2)",
          },
        }}
        className="w-[30%] h-[80%] rounded-md mx-auto mt-16 overflow-scroll"
      >
        <SeeStudentDoExam
          Exam={exam.Exam_id}
          Room={Room_id}
          onClose={() => {
            setStudent_exam({ show: false, data: null });
          }}
        />
      </Modal>
    </>
  );
};

export default ExamCard;
