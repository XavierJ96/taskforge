import { useState } from "react";
import { updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../utils/firebase_config";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function TaskCard({ cardTitle, cardAssignee, taskId, isChecked, cardType }) {
  const [localIsChecked, setLocalIsChecked] = useState(isChecked);
  const [isDivVisible, setIsDivVisible] = useState(false);

  const handleMouseOver = () => {
    setIsDivVisible(true);
  };

  const handleMouseOut = () => {
    setIsDivVisible(false);
  };

  const handleCheckboxChange = async () => {
    setLocalIsChecked(!localIsChecked);

    const taskDocRef = doc(db, "forgedTasks", taskId);
    await updateDoc(taskDocRef, { isChecked: !localIsChecked });
  };

  async function deleteTask(taskId) {
    await deleteDoc(doc(db, "forgedTasks", taskId));
  }

  let checkedClass = localIsChecked ? "checked" : "";

  return (
    <div
      key={taskId}
      id="card-container"
      className={checkedClass}
      onMouseEnter={handleMouseOver}
      onMouseLeave={handleMouseOut}
    >
      <label className="checkbox">
        <input
          type="checkbox"
          name="task-checked"
          className="checkbox__input"
          checked={localIsChecked}
          onChange={handleCheckboxChange}
        />
        <span className="checkbox__inner"></span>
      </label>
      <div
        id="list-container"
        className="w-full justify-items-center text-[#E4E4E4]"
      >
        <div id="list-header" className="flex">
          <div
            id="card-title"
            className="whitespace-nowrap overflow-hidden overflow-ellipsis"
            style={{ width: isDivVisible ? "260px" : "100%" }}
          >
            {cardTitle}
          </div>
          <div
            id="delete-btn-container"
            className="bg-inherit ml-auto max-w-[50px] justify-end space-x-1"
            style={{ display: isDivVisible ? "flex" : "none" }}
          >
            <button id="delete-btn" onClick={() => deleteTask(taskId)}>
              <FontAwesomeIcon
                icon={faTrash}
                className="my-auto text-[#8e8e92] mr-1 w-4 h-4 hover:text-red-600"
              />
            </button>
            <button>
              <FontAwesomeIcon
                icon={faGithub}
                className="my-auto w-4 h-4 hover:text-[#007bff]"
              />
            </button>
          </div>
        </div>
        {cardType === "review" ? (
          <div id="list-assignee">Assignee: {cardAssignee}</div>
        ) : null}
      </div>
    </div>
  );
}

export default TaskCard;
