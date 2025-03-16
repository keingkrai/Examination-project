import { useState } from "react";
import { Link } from "react-router-dom";
import axiosConfig from "../config/axiosconfig";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // เพิ่ม role สำหรับสมาชิก
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  console.log(role);

  const submit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter email");
      return;
    }

    if (!password) {
      setError("Please enter password");
      return;
    }

    if (!name) {
      setError("Please enter name");
      return;
    }

    if (!role) {
      setError("Please select a role");
      return;
    }

    try {
      const res = await axiosConfig.post("/create-account", {
        Name: name,
        Email: email,
        Password: password,
        role: role,
      });

      if (res) {
        console.log(res.data);
        setError("");
        setSuccess("Create Account Success");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setSuccess("");
        setError(err.response.data.message);
      } else {
        console.error(err);
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <>
      <div className="flex item-center justify-center mt-28">
        <div className="w-96 border rounded bg-white px-7 py-10">
          <form onSubmit={submit}>
            <h4 className="text-2xl text-center mb-7">Signup</h4>

            <input
              type="text"
              placeholder="Name"
              className="input-box"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              className="input-box"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="input-box"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {/* ตัวเลือก Role */}
            <div className="mb-4">
              <label className="text-center block text-sm font-medium text-gray-700 mb-2">
                Select your type:
              </label>
              <div className="flex gap-4 justify-center">
                <label className="flex">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === "student"}
                    onChange={(e) => setRole(e.target.value)}
                    className="mr-2 text-2xl"
                  />
                  Student
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="teacher"
                    checked={role === "teacher"}
                    onChange={(e) => setRole(e.target.value)}
                    className="mr-2 text-2xl"
                  />
                  Teacher
                </label>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}
            {success && <p className="text-green-500 text-xs pb-1">{success}</p>}

            <button type="submit" className="btn-primary">
              Signup
            </button>

            <p className="text-sm text-center mt-4">
              Have Account?{" "}
              <Link to="/Login" className="font-medium text-primary underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
