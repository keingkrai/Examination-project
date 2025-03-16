import React from "react";

const VerifyExam = ({ verify, onClose }) => {

  const getaction = async () => {

  };
  return (
    <div className="bg-white text-center">
      Verify Send Exam
      <div className="flex justify-around mt-5 p-5">
        <button
          className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
          onClick={verify}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default VerifyExam;
