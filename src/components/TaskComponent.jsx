import { useState } from "react";
import { updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase_config";

function TaskCard({ cardTitle, cardAssignee, taskId, isChecked, cardType }) {
  const [localIsChecked, setLocalIsChecked] = useState(isChecked);

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
    <div key={taskId} id="card-container" className={checkedClass}>
      <label className="checkbox">
        <input
          type="checkbox"
          className="checkbox__input"
          checked={localIsChecked}
          onChange={handleCheckboxChange}
        />
        <span className="checkbox__inner"></span>
      </label>
      <div id="list-container">
        <div id="list-header">{cardTitle}</div>
        {cardType === "review" ? (
          <div id="list-assignee">Assignee: {cardAssignee}</div>
        ) : null}
      </div>
      <div id="delete-btn-container">
        <button id="delete-btn" onClick={() => deleteTask(taskId)}>
          <img
            src="/assets/delete-icon.png"
            alt="delete icon"
            id="delete-icon"
          />
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
