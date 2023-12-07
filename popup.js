document.addEventListener("DOMContentLoaded", function () {
  // Retrieve the details from Chrome Storage
  chrome.storage.local.get(["projectTasks", "reviewTasks"], function (result) {
    const projectTasks = result.projectTasks || [];
    const reviewTasks = result.reviewTasks || [];

    // Update the project and review task lists in the popup HTML
    updateTaskList("projectList", projectTasks);
    updateTaskList("reviewList", reviewTasks);
  });

  // Add click event listener to the "Delete All Tasks" butto
  const deleteAllTasksButton = document.getElementById("deleteAllTasksButton");
  if (deleteAllTasksButton) {
    deleteAllTasksButton.addEventListener("click", deleteAllTasks);
  }
});

function updateTaskList(listId, tasks) {
  const listElement = document.getElementById(listId);

  // Clear existing list items
  listElement.innerHTML = "";

  // Add new list items based on the received tasks
  if (tasks.length === 0) {
    const noTasksMessage = document.createElement("li");
    noTasksMessage.textContent = "No tasks available.";
    listElement.appendChild(noTasksMessage);
  } else {
    tasks.forEach((task) => {
      const listItem = document.createElement("li");

      listItem.textContent = task.type === "review" ? `${task.title} by ${task.assignee}`: task.title;

      // Create a delete button for each task
      const deleteButton = document.createElement("button");
      deleteButton.innerHTML =
        '<img src="svg/delete-icon.svg" alt="Delete Icon">';
      deleteButton.classList.add("deleteButton");
      deleteButton.style.margin = "0 10px"
      deleteButton.addEventListener("click", () => {
        // Handle task deletion
        deleteTask(task);
      });

      // Append the delete button to the list item
      listItem.appendChild(deleteButton);

      // Append the list item to the task list
      listElement.appendChild(listItem);
    });
  }
}

function deleteTask(taskToDelete) {
  // Retrieve the tasks from Chrome Storage
  chrome.storage.local.get(["projectTasks", "reviewTasks"], function (result) {
    let taskIndex;

    if (taskToDelete.type === "project") {
      taskIndex = result.projectTasks.findIndex(
        (projectTask) =>
          projectTask.title === taskToDelete.title &&
          projectTask.type === taskToDelete.type
      );

      if (taskIndex !== -1) {
        result.projectTasks.splice(taskIndex, 1);
      }
    } else if (taskToDelete.type === "review") {
      taskIndex = result.reviewTasks.findIndex(
        (reviewTask) =>
          reviewTask.title === taskToDelete.title &&
          reviewTask.type === taskToDelete.type
      );

      if (taskIndex !== -1) {
        result.reviewTasks.splice(taskIndex, 1);
      }
    }

    chrome.storage.local.set(
      { projectTasks: result.projectTasks, reviewTasks: result.reviewTasks },
      function () {
        // Update the task lists in the popup HTML
        updateTaskList("projectList", result.projectTasks);
        updateTaskList("reviewList", result.reviewTasks);
      }
    );
  });
}

function deleteAllTasks() {
  // Retrieve the tasks from Chrome Storage
  chrome.storage.local.get(["projectTasks", "reviewTasks"], function (result) {
    // Clear all tasks
    result.projectTasks = [];
    result.reviewTasks = [];

    // Update the task lists in local storage
    chrome.storage.local.set(result, function () {
      console.log("All tasks deleted");

      // Update the task lists in the popup HTML
      updateTaskList("projectList", []);
      updateTaskList("reviewList", []);
    });
  });
}
