import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosConfig from "../config/axiosconfig";
import { MdArrowBack, MdSearch } from "react-icons/md";
import Modal from "react-modal";
import Custom from "./Custom";
import CheckExam from "./CheckExam";

const SumScore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [exam] = useState(JSON.parse(localStorage.getItem("exam")) || {});
  const data = JSON.parse(localStorage.getItem("All_user_room"));
  const [students, setStudents] = useState([]);
  const [teacher, setteacher] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState("ทั้งหมด");
  console.log(selectedQuestion);

  const tabs = [
    { name: "Summary", path: "SumScore" },
    { name: "PerQuestion", path: "PerQuestion" },
  ];

  const [custom, setCustom] = useState({
    show: false,
    data: null,
  });
  const [checkexam, setCheckexam] = useState({
    show: false,
    data: null,
  });
  const room_id = data?.state?.room?.Room_id;
  const exam_id = exam?.exam_id;

  const score_exam = JSON.parse(exam.score).map(Number);
  const sumscore_exam = score_exam.reduce((sum, value) => sum + value, 0);

  //sumscore
  const mapscore = (studentscore) => {
    return studentscore.map((score) => score.model_answer_answer);
  };

  const calculateScores = (score_student) => {
    return score_student.map((studentScores) => {
      const sumscore_student = studentScores.reduce(
        (sum, value) => sum + value,
        0
      );
      console.log(sumscore_student);
      return sumscore_student;
    });
  };

  const [categories, setCategories] = useState({
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
  });

  const categorizeStudent = (students) => {
    const categories = {
      A: [],
      B: [],
      C: [],
      D: [],
      F: [],
    };

    console.log(categories);
    students.forEach((student) => {
      console.log(student);
      const sumscore = student.model_answer_answer.reduce(
        (sum, value) => sum + value,
        0
      );
      console.log(sumscore);
      console.log(sumscore_exam);
      if (sumscore >= sumscore_exam * 0.8) categories.A.push(student);
      else if (sumscore >= sumscore_exam * 0.7) categories.B.push(student);
      else if (sumscore >= sumscore_exam * 0.6) categories.C.push(student);
      else if (sumscore >= sumscore_exam * 0.5) categories.D.push(student);
      else categories.F.push(student);
    });

    return categories;
  };

  const fetchtecher_exam = async () => {
    try {
      const res = await axiosConfig.get(`/get_exam_teacher/${room_id}`, {
        params: { exam_id: exam_id },
      });
      if (res?.data?.state) {
        setteacher(res.data.state);
      }
    } catch (err) {
      console.log(err);
    }
  };

  console.log(students.length);

  const fetch_allstudent = async () => {
    try {
      const res = await axiosConfig.get(`/getsumscore_student/${exam_id}`, {
        params: { room_id: room_id },
      });
      console.log(res);

      if (res?.data?.state) {
        const fetchedStudents = res.data.state;
        console.log(fetchedStudents);
        const score_student = mapscore(fetchedStudents);
        const sumscore_student = calculateScores(score_student);

        const updatedStudents = fetchedStudents.map((student, index) => ({
          ...student,
          sumscore_student: sumscore_student[index],
        }));

        setStudents(updatedStudents);
        setCategories(categorizeStudent(fetchedStudents));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const filteredQuestion = students
  .filter((student) => {
    // กรองนักเรียนที่อยู่ในหมวดหมู่
    return categories[selectedQuestion]?.some((s) => s.Id === student.Id); // เช็คว่า Id ของนักเรียนตรงกับในหมวดหมู่
  })
  .map((student) => {
    if (selectedQuestion === "ทั้งหมด") {
      return {
        ...student,
        name: student.Name,
        score: student.sumscore_student,
      };
    } else {
      return {
        ...student,
        name: student.Name,
        score: student.model_answer_answer[selectedQuestion], // กรองคะแนนจากคำถามที่เลือก
      };
    }
  });



  const StudentCategories = ({ categories, selectedQuestion, students }) => {
    return (
      <div>
        {Object.entries(categories).map(([grade, studentsInGrade]) => {
          const filteredStudents = studentsInGrade.map((student) => {
            console.log(student);
            console.log(selectedQuestion);
            if (selectedQuestion === "ทั้งหมด") {
              return {
                ...student,
                name: student.Name,
                score: student.total_score,
              };
            } else {
              return {
                ...student,
                name: student.Name,
                score: student.model_answer_answer[selectedQuestion], // filter score by selected question
              };
            }
          });
  
          return (
            <GradeSection
              key={grade}
              grade={grade}
              students={studentsInGrade}
              filteredQuestion={filteredStudents} // Pass the filtered students
            />
          );
        })}
      </div>
    );
  };

  const GradeSection = ({ grade, students, filteredQuestion }) => {
    const [isOpen, setIsOpen] = useState(false);
    console.log(students);
    console.log(filteredQuestion);
    return (
      <div className="border p-2 my-2 bg-white rounded shadow">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left font-bold flex justify-between p-2 rounded"
        >
          <span>
            หมวด {grade} ({students.length}) คน
          </span>
          <span>{isOpen ? "▲" : "▼"}</span>
        </button>
        {isOpen && (
          <ul className="p-2">
            {students.length ? (
              filteredQuestion.map((student) => (
                <li key={student.Id} className="flex justify-between p-2">
                  <div className="flex items-center">
                    {student.name} - {student.score} คะแนน
                    <div
                      className={`ml-5 rounded-full ${
                        student.status == "done"
                          ? "bg-green-500 m-3"
                          : "bg-red-500 m-3"
                      } text-white p-1`}
                    >
                      {student.status === "done"
                        ? "ตรวจแล้ว"
                        : "ยังไม่ได้รับการตรวจ"}
                    </div>
                  </div>
                  <button
                    className="bg-green-500 p-2 rounded-md text-white hover:bg-green-600 transition"
                    onClick={() => setCheckexam({ show: true, data: student })}
                  >
                    Check
                  </button>
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-center mt-4">
                No students in this category.
              </p>
            )}
          </ul>
        )}
      </div>
    );
  };
  

  useEffect(() => {
    console.log("Fetching data for exam_id:", exam_id, "room_id:", room_id);
    fetch_allstudent();
    fetchtecher_exam();
  }, [exam_id, room_id]);

  return (
    <>
      <div>
        {students.length > 0 ? (
          <>
            <div className="flex justify-end my-4 gap-4">
              <div>
                <select
                  value={selectedQuestion}
                  onChange={(e) =>
                    setSelectedQuestion(
                      e.target.value === "ทั้งหมด"
                        ? "ทั้งหมด"
                        : Number(e.target.value)
                    )
                  }
                  className="border p-2 rounded-md"
                >
                  {teacher.length > 0 && teacher[0].Exam_Question.length > 0 ? (
                    teacher[0].Exam_Question.map((_, index) => (
                      <option key={index} value={index}>
                        ข้อที่ {index + 1}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading...</option>
                  )}

                  <option value="ทั้งหมด">ทั้งหมด</option>
                </select>
              </div>
              {/*<button
                className="bg-green-500 p-2 rounded-md text-white hover:bg-green-600 transition"
                onClick={() => setCustom({ show: true, data: null })}
              >
                filter
              </button>*/}
            </div>

            <StudentCategories
              categories={categories}
              selectedQuestion={selectedQuestion}
              filteredQuestion={filteredQuestion}
            />
          </>
        ) : (
          <p className="text-gray-500 text-center mt-4">
            No students exam found in this room.
          </p>
        )}
      </div>
      <Modal
        isOpen={custom.show}
        style={{ overlay: { background: "rgba(0,0,0,0.2)" } }}
        className="w-[30%] max-h-[90%] bg-white rounded-md mx-auto mt-14 p-5"
      >
        <Custom
          students={students}
          setCategories={setCategories}
          onclose={() => setCustom({ show: false, data: null })}
        />
      </Modal>

      <Modal
        isOpen={checkexam.show}
        style={{ overlay: { background: "rgba(0,0,0,0.2)" } }}
        className="w-[80%] max-h-[90%] bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        {checkexam.data && (
          <CheckExam
            students={students}
            currentIndex={students.findIndex((s) => s.Id === checkexam.data.Id)}
            exam_id={exam_id}
            onClose={() => setCheckexam({ show: false, data: null })}
            reload={() => {
              fetch_allstudent();
              fetchtecher_exam();
            }}
          />
        )}
      </Modal>
    </>
  );
};

export default SumScore;
