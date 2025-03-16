import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Profileinfo from "./Profileinfo";
import axiosConfig from "../config/axiosconfig";


function Navbar({ userInfo }) {
  const navigate = useNavigate();
  const roomdetail = JSON.parse(localStorage.getItem("All_user_room")) || {}


  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (<>
      <div className="will-change-transform	 bg-white flex items-center justify-between px-6 py-3 drop-shadow">
        <h2 className="text-xl font-medium text-black -y-2">
          {"Hello Welcome "+userInfo}
        </h2>

        <Profileinfo userInfo={userInfo} onLogout={logout} />
      </div>
      
      </>
  );
}

export default Navbar;
