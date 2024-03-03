import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCalendar } from "@fortawesome/free-solid-svg-icons";

function AddTasks() {
  const [taskText, setTaskText] = useState("");
  const [taskDate, setTaskDate] = useState("");

  const handleTextChange = (event) => {
    setTaskText(event.target.value);
  };

  const handleDateChange = (event) => {
    setTaskDate(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const task = {
      text: taskText,
      date: taskDate,
    };
    console.log(task);
    setTaskText("");
    setTaskDate("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute bottom-0 w-full bg-[#161616] min-h-[50px] p-3 flex items-center space-x-3"
    >
      <div className="relative w-full">
        <FontAwesomeIcon
          icon={faPlus}
          className="absolute left-3 top-[50%] -translate-y-[50%] text-white cursor-pointer"
        />
        <input
          type="text"
          className="pl-8 border w-full bg-[#161616] text-white border-gray-300 px-3 py-2 mr-2 rounded-lg"
          value={taskText}
          placeholder="Add Tasks"
          onChange={handleTextChange}
        />
      </div>
      <select
        required
        className="border w-[150px] bg-[#161616] text-white border-gray-300 px-2 py-2 text-[11px] rounded-lg appearance-none custom-select-arrow"
        onChange={handleDateChange}
      >
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
      </select>
    </form>
  );
}

export default AddTasks;
