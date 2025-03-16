import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import axiosConfig from "../../config/axiosconfig";
import Roomcard_stu from "../../components_s/Roomcard_stu";
import Modal from "react-modal";
import { MdAdd } from "react-icons/md";
import EnClass from "../../components_s/EnClass";
import { useNavigate } from "react-router";

const Home_student = () => {
  const name = localStorage.getItem("user_name");
  const [user, setUser] = useState([]);
  const [allroom, setAllroom] = useState([]);
  const navigate = useNavigate()
  const [enclassmodal, setEnclassmodal] = useState({
    show: false,
    type: "add",
    data: null,
  });
  const token = localStorage.getItem("token");

  //getuser info
  const getuser = async () => {

    try {
      const res = await axiosConfig.get("/get-user");
      if (res.data && res.data.user) {
        console.log(res);
        setUser(res.data.user);
        localStorage.setItem("user_name", res.data.user.Name);
        localStorage.setItem("user_id", res.data.user.Id);
        localStorage.setItem("user_email", res.data.user.Email);
        localStorage.setItem("alluser", JSON.stringify(res.data.user));
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.error("Token expired or unauthorized.");
      }
    }
  };

  //getall room
  const getallroomfor_student = async () => {
    try {
      const res = await axiosConfig.get("/get-room-student");
      if (res.data && res.data.room) {
        setAllroom(res.data.room)
        console.log(res.data.room);
      }
    } catch (err) {
      console.log(err);
    }
  };
  

  const ToRoom = (room) => {
    navigate(
      "/rooms_stu/Exam_stu",
      localStorage.setItem("All_user_room",JSON.stringify({ state: { room, user}}))
    );
  };

  useEffect(() => {
    Modal.setAppElement("#root");
    getallroomfor_student()
    getuser();
  }, [name]); // [] เพื่อเรียกแค่ตอน component โหลดครั้งแรก

  return (
    <>
      <Navbar userInfo={name} />

      <div className="container mx-auto">
        <div className="grid grid-cols-3 gap-4 m-6">
          {allroom.map((i) => (
            <Roomcard_stu
              key={i.Room_id}
              title={i.Room_Name}
              content={i.Room_Detail}
              toroom={() => ToRoom(i)}
            />
          ))}
        </div>
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setEnclassmodal({
            show: true,
            type: "add",
            data: null,
          });
        }}
      >
        <MdAdd className="test-[32px] text-white" />
      </button>

      <Modal
        isOpen={enclassmodal.show}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0,2)",
          },
        }}
        className="w-[40%] max-h-3/4 bg-gray-700 rounded-md mx-auto mt-14 p-5"
      >
        <EnClass
          roomcode={enclassmodal.data}
          onclose={() => {
            setEnclassmodal({ show: false, type: "add", data: null });
          }}
          getallroom={getallroomfor_student}
        />
      </Modal>
    </>
  );
};

export default Home_student;
