import React from "react";
import TaskCard from "./TaskComponent";

function TaskList({ tasks, isVisible }) {
  return (
    <div id="task-list" style={{ display: isVisible ? "block" : "none" }}>
      {tasks.map((task) => (
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
