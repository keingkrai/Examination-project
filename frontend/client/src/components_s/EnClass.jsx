import React, { useEffect, useState } from "react";
import axiosConfig from "../config/axiosconfig";
import { MdAdd, MdClose } from "react-icons/md";

const EnClass = ({ roomcode, onclose, getallroom }) => {
  const [Roomcode, setRoomcode] = useState(roomcode || "");
  const role = "student";
  const [err, setError] = useState("");

  const CheckCodeRoom = async () => {
    try {
      const res = await axiosConfig.get(`/get-password-room?room_code=${Roomcode}`);

      if (res.data) {
        console.log("password is",res.data.room.Room_id)
        const roomcode = res.data.room.room_code;

        // ตรวจสอบว่าห้องนี้เคยมีการเข้าร่วมไปแล้วหรือไม่
        const isUsed = await CheckUsedRoomCode(roomcode);

        if (isUsed) {
          setError("This room code has already been used.");
          return null;  // ถ้าห้องนี้เคยใช้แล้วไม่ให้ดำเนินการต่อ
        } else {
          EnClass(res.data.room.Room_id)
          onclose()
        }
      }
    } catch (err) {
      setError("Invalid room code. Please check and try again.");

    }
  };

  // ตรวจสอบห้องว่าเคยมีการเข้าร่วมหรือยัง
  const CheckUsedRoomCode = async (roomid) => {
    try {
      const res = await axiosConfig.get(`/check-room-used?room_code=${roomid}`);
      console.log(res.data.isUsed)
      return res.data.isUsed; // กำหนดให้ API ส่งกลับว่า 'true' หรือ 'false'
    } catch (err) {
      console.log("Error checking used room:", err);
      return false; // ถ้ามีข้อผิดพลาด ก็จะถือว่าไม่เคยใช้
    }
  };

  const EnClass = async (roomid) => {
    try {
      const res = await axiosConfig.post(`/EnClass/${roomid}`, {
        role: role,
      });

      console.log("Enclass is :", res.data);
      getallroom()
    } catch (err) {
      console.log(err);
    }
  };

  const CheckCode = async () => {
    setError("");  // รีเซ็ตข้อความผิดพลาด

    if (!Roomcode) {
      setError("Please enter a room code.");
      return;
    }

    try {
      const roomid = await CheckCodeRoom();

      if (roomid) {
        await EnClass(roomid);  // ถ้าไม่มีปัญหาจะเข้าห้องได้
        onclose();  // ปิด Modal
      }
    } catch (err) {
      console.error("Error checking room code:", err);
    }
  };

  return (
    <div className="relative">
      <button
        className="rounded-full flex items-center absolute -top-3 -right-1 hover:bg-slate-300"
        onClick={onclose}
      >
        <MdClose className="text-xl text-slate-400" />
      </button>

      <div className="flex flex-col gap-2">
        <label className="text-white input-label text-base">Please Enter Room Code</label>
        <input
          type="text"
          className="font-sans text-xl bg-gray-200 text-2xl text-slate-950 outline-none"
          placeholder="  Enter Room Code"
          value={Roomcode}
          onChange={({ target }) => setRoomcode(target.value)}
        />
      </div>

      {err && <p className="text-red-500 text-xs mb-3 mt-3">{err}</p>}

      <div className="flex justify-end">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded mt-5 w-30"
          onClick={CheckCode}
        >
          Enter
        </button>
      </div>
    </div>
  );
};

export default EnClass;
