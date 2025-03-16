import React, { useState, useRef } from "react";
import axiosConfig from "../config/axiosconfig";

const EditProfile = ({ cutword, onClose, user }) => {
  const inputRef = useRef(null);
  const [image, setImage] = useState(user.profile_image || ""); // Stores the image file for submission
  const [name, setName] = useState(user.Name || "");
  const [email, setEmail] = useState(user.Email || "");
  const user_id = user.Id || null;
  const [error, setError] = useState(""); // For error handling
  const [currentimg, setCurrentimg] = useState(""); // Stores the preview URL of the image

  console.log(image);

  const handleImageClick = () => {
    inputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file); // Create a preview URL for the image
      setCurrentimg(previewUrl); // Update the preview URL
      setImage(file); // Set the file for uploading
    }
  };

  const handleSave = async () => {
    // Basic form validation
    if (!name || !email) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const formData = new FormData();
    formData.append("image", image); // Submit the file image
    formData.append("user_id", user_id);
    formData.append("name", name);
    formData.append("email", email);

    try {
      const res = await axiosConfig.post("/update_profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.state === "success") {
        onClose();
        window.location.reload();
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="flex flex-wrap items-center bg-white p-6 rounded-2xl shadow-lg w-full max-w-3xl">
      {/* Profile Image (left side - 50%) */}
      <div
        className="relative cursor-pointer w-1/2 p-4 flex justify-center"
        onClick={handleImageClick}
      >
        {/* Show a preview of the image */}
        <img
          src={currentimg || (image ? `http://localhost:3001/images/${user.profile_image}` : "")} // Use preview URL or fallback to original image
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-gray-300 object-cover" // Ensure the width and height are equal to make it a circle
        />
        <div className="absolute bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full text-sm">
          📷
        </div>
        <input
          type="file"
          ref={inputRef}
          onChange={handleImageChange}
          style={{ display: "none" }}
          accept="image/*"
        />
      </div>

      {/* Profile Info (right side - 50%) */}
      <div className="w-1/2 p-4 flex flex-col max-w-sm">
        {/* Name field */}
        <label className="text-gray-600 text-sm mb-1">ชื่อ</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3 p-2 border rounded-md w-full"
        />

        {/* Email field */}
        <label className="text-gray-600 text-sm mb-1">อีเมล</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 p-2 border rounded-md w-full"
        />

        {/* Error message */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Cancel / Save buttons */}
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={onClose}
          >
            ยกเลิก
          </button>
          <button
            className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            onClick={handleSave}
          >
            บันทึกผลลัพธ์
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
