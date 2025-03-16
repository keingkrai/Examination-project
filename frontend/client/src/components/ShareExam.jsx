import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axiosConfig from "../config/axiosconfig";
import moment from "moment-timezone";

const ShareExam = ({ ExamData, onclose, getAllexam, type }) => {
  const [startDateTime, setStartDateTime] = useState(); // วันและเวลาเริ่มต้น
  const [endDateTime, setEndDateTime] = useState(); // วันและเวลาสิ้นสุด
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startDateTime || !endDateTime) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (startDateTime >= endDateTime) {
      setError("วันและเวลาเริ่มต้นต้องน้อยกว่าวันและเวลาสิ้นสุด");
      return;
    }

    try {
      // แปลงวันที่เป็นรูปแบบ UTC ก่อนส่งไปยัง API
      const preload = {
        start_datetime: moment(startDateTime).tz("Asia/Bangkok").format(),
        end_datetime: moment(endDateTime).tz("Asia/Bangkok").format(),
      };

      const res = await axiosConfig.patch(`/set-exam-date/${ExamData.Exam_id}`, preload);

      if (res.data) {
        setError("");
        getAllexam(); // โหลดข้อมูลข้อสอบใหม่
        onclose(); // ปิด modal
      }
    } catch (error) {
      setError("ไม่สามารถบันทึกข้อมูลวันสอบได้");
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold">ตั้งวันที่สอบ</h2>
        <button className="hover:text-red-600" onClick={onclose}>
          ปิด
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          วันและเวลาเริ่มต้น:
        </label>
        <DatePicker
          selected={startDateTime}
          onChange={(date) => setStartDateTime(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15} // ตั้งช่วงเวลาทุกๆ 15 นาที
          dateFormat="dd/MM/yyyy HH:mm"
          timeCaption="เวลา"
          className="w-full p-2 border rounded"
          placeholderText="เลือกวันและเวลาเริ่มต้น"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          วันและเวลาสิ้นสุด:
        </label>
        <DatePicker
          selected={endDateTime}
          onChange={(date) => setEndDateTime(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="dd/MM/yyyy HH:mm"
          timeCaption="เวลา"
          className="w-full p-2 border rounded"
          placeholderText="เลือกวันและเวลาสิ้นสุด"
        />
      </div>

      {/* ข้อผิดพลาด */}
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {/* ปุ่มบันทึก */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleSubmit}
        >
          {type === "save" ? "บันทึกวันที่" : "แก้ไขวันที่"}
        </button>
      </div>
    </div>
  );
};

export default ShareExam;
