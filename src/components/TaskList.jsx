import React from "react";
import TaskCard from "./TaskComponent";
import { useState, useEffect } from "react";

function TaskList({ tasks, isVisible, view }) {
  const [filteredTasks, setFilteredTasks] = useState(tasks);

  useEffect(() => {
    if (view !== null) {
      setFilteredTasks(tasks.filter((task) => task.props.cardType === view));
    } else {
      setFilteredTasks(tasks);
    }
  }, [view, tasks]);

  return (
    <div id="task-list" style={{ display: isVisible ? "block" : "none" }}>
      {filteredTasks.map((task) => (
        <TaskCard
          key={task.props.taskId}
          taskId={task.props.taskId}
          cardTitle={task.props.cardTitle}
          cardAssignee={task.props.cardAssignee}
          isChecked={task.props.isChecked}
          cardType={task.props.cardType}
          gitLink={task.props.gitLink}
        />
      ))}
    </div>
  );
}

export default TaskList;
