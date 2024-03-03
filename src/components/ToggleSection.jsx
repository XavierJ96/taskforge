import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleRight } from "@fortawesome/free-solid-svg-icons";

function ToggleSection({ isVisible, onClick, label, taskCount }) {
  return (
    <div className="toggle-section">
      <div className="text-[#E4E4E4] flex space-x-2 items-center">
        <FontAwesomeIcon
          icon={isVisible ? faAngleDown : faAngleRight}
          className="my-auto w-6 h-6 hover:cursor-pointer hover:text-[#007bff] active:scale-75"
          onClick={onClick}
        />
        <p className="text-lg font-semibold font-[Montserrat]">{label}</p>
        <div
          style={{ display: isVisible ? "none" : "flex" }}
          className=" text-[#E4E4E4] items-center justify-center rounded-full bg-[#424242] min-w-[22px] h-[22px]"
        >
          <span className="">{taskCount}</span>
        </div>
      </div>
    </div>
  );
}

export default ToggleSection;
