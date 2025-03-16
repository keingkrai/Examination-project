import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import axiosConfig from "../../../config/axiosconfig";
import { MdAdd } from "react-icons/md";
import Modal from "react-modal";
import SearchStudent from "../../../components/SearchStudent";
import { useNavigate } from "react-router";

const Member = () => {
  const room = JSON.parse(localStorage.getItem("All_user_room"));
  const Room_id = room.state.room.Room_id;
  const [teacher, setTeacher] = useState([]);
  const [student, setStudent] = useState([]);
  const [error, setError] = useState("");
  const [searchmodal, setSearchmodal] = useState({
    show: false,
    type: "add",
    data: null,
  });
  const navigate = useNavigate()


  console.log(teacher)
  const fetechteacher = async () => {
    try {
      const res = await axiosConfig.get(`/TeacherinClass/${Room_id}`);
      if (res.data && res.data.user) {
        setTeacher(res.data.user);
      } else {
        setTeacher([]);
      }
    } catch (err) {
      console.error("Error fetching teacher:", err);
    }
  };

  const fetchstudent = async () => {
    try {
      const res = await axiosConfig.get(`/StudentinClass/${Room_id}`);
      if (res.data.success) {
        setStudent(res.data.student);
      }
    } catch (err) {
      console.error("Error fetching teacher:", err);
    }
  };

  const leave = async (user_id) => {
    try {
      const res = await axiosConfig.delete(`/Kick-Student/${user_id}`, {
        params: { room_id: Room_id },
      });

      if (res.data) {
        setStudent(student.filter((s) => s.id !== user_id));
        fetchstudent();
        console.log("delete : ",res);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    Modal.setAppElement("#root");
    fetechteacher();
    fetchstudent();
  }, []);

  return (
    <>
      <div className="flex flex-col h-screen">
        <Navbar userInfo={localStorage.getItem("user_name")} />
        <div className="flex flex-grow">
          <Sidebar />
          <div className="flex-grow p-4 bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Manage Members</h1>

            {/* ตารางเจ้าของ */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Teacher</h2>
              {teacher.length > 0 ? (
                <table className="w-full border-collapse border border-gray-300 text-center">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2">Name</th>
                      <th className="border border-gray-300 px-4 py-2">
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacher.map((i) => (
                      <tr key={i.id}>
                        <td className="border border-gray-300 px-4 py-2">
                          {i.Name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {i.Email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-center mt-4">
                  No teachers found in this room.
                </p>
              )}
            </div>

            {/* ตารางสมาชิก */}
            <div>
              <div className="flex mb-4 justify-between">
                <h2 className="text-xl font-semibold mb-2">Members</h2>
                <button
                  className="w-16 h-8 flex items-center justify-center rounded-2xl bg-green-500 hover:bg-green-600"
                  onClick={() => {
                    setSearchmodal({
                      show: true,
                      type: "add",
                      data: null,
                    });
                  }}
                >
                  <MdAdd className="text-[32px] text-white" />
                </button>
              </div>
              {student.length > 0 ? (
                <table className="w-full border-collapse border border-gray-300 text-center">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2">Name</th>
                      <th className="border border-gray-300 px-4 py-2">
                        Email
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.map((s) => (
                      <tr key={s.id}>
                        <td className="border border-gray-300 px-4 py-2">
                          {s.Name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {s.Email}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <button className="bg-green-500 text-white px-3 py-1 rounded mr-2" onClick={() => {navigate(`../rooms/Analysis`)}}>
                            Analysis
                          </button>
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded"
                            onClick={() => leave(s.id)}
                          >
                            Leave
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-center mt-4">
                  No members found in this room.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={searchmodal.show}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0,2)",
          },
        }}
        className="w-[60%] max-h-9/10 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <SearchStudent
          roomdata={Room_id}
          onClose={() => {
            setSearchmodal({ show: false, type: "add", data: null });
          }}
          felch={fetchstudent}
        />
      </Modal>
    </>
  );
};

export default Member;
