import React, { useState, useEffect } from "react";

const Custom = ({ students, setCategories, onclose }) => {
  const [groupType, setGroupType] = useState("default");
  const [pendingGroupType, setPendingGroupType] = useState("default");
  const [customCategories, setCustomCategories] = useState([]);

  useEffect(() => {
    if (pendingGroupType === "2") {
      setCustomCategories([
        { name: "Pass", min: 50, max: 100 },
        { name: "Fail", min: 0, max: 49 },
      ]);
    } else if (pendingGroupType === "3") {
      setCustomCategories([
        { name: "High", min: 70, max: 100 },
        { name: "Medium", min: 50, max: 69 },
        { name: "Low", min: 0, max: 49 },
      ]);
    } else if (pendingGroupType === "4") {
      setCustomCategories([
        { name: "76 - 100 Score", min: 76, max: 100 },
        { name: "51 - 75 Score", min: 51, max: 75 },
        { name: "26 - 50 Score", min: 26, max: 50 },
        { name: "0 - 25 Score", min: 0, max: 25 },
      ]);
    } else if (pendingGroupType === "default") {
      setCustomCategories([
        { name: "A", min: 80, max: 100 },
        { name: "B", min: 70, max: 79 },
        { name: "C", min: 60, max: 69 },
        { name: "D", min: 50, max: 59 },
        { name: "F", min: 0, max: 49 },
      ]);
    }
  }, [pendingGroupType]);

  const applyCustomGrouping = () => {
    setGroupType(pendingGroupType);
    let categorizedData = {};
    customCategories.forEach((cat) => {
      categorizedData[cat.name] = [];
    });

    students.forEach((student) => {
      const category = customCategories.find(
        (cat) =>
          student.cosine_answer_answer >= cat.min &&
          student.cosine_answer_answer <= cat.max
      );
      if (category) {
        categorizedData[category.name].push(student);
      }
    });

    setCategories(categorizedData);
    onclose();
  };
  console.log(pendingGroupType);
  console.log(customCategories);

  const getGroupingLabel = () => {
    if (["2", "3", "4", "5"].includes(pendingGroupType)) {
      return `Grouping (${pendingGroupType} Groups)`;
    }
    return "Grouping";
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-m w-full mx-auto">
      <div className=" flex justify-between">
        <h2 className="text-xl font-bold text-center mb-4">Filter</h2>
        <button
          onClick={() => {
            onclose();
          }}
          className="text-black hover:text-red-500"
        >
          Close
        </button>
      </div>

      <div className="flex flex-col items-start gap-4 my-4">
        <button
          className={`p-2 rounded ${
            pendingGroupType === "group"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-400"
          }`}
          onClick={() => setPendingGroupType("group")}
        >
          {getGroupingLabel()}
        </button>

        <button
          className={`p-2 rounded ${
            pendingGroupType === "custom"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-400"
          }`}
          onClick={() => setPendingGroupType("custom")}
        >
          Custom Range
        </button>
      </div>

      {pendingGroupType === "group" && (
        <div className="flex justify-center gap-4 my-2">
          <button
            className={`p-2 rounded ${
              pendingGroupType === "2"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-400"
            }`}
            onClick={() => setPendingGroupType("2")}
          >
            2 Groups
          </button>
          <button
            className={`p-2 rounded ${
              pendingGroupType === "3"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-400"
            }`}
            onClick={() => setPendingGroupType("3")}
          >
            3 Groups
          </button>
          <button
            className={`p-2 rounded ${
              pendingGroupType === "4"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-400"
            }`}
            onClick={() => setPendingGroupType("4")}
          >
            4 Groups
          </button>
          <button
            className={`p-2 rounded ${
              pendingGroupType === "default"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-400"
            }`}
            onClick={() => setPendingGroupType("5")}
          >
            5 Groups
          </button>
        </div>
      )}

      {pendingGroupType === "custom" && (
        <div className="mt-4">
          {customCategories.map((cat, index) => (
            <div
              key={index}
              className="flex justify-center items-center gap-4 mb-2"
            >
              <span className="font-bold w-13 text-center">{cat.name}</span>
              <input
                type="number"
                value={cat.min}
                onChange={(e) => {
                  const updatedCategories = [...customCategories];
                  updatedCategories[index].min = Number(e.target.value);
                  setCustomCategories(updatedCategories);
                }}
                className="border rounded p-1 w-16 text-center"
              />
              <span>-</span>
              <input
                type="number"
                value={cat.max}
                onChange={(e) => {
                  const updatedCategories = [...customCategories];
                  updatedCategories[index].max = Number(e.target.value);
                  setCustomCategories(updatedCategories);
                }}
                className="border rounded p-1 w-16 text-center"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button
          className="p-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition"
          onClick={applyCustomGrouping}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default Custom;
