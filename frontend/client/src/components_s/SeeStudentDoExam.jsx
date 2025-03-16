import React, { useState, useEffect } from "react";
import axiosConfig from "../config/axiosconfig";
import Modal from "react-modal";
import RedoExam from "./RedoExam";

const SeeStudentDoExam = ({ Exam, Room, onClose }) => {
  const [Studentdo, setStudendo] = useState([]);
  const [Studentundo, setStudentundo] = useState([]);
  const [Verifyredo, setVerifyredo] = useState({
    show: false,
    data: null,
  });

  console.log("do :", Studentdo);
  console.log("undo :", Studentundo);

  const exam_id = Exam;
  const room_id = Room;

  const studentdoexam = async () => {
    try {
      const res = await axiosConfig.get(
        `/studentdoexam_undoexam/${exam_id}?room_id=${room_id}`
      );
      setStudendo(res.data.do);
      setStudentundo(res.data.undo);
    } catch (err) {
      console.log(err);
    }
  };

  const redoexam = async (user_id) => {
    try {
      const res = await axiosConfig.delete(`/redoexam/${exam_id}`, {
        params: { user_id: user_id }
      });
      if(res){
        console.log("sdaf;lksajdlk",res)
        setVerifyredo({
          show:false,
          data:null
        })
        studentdoexam()
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    Modal.setAppElement("#root");
    studentdoexam();
  }, []);

  console.log(Studentdo);

  return (
    <>
      <div className="bg-white container mx-auto p-4">
        <div className="flex justify-between">
          <h2 className="text-lg font-bold mb-4">Student Exam Status</h2>
          <h2
            className="text-red-500 text-lg font-bold hover:text-red-700"
            onClick={onClose}
          >
            Close
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-300">
                <th className="border p-2">Students Undo</th>
                <th className="border p-2">Students Done</th>
              </tr>
            </thead>
            <tbody>
              {Math.max(Studentundo.length, Studentdo.length) > 0 ? (
                [...Array(Math.max(Studentundo.length, Studentdo.length))].map(
                  (i, index) => (
                    <tr key={index} className="border">
                      <td className="border p-2 text-center">
                        {Studentundo[index] ? Studentundo[index].Name : ""}
                      </td>
                      <td className="border p-2">
                        <div className="flex justify-around">
                          {Studentdo[index] ? (
                            <>
                              {Studentdo[index].Name}
                              <button
                                className="bg-green-500 rounded p-1 text-white hover:bg-green-600"
                                onClick={() =>
                                  setVerifyredo({
                                    show: true,
                                    data: Studentdo[index].Id,
                                  })
                                }
                              >
                                Redo
                              </button>
                            </>
                          ) : (
                            "  "
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td colSpan="2" className="border p-2 text-center">
                    Don't have who Send Exam
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={Verifyredo.show}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0,2)",
          },
        }}
        className="w-[60%] max-h-3/4 rounded-md mx-auto mt-10"
      >
        <RedoExam
          verify={() => redoexam(Verifyredo.data)}
          onClose={() => {
            setVerifyredo({
              show: false,
              data: null,
            });
          }}
        />
      </Modal>
    </>
  );
};

export default SeeStudentDoExam;
