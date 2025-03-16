import React, { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";

const Analysis = () => {
  const location = useLocation();
  const navigate = useNavigate(); // ใช้สำหรับรีไดเรกต์

  const tabs = [
    { name: "Exam Analysis", path: "ExamAnalysis" },
    { name: "Student Analysis", path: "StudentAnalysis" },
  ];

  useEffect(() => {
    if (location.pathname === "/rooms/Analysis") {
      navigate("ExamAnalysis"); // รีไดเรกต์ไป ExamAnalysis
    }
  }, [location, navigate]);

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar ด้านบน */}
      <Navbar userInfo={localStorage.getItem("user_name")} />

      {/* ส่วน Sidebar และ Content */}
      <div className="flex flex-grow">
        <Sidebar />
        <div className="flex-grow p-4 bg-gray-100">
          {/* 🔹 แถบเมนูแนวนอน */}
          <div className="flex space-x-4 border-b-2 mb-4">
            {tabs.map((tab, index) => {
              const isActive = location.pathname.endsWith(tab.path);
              return (
                <Link
                  key={index}
                  to={tab.path}
                  className={`py-2 px-4 ${
                    isActive
                      ? "bg-gray-400 text-black"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                >
                  {tab.name}
                </Link>
              );
            })}
          </div>

          {/* 🔹 แสดงเนื้อหาของแต่ละแท็บ */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Analysis;
