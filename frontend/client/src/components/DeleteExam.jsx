import React, { useState } from 'react';
import axiosConfig from '../config/axiosconfig';

const DeleteExam = ({ ExamData, getAllexam, onclose, Detailroom }) => {
  const [title, setItle] = useState(ExamData ? ExamData.Exam_Name : "")
  const [err, setError] = useState("")

  const delete_exam = async () => {
    try {

      const res = await axiosConfig.delete(`/delete-exam/${ExamData.Exam_id}`);

      if (res) {
        getAllexam()
        onclose()
      }
      
    } catch ( err ) {
      console.log("โง่อีกแล้ว")
      console.log(err)
    }
  }

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">Delete Exam</h2>
      <p className="mb-4">Are you sure you want to delete the exam: <strong>{title}</strong>?</p>

      <div className="flex gap-4">
        {/* ปุ่มยกเลิก */}
        <button 
          className="bg-gray-500 text-white px-4 py-2 rounded" 
          onClick={onclose}>
          Cancel
        </button>

        {/* ปุ่มยืนยันการลบ */}
        <button 
          className="bg-red-500 text-white px-4 py-2 rounded" 
          onClick={delete_exam}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteExam;
