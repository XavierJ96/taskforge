import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCode, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

function Stats({ projectTasksCount, reviewTasksCount }) {
  return (
    <div id="stat-container" className="flex justify-center mb-4">
      <div className="flex text-[#E4E4E4] gap-2 bg-[#424242] py-1 px-2 rounded-full font-semibold">
        <p className="">
          <FontAwesomeIcon icon={faFileCode} className="mr-1" />
          Projects
        </p>
        <span className="" id="project-count">
          {projectTasksCount}
        </span>
      </div>
      <div className="flex text-[#E4E4E4] gap-2 bg-[#424242] py-1 px-2 rounded-full font-semibold">
        <p className="">
          <FontAwesomeIcon
            icon={faPenToSquare}
            style={{ color: "#ffffff" }}
            className="my-auto mr-1"
          />
          Reviews
        </p>
        <span className="" id="review-count">
          {reviewTasksCount}
        </span>
      </div>
    </div>
  );
}

export default Stats;
