import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar_stu from "../../../components_s/Sidebar_stu";
import axiosConfig from "../../../config/axiosconfig";
import Result_card_stu from "../../../components_s/Result_card_stu";

const Result_stu = () => {
  const user_name = localStorage.getItem("user_name");

  const data = JSON.parse(localStorage.getItem("All_user_room"));
  const room_id = data.state.room.Room_id;

  const [Allexam, setAllexam] = useState({});
  console.log(Allexam);

  const allexam = async () => {
    try {
      const result = await axiosConfig.get(`/get-exam/${room_id}`);

      if (result && result.data) {
        console.log("allexam : ", result);
        setAllexam(result.data.exam);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    allexam();
  }, []);

  return (
    <>
      <div className="flex flex-col h-screen">
        <Navbar userInfo={user_name} />

        <div className="flex flex-grow">
          <Sidebar_stu />
          <div className="flex-grow p-4 bg-gray-100">
            {Allexam.length > 0 ? (
              <div className="container mx-auto">
                {Allexam.map((i) => (
                  <Result_card_stu key={i.Exam_id} exam={i} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center mt-4">
                No Exam found in this room.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Result_stu;
