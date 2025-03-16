import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import axiosConfig from "../config/axiosconfig";

const DeleteRoom = ({ roomData, getAllRoom, onclose }) => {
  const [title, setTitle] = useState(roomData ? roomData.Room_Name : "");
  const [error, setError] = useState("");

  const deleteRoom = async () => {
    try {
      const res = await axiosConfig.delete(`/delete-room/${roomData.Room_id}`);
      if (res.data) {
        console.log(res.data);
        getAllRoom(); // ดึงข้อมูลใหม่
        onclose(); // ปิด modal
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred while deleting the room"
      );
    }
  };

  return (
    <div className="relative bg-white p-8 rounded shadow-md">
      <button
        className="rounded-full flex items-center absolute -top-1 -right-1 hover:bg-slate-300"
        onClick={onclose}
      >
        <MdClose className="text-xl text-slate-400" />
      </button>

      <div className="text-center">
        <h2 className="text-lg font-semibold">Are you sure?</h2>
        <p className="text-sm text-gray-600 mt-2">
          Do you really want to delete the room{" "}
          <strong>{title}</strong>
        </p>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <div className="flex justify-between mt-6">
          <button className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded" onClick={onclose}>
            Cancel
          </button>
          <button className="bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded" onClick={deleteRoom}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteRoom;
