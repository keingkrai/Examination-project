import React from "react";
import moment from "moment";
import { MdCreate, MdDelete } from "react-icons/md";

const RoomCard = ({
  title,
  date,
  content,
  onEdit,
  onDelete,
  ToRoom,
  room_code,
}) => {
  const color = [
    "bg-gray-50",
    "bg-gray-100",
    "bg-gray-200",
    ,
    "bg-indigo-50",
    "bg-indigo-100",
    "bg-pink-50",
    "bg-pink-100",
    "bg-green-50",
    "bg-green-100",
  ];

  const randomColor = color[Math.floor(Math.random() * color.length)];

  return (
    <div
      className={`border rounded p-4 hover:shadow-xl transition-all ease-in-out ${randomColor}`}
      onDoubleClick={ToRoom}
    >
      <div>
        <div className="flex justify-between">
          <h6 className="font-medium text-xl">{title}</h6>
          <h4 className="font-small text-xs">Code : {room_code}</h4>
        </div>
        <span className="text-xs text-slate-500">
          {moment(date).format("Do MMM YYYY")}
        </span>
      </div>

      <p className="text-base text-slate-600 mt-2">{content?.slice(0, 60)}</p>

      <div className="flex item-center gap-2">
        <MdCreate
          className="icon-btn hover:text-green-600"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        />
        <MdDelete
          className="icon-btn hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        />
      </div>
    </div>
  );
};

export default RoomCard;
