import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/teacher/Home";
import Exam from "./pages/teacher/rooms/Exam";
import Compare from "./pages/teacher/rooms/Compare";
import Member from "./pages/teacher/rooms/Member";
import Setting from "./pages/teacher/rooms/Setting";
import Home_student from "./pages/student/Home_student";
import Exam_stu from "./pages/student/rooms_stu/Exam_stu";
import Result_stu from "./pages/student/rooms_stu/Result_stu";
import Setting_stu from "./pages/student/rooms_stu/Setting_stu";
import Pre_exam from "./pages/student/Session_Exam/Pre_exam";
import TakeExam from "./pages/student/Session_Exam/TakeExam";
import SeeResult from "./components/See_result";
import Analysis from "./pages/teacher/rooms/Analysis";
import ExamAnalysis from "./components/ExamAnalysis";
import StudentAnalysis from "./components/StudentAnalysis";
import See_result_stu from "./pages/student/rooms_stu/See_result_stu";
import PerQuestion from "./components/PerQuestion";
import SumScore from "./components/SumScore";

const routes = (
  <Router>
    <Routes>
      {/*for teacher*/}
      <Route path="/" element={<Login />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Signup" element={<Signup />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/rooms/Exam" element={<Exam />} />
      <Route path="/rooms/Compare" element={<Compare />}>
      </Route>
      <Route path="/rooms/See_result" element={<SeeResult />}>
        <Route path="SumScore" element={<SumScore />} />
        <Route path="PerQuestion" element={<PerQuestion />} />
      </Route>
      <Route path="/rooms/Analysis" element={<Analysis />}>
        <Route path="ExamAnalysis" element={<ExamAnalysis />} />
        <Route path="StudentAnalysis" element={<StudentAnalysis />} />
      </Route>
      <Route path="/rooms/Member" element={<Member />} />
      <Route path="/rooms/Setting" element={<Setting />} />

      {/*for student*/}
      <Route path="/Home_s" element={<Home_student />} />
      <Route path="/rooms_stu/Exam_stu" element={<Exam_stu />} />
      <Route path="/rooms_stu/Result_stu" element={<Result_stu />} />
      <Route path="/rooms_stu/See_result_stu" element={<See_result_stu />} />
      <Route path="/rooms_stu/Setting_stu" element={<Setting_stu />} />
      <Route path="/Session_Exam/Pre_exam" element={<Pre_exam />} />
      <Route path="/Session_Exam/TakeExam" element={<TakeExam />} />
    </Routes>
  </Router>
);

const App = () => {
  return <div>{routes}</div>;
};

export default App;
