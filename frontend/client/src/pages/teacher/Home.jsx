import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import axiosConfig from "../../config/axiosconfig";
import { useNavigate } from "react-router-dom";
import { MdAdd } from "react-icons/md";
import Modal from "react-modal";
import RoomCard from "../../components/RoomCard";
import AddEditRoom from "../../components/AddEditRoom";
import DeleteRoom from "../../components/DeleteRoom";

function Home() {
  const [user, setUser] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [allroom, setAllroom] = useState([]);
  const [roommodal, setRoommodal] = useState({
    show: false,
    type: "add",
    data: null,
  });
  const [deletemodal, setDeletemodal] = useState({
    show: false,
    data: null,
  });

  const clickEdit = (editdata) => {
    setRoommodal({ show: true, data: editdata, type: "edit" });
  };

  const clickDelete = (Deletedata) => {
    setDeletemodal({ show: true, data: Deletedata });
  };

  const ToRoom = (room) => {
    navigate(
      "/rooms/Exam",
      localStorage.setItem(
        "All_user_room",
        JSON.stringify({ state: { room, user } })
      )
    );
  };

  //getuser info
  const getuser = async () => {

    try {
      const res = await axiosConfig.get("/get-user");
      if (res.data && res.data.user) {
        setUser(res.data.user); // ตั้งค่า user
        localStorage.setItem("user_name", res.data.user.Name);
        localStorage.setItem("user_id", res.data.user.Id);
        localStorage.setItem("user_email", res.data.user.Email);
        localStorage.setItem("alluser", JSON.stringify(res.data.user));
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.error("Token expired or unauthorized.");
        handleSessionExpired();
      }
    }
  };

  //getAll room
  const getroom = async () => {
    try {
      const res = await axiosConfig.get("/get-room");
      if (res.data && res.data.room) {
        setAllroom(res.data.room);
        console.log(res.data.room);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.error("Token expired or unauthorized.");
      }
    }
  };

  useEffect(() => {
    Modal.setAppElement("#root");
    getroom();
    getuser();
  }, []); // [] เพื่อเรียกแค่ตอน component โหลดครั้งแรก

  return (
    <>
      <Navbar userInfo={localStorage.getItem("user_name")} />

      <div className="container mx-auto">
        <div className="grid grid-cols-3 gap-4 m-6">
          {allroom.map((item, index) => (
            <RoomCard
              key={item.Room_id}
              title={item.Room_Name}
              content={item.Room_Detail}
              date={item.CreateAt} // แปลงวันที่ให้อ่านง่าย
              onEdit={() => clickEdit(item)}
              onDelete={() => clickDelete(item)}
              ToRoom={() => ToRoom(item)}
              room_code={item.room_code}
            />
          ))}
        </div>
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setRoommodal({
            show: true,
            type: "add",
            data: null,
          });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      {/*Modal from edit */}
      <Modal
        isOpen={roommodal.show}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel=""
        className="w-[30%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5"
      >
        <AddEditRoom
          type={roommodal.type}
          roomData={roommodal.data}
          onclose={() => {
            setRoommodal({ show: false, type: "add", data: null });
          }}
          getAllRoom={getroom}
        />
      </Modal>

      {/*Modal from delete */}
      <Modal
        isOpen={deletemodal.show}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel="Delete Room"
        className="w-[30%] bg-white rounded-md mx-auto mt-14 p-5"
      >
        <DeleteRoom
          roomData={deletemodal.data}
          onclose={() => {
            setDeletemodal({ show: false, date: null });
          }}
          getAllRoom={getroom}
        />
      </Modal>
    </>
  );
}

export default Home;