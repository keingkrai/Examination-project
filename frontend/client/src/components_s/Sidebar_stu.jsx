import React from "react";
import {
  MdHome,
  MdSettings,
  MdLogout,
  MdArrowBack,
  MdDescription,
  MdGroup,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Sidebar_stu = () => {
  const navigate = useNavigate();
  const data = JSON.parse(localStorage.getItem("All_user_room")) || {}; // ดึงข้อมูล room และ user
  const room_Name = data.state.room.Room_Name;

  const menuItems = React.useMemo(
    () => [
      { name: "Back", path: "/Home_s", icon: <MdArrowBack /> },
      { name: "Exam", path: "/rooms_stu/Exam_stu", icon: <MdDescription /> },
      { name: "Result", path: "/rooms_stu/Result_stu", icon: <MdGroup /> },
    ],
    []
  );

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => {
    // เช็คว่า path นี้ตรงกับหน้าในเมนูไหน
    if (path === "/rooms_stu/Result_stu") {
      return (
        location.pathname.startsWith("/rooms_stu/Result_stu") ||
        location.pathname === "/rooms_stu/See_result_stu"
      );
    }

    return location.pathname === path;
  };

  return (
    <div className="w-44 bg-gray-800 text-white flex flex-col overflow-y-auto">
      <div className="flex flex-col flex-grow">
        <h1 className="font-medium  text-xl mt-5 mb-2 text-center">
          {room_Name}
        </h1>
        {menuItems.map((i, index) => (
          <button
            key={index}
            onClick={() =>
              i.path === "back" ? navigate(-1) : navigate(i.path)
            }
            className={`text-sm flex items-center gap-4 p-4 text-left transition ${
              isActive(i.path)
                ? "bg-gray-700 text-yellow-400 font-bold"
                : "hover:bg-gray-700"
            }`}
          >
            {i.icon}
            <span>{i.name}</span>
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-4 p-4 w-full hover:bg-gray-700 transition"
        >
          <MdLogout />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar_stu;
