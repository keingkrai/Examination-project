import React from "react";

const RedoExam = ({ verify, onClose }) => {
    console.log()
  return (
    <div className="bg-white text-center">
      <h1 className="text-lg font-bold">Are you sure?</h1>
      <p>if you redo Original Data can't use</p>
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

export default RedoExam;
