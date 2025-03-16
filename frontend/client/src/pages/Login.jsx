import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosConfig from "../config/axiosconfig";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate()

  const submit = async (e) => {
    //เมื่อกด submit ยังให้คงค่าเดิมที่ใส่ไว้
    e.preventDefault();

    if (!email) {
      setError("Plese enter email");
      return;
    }

    if (!password) {
      setError("Plese enter password");
      return;
    }

    try {
      const res = await axiosConfig.post("/login", {
        Email: email,
        Password: password,
      });

      console.log(res)
      if(res.data && res.data.token) {
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("role",res.data.role)

        console.log(res.data.role)

        if (res.data.role === "teacher"){
          navigate("/Home")
        } else if (res.data.role === "student"){
          navigate("/Home_s")
        } else {
          setError("unkknow role")
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="flex item-center justify-center mt-28">
        <div className="w-96 border rounded bg-white px-7 py-10">
          <form onSubmit={submit}>
            <h4 className="text-2xl mb-7">Login</h4>

            <input
              type="email"
              placeholder="Email"
              className="input-box"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <input
              type="password"
              placeholder="password"
              className="input-box"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}

            <button type="submit" className="btn-primary">
              Login
            </button>

            <p className="text-sm text-center mt-4">
              Not registered ?{" "}
              <Link to="/Signup" className="font-medium text-primary underline">
                Create Account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
