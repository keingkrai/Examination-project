import React, { useEffect, useState } from "react";
import axiosConfig from "../config/axiosconfig";

const SearchStudent = ({ roomdata, onClose, felch }) => {
  const [alluser, setAlluser] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentinclass, setStudetinclass] = useState([]);
  const room_id = roomdata || "";

  // ฟังก์ชันเพื่อดึงรายชื่อนักเรียนทั้งหมด
  const getalluser = async () => {
    try {
      const res = await axiosConfig.get("/get-allstudent");
      if (res) {
        setAlluser(res.data.student);
        setFilteredUsers(res.data.student); // ตั้งค่าเริ่มต้น
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getstudentinclass = async () => {
    try {
      const res = await axiosConfig.get(`/StudentinClass/${room_id}`);
      // เก็บแค่ ID ของ student ที่อยู่ในห้อง
      setStudetinclass(res.data.student.map((i) => i.id)); 
    } catch (err) {
      console.log(err);
    }
  };

  // ฟังก์ชันเพิ่มผู้ใช้งานในห้อง
  const addStudentToRoom = async (user_id) => {
    try {
      const res = await axiosConfig.post(`/add-studentinclass/${room_id}`, {
        user_id: user_id,
      });
      if (res.data) {
        console.log(res.data);
        felch();
        getstudentinclass()
      } else {
        alert("Failed to add student.");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // กรองข้อมูลตามคำค้นหา
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filtered = alluser.filter(
      (user) =>
        user.Name.toLowerCase().includes(searchValue) ||
        user.Email.toLowerCase().includes(searchValue)
    );
    setFilteredUsers(filtered);
  };

  useEffect(() => {
    getalluser();
    getstudentinclass();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Add Students</h2>
        <button className="text-red-500 font-semibold" onClick={onClose}>
          Close
        </button>
      </div>

      {/* ช่องค้นหา */}
      <input
        type="text"
        placeholder="Search by name or email"
        value={searchTerm}
        onChange={handleSearch}
        className="w-full p-2 border border-gray-300 rounded mb-4"
      />

      {/* ตารางแสดงผล */}
      <table className="w-full border-collapse border border-gray-300 text-center">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user.Id}>
                <td className="border border-gray-300 px-4 py-2">
                  {user.Name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {user.Email}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {studentinclass.includes(user.Id) ? (
                    <button
                      className="bg-gray-400 text-white px-3 py-1 rounded"
                      disabled
                    >
                      In Class
                    </button>
                  ) : (
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                      onClick={() => addStudentToRoom(user.Id)}
                    >
                      Add
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-gray-500 py-4">
                No students found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SearchStudent;
