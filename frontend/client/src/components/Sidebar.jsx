import React from "react";
import { MdSettings, MdLogout, MdArrowBack, MdDescription, MdGroup, MdSearch, MdBarChart } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = JSON.parse(localStorage.getItem("All_user_room")) || {};
  const room_Name = data.state?.room?.Room_Name || "Room Name";

  const menuItems = [
    { name: "Back", path: "/Home", icon: <MdArrowBack /> },
    { name: "Exam", path: "/rooms/Exam", icon: <MdDescription /> },
    { name: "Result", path: "/rooms/Compare", icon: <MdSearch /> },
    { name: "Analysis", path: "/rooms/Analysis", icon: <MdBarChart /> }, // Analysis ควรยัง active ใน Student Analysis
    { name: "Manage", path: "/rooms/Member", icon: <MdGroup /> },
    { name: "Setting", path: "/rooms/Setting", icon: <MdSettings /> },
  ];

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/rooms/Compare") {
      // เช็คว่า path นี้ตรงกับหน้าในเมนูไหนที่เกี่ยวข้องกับ Compare
      return location.pathname.startsWith("/rooms/Compare") || location.pathname.startsWith("/rooms/See_result");
    }
    if (path === "/rooms/Analysis") {
      // เช็คว่าอยู่ในหน้า Analysis หรือไม่
      return location.pathname.startsWith("/rooms/Analysis");
    }
    return location.pathname === path;
  };

  return (
    <div className="w-44 bg-gray-800 text-white flex flex-col overflow-y-auto">
      <div className="flex flex-col flex-grow">
        <h1 className="text-xl font-medium mt-5 mb-2 text-center">{room_Name}</h1>
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`text-sm flex items-center gap-4 p-4 text-left transition ${
              isActive(item.path) ? "bg-gray-700 text-yellow-400 font-bold" : "hover:bg-gray-700"
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </button>
        ))}
      </div>

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

export default Sidebar;
