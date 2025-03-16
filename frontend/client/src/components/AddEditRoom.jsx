import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import axiosConfig from "../config/axiosconfig";


const AddEditRoom = ({ roomData, type, getAllRoom, onclose }) => {
  const [title, setTitle] = useState( roomData ? roomData.Room_Name : "" );
  const [content, setContect] = useState( roomData ? roomData.Room_Detail : "" );
  const [error, setError] = useState([]);

  const AddRoom = async () => {
    try {
      const res = await axiosConfig.post("/create-room", {
        Room_Name: title,
        Room_Detail: content,
      });

      if (res.data) {
        console.log(res.data);
        getAllRoom(); //refesh หน้าห้องทั้งหมดใหม่
        onclose(); //ปิด modal
      }
    } catch (err) {
      setError(err);
    }
  };

  //EditRoom
  const EditRoom = async () => {
    try {
      const res = await axiosConfig.patch(`/edit-room/${roomData.Room_id}`, {
        Room_Name: title,
        Room_Detail: content,
      });

      if (res.data) {
        console.log(res.data);
        getAllRoom(); //ดึงค่าห้องทั้งหมดใหม่
        onclose(); //ปิด modal
      }
    } catch (err) {
      setError(err.response.data.message);
    }
  };

  //check Detail room
  const DetailRoom = () => {
    if (!title) {
      setError("Enter your title");
      return;
    }

    if (!content) {
      setError("Must have content");
      return;
    }

    setError("");

    if (type === "edit") {
      EditRoom();
    } else {
      AddRoom();
    }
  };

  return (
    <div className="relative">
      <button
        className=" rounded-full flex items-center absolute -top-3 -right-1 hover:bg-slate-300"
        onClick={onclose}
      >
        <MdClose className="text-xl text-slate-400" />
      </button>

      <div>
        <div className="flex flex-col gap-2">
          <label className="input-label text-lg text-black font-medium">Title</label>
          <input
            type="text"
            className="font-sans bg-gray-100 text-lg p-2 text-slate-950 outline-none"
            placeholder=""
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <label className="input-label text-lg text-black font-medium">Content</label>
          <textarea
            type="text"
            className="font-sans bg-gray-200 text-base text-slate-950 outline-none bg-slate-50 p-2 rounded"
            placeholder="Content"
            rows={6}
            value={content}
            onChange={({ target }) => setContect(target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-xs pt-4">{error}</p>}

        <button
          className="btn-primary font-medium mt-5 p-3"
          onClick={DetailRoom}
        >
          {type === "add" ? "Add Room" : "Edit Room"}

          {/*

                if (type === "add") {
                  buttonLabel = "Add Room";
                } else {
                  buttonLabel = "Edit Room";
                }
    
            */}
        </button>
      </div>
    </div>
  );
};

export default AddEditRoom;
