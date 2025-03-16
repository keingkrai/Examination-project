import React from "react";
import Navbar from "../../../components/Navbar";
import Sidebar_stu from "../../../components_s/Sidebar_stu";

const Setting_stu = () => {
  const user_name = localStorage.getItem("user_name");

  return (
    <>
      <div className="flex flex-col h-screen">
        <Navbar userInfo={user_name} />

        <div className="flex flex-grow">
          <Sidebar_stu />

          <div className="flex-grow p-4 bg-gray-100"></div>
        </div>
      </div>
    </>
  );
};

export default Setting_stu;
