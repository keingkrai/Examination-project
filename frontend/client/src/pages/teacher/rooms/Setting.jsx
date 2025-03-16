import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import axiosConfig from "../../../config/axiosconfig";
import { useNavigate } from "react-router";

const Setting = () => {
  const [roomName, setRoomName] = useState("");
  const [roomDetail, setRoomDetail] = useState("");
  const [roomId, setRoomId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRoom = JSON.parse(localStorage.getItem("All_user_room")) || {};
    if (storedRoom.state?.room?.Room_id) {
      setRoomId(storedRoom.state.room.Room_id);
      setRoomName(storedRoom.state.room.Room_Name || "");
      setRoomDetail(storedRoom.state.room.Room_Detail || "");
    }
  }, []);

  const handleUpdateRoom = async () => {
    if (!roomId) {
      alert("ไม่พบห้องที่ต้องการแก้ไข");
      return;
    }

    try {
      const res = await axiosConfig.patch(`/edit-room/${roomId}`, {
        Room_Name: roomName,
        Room_Detail: roomDetail,
      });

      if (res.data.status === "ok") {
        alert("อัปเดตข้อมูลห้องสำเร็จ!");
        navigate("../Home");
      } else {
        alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
      }
    } catch (err) {
      console.error("Error updating room:", err);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar ด้านบน */}
      <Navbar userInfo={localStorage.getItem("user_name")} />

      {/* ส่วน Sidebar และ Content */}
      <div className="flex flex-grow">
        <Sidebar />
        <div className="flex-grow p-4 bg-gray-100">
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* ฟอร์มเปลี่ยนชื่อห้อง */}
            <div className="mb-4">
              <label className="block font-medium">ชื่อห้อง:</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                placeholder="กรอกชื่อห้องใหม่"
              />
            </div>

            {/* ฟอร์มเปลี่ยนรายละเอียดห้อง */}
            <div className="mb-4">
              <label className="block font-medium">รายละเอียดห้อง:</label>
              <textarea
                value={roomDetail}
                onChange={(e) => setRoomDetail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                rows="3"
                placeholder="กรอกรายละเอียดห้องใหม่"
              />
            </div>

            {/* ปุ่มบันทึก */}
            <button
              onClick={handleUpdateRoom}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
