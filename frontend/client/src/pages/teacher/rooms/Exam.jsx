import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import Modal from "react-modal";
import AddEditExam from "../../../components/AddEditExam";
import axiosConfig from "../../../config/axiosconfig";
import ExamCard from "../../../components/ExamCard";
import DeleteExam from "../../../components/DeleteExam";
import ShareExam from "../../../components/ShareExam";

function Exam() {
  const data = JSON.parse(localStorage.getItem("All_user_room")) || {}; // ดึงข้อมูล room และ user
  const token = localStorage.getItem("token");
  const {room, user } = data.state
  const [allexam, setAllexam] = useState([]);

  const [exammodal, setExammodal] = useState({
    show: false,
    type: "add",
    data: null,
  });
  const [deletemodal, setDeletemodal] = useState({
    show: false,
    data: null,
  });
  const [sharemodal, setSharemodal] = useState({
    show: false,
    data: null,
  })

  const clickEdit = (editdata) => {
    setExammodal({ show: true, data: editdata, type: "edit" });
  };

  const clickDelete = (Deletedata) => {
    setDeletemodal({ show: true, data: Deletedata });
  };

  const clickShare = (sharedata) => {
    setSharemodal({ show: true, data: sharedata })
  }
  const getAllExam = async () => {
    try {
      const res = await axiosConfig.get(`/get-exam/${room.Room_id}`);
      if (res.data && res.data.exam);
      setAllexam(res.data.exam);
      console.log("allroom", res.data.exam);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.error("Token expired or unauthorized.");
      }
    }
  };

  const getRoom = async () => {
    try {
      const res = await axiosConfig.get(`/get-room/${room.Room_id}`);
      if (res.data && res.data.exam);
      console.log(res.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.error("Token expired or unauthorized.");
      }
    }
  };


  // ใช้ useEffect เพื่ออัปเดต state
  useEffect(() => {
    Modal.setAppElement("#root")
    getAllExam();
    getRoom();
  }, []); // ใส่ dependency เป็น room และ user
  return (
    <>
      <div className="flex flex-col h-screen">
        {/* Navbar ด้านบน */}
        <Navbar userInfo={localStorage.getItem("user_name")} />

        {/* ส่วน Sidebar และ Content */}
        <div className="flex flex-grow">
          {/*side bar */}
          <Sidebar />

          {/*content */}
          <div className="flex-grow p-4 bg-gray-100">
            {/* Main Content */}
            <div className="container mx-auto">
              <div className="grid grid-cols-2 gap-4 mt-4">
                {allexam.map((item, index) => (
                  <ExamCard
                    key={item.Exam_id}
                    exam={item}
                    id={item.Exam_id}
                    title={item.Exam_Name}
                    detail={item.Exam_Detail}
                    time={item.Exam_Time}
                    date={item.CreateAt}
                    keyword={item.Exam_keyword}
                    onEdit={() => clickEdit(item)}
                    onDelete={() => clickDelete(item)}
                    onShare={() => clickShare(item)}
                    startDate={item.StartDate}
                    endDate={item.EndDate}
                  />
                ))}
              </div>
            </div>

            <button
              className="font-medium w-32 h-16 flex items-center text-white justify-center rounded-2xl bg-primary hover:bg-blue-600 fixed bottom-10 left-1/2"
              onClick={() => {
                setExammodal({
                  show: true,
                  type: "add",
                  data: null,
                });
              }}
            >
              Create Exam
            </button>
          </div>
        </div>
      </div>

      {/*Modal when create exam */}
      <Modal
        isOpen={exammodal.show}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        className="w-[80%] h-[90%] max-h-screen bg-white rounded-md mx-auto mt-0 p-5 overflow-scroll"
      >
        <AddEditExam
          type={exammodal.type}
          examData={exammodal.data}
          onclose={() => {
            setExammodal({ show: false, type: "add", data: null });
          }}
          getAllexam={getAllExam}
          Detailroom={room}
        />
      </Modal>

      {/*Delete modal */}
      <Modal
        isOpen={deletemodal.show}
        onRequestClose={() => {
          setDeletemodal({ show: false, data: null });  // ปิด Modal
        }}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        className="w-[25%] h-[30%] max-h-screen bg-white rounded-md mx-auto mt-auto p-5"
      >
        <DeleteExam
          ExamData={deletemodal.data}
          onclose={() => {
            setDeletemodal({ show: false, data: null });
          }}
          getAllexam={getAllExam}
          Detailroom={room}
        />
      </Modal>

      {/*Share modal */}
      <Modal
        isOpen={sharemodal.show}
        onRequestClose={() => {
          setSharemodal({ show: false, data: null });  // ปิด Modal
        }}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        className="w-[20%] h-[50%] max-h-screen bg-white rounded-md mx-auto mt-auto p-5"
      >
        <ShareExam
          ExamData={sharemodal.data}
          onclose={() => {
            setSharemodal({ show: false, data: null, type: "save" });
          }}
          getAllexam={getAllExam}
        />
      </Modal>
    </>
  );
}

export default Exam;
