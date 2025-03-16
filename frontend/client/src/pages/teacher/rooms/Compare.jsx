import { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import axiosConfig from "../../../config/axiosconfig";
import Resultcard from "../../../components/Resultcard";

const Compare = () => {

  const data = JSON.parse(localStorage.getItem("All_user_room"))
  const room_id = data.state.room.Room_id

  const [ Allexam, setAllexam ] = useState({})

  console.log(Allexam)


  const allexam = async () => {
    try {
      const result = await axiosConfig.get(`/get-exam/${room_id}`)

      if(result && result.data){
        console.log("allexam : ",result)
        setAllexam(result.data.exam)
      }

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    allexam()
  }, []);

  return (
    <>
      <div className="flex flex-col h-screen">
        {/* Navbar ด้านบน */}
        <Navbar userInfo={localStorage.getItem("user_name")} />

        {/* ส่วน Sidebar และ Content */}
        <div className="flex flex-grow">
          <Sidebar />
          <div className="flex-grow p-4 bg-gray-100">
            {Allexam.length > 0 ? (
              <div className="container mx-auto">
                {Allexam.map((i) => (
                  <Resultcard
                  key={i.Exam_id}
                  exam={i}/>
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

export default Compare;
