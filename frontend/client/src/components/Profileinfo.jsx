import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import EditProfile from "./EditProfile";
import axiosConfig from "../config/axiosconfig";

const Profileinfo = ({ userInfo, onLogout }) => {
  const [user, setUser] = useState({});
  const [Profile, setProfile] = useState({
    show: false,
    data: null,
  });
  const [error, setError] = useState(null); // Add error handling state

  const pic = user.profile_image || "";
  console.log(pic);
  
  const Cutword = (name) => {
    if (!name) return "";

    const word = name.split(" ");
    let Name = "";

    for (let i = 0; i < Math.min(word.length, 2); i++) {
      Name += word[i][0];
    }

    return Name.toUpperCase();
  };

  const getuser = async () => {
    try {
      const res = await axiosConfig.get("/get-user");
      if (res.data && res.data.user) {
        setUser(res.data.user);
      }
    } catch (error) {

    }
  };

  useEffect(() => {
    Modal.setAppElement("#root");
    getuser();
  }, []);

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="w-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100">
          {/* Display profile image or initials */}
          <button
            onClick={() => {
              setProfile({ show: true, data: null });
            }}
          >
            {pic ? (
              <img src={`http://localhost:3001/images/${pic}`} alt="Profile" className="w-10 h-10 rounded-full" />
            ) : (
              Cutword(userInfo)
            )}
          </button>
        </div>
        <div>
          <p className="text-sm font-medium">{userInfo}</p>
          <button
            className="text-sm text-slate-700 underline"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Display error message if fetching user data failed */}
      {error && <p className="text-red-500">{error}</p>}

      <Modal
        isOpen={Profile.show}
        onRequestClose={() => setProfile({ show: false, data: null })}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel="Edit Profile"
        className="w-full sm:w-[50%] max-h-2/4 bg-white rounded-md mx-auto mt-14 p-5"
        key={Profile.show} // Add a key to force re-render on state change
      >
        <EditProfile
          onClose={() => {
            setProfile({ show: false, data: null });
          }}
          cutword={Cutword(userInfo)}
          user={user}
        />
      </Modal>
    </>
  );
};

export default Profileinfo;
