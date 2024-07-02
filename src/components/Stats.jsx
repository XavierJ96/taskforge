import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCode, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

function Stats({ projectTasksCount, reviewTasksCount, onClick, view }) {
  return (
    <div id="stat-container" className="flex justify-center mb-4">
      <div
        className={`flex text-[#E4E4E4] gap-2 ${
          view === "project" ? "bg-[#15739c]" : "bg-[#424242]"
        } py-1 px-2 rounded-full font-semibold cursor-pointer`}
        onClick={() => onClick("project")}
      >
        <p>
          <FontAwesomeIcon icon={faFileCode} className="mr-1" />
          Projects
        </p>
        <span id="project-count">{projectTasksCount}</span>
      </div>
      <div
        className={`flex text-[#E4E4E4] gap-2 ${
          view === "review" ? "bg-[#15739c]" : "bg-[#424242]"
        } py-1 px-2 rounded-full font-semibold cursor-pointer`}
        onClick={() => onClick("review")}
      >
        <p>
          <FontAwesomeIcon
            icon={faPenToSquare}
            style={{ color: "#ffffff" }}
            className="my-auto mr-1"
          />
          Reviews
        </p>
        <span id="review-count">{reviewTasksCount}</span>
      </div>
    </div>
  );
}

export default Stats;
