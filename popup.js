document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get(["projectTasks", "reviewTasks"], function (result) {
    const projectTasks = result.projectTasks || [];
    const reviewTasks = result.reviewTasks || [];

    updateTaskList("projectList", projectTasks);
    updateTaskList("reviewList", reviewTasks);
  });

  const deleteAllTasksButton = document.getElementById("delete-all-btn");
  if (deleteAllTasksButton) {
    deleteAllTasksButton.addEventListener("click", deleteAllTasks);
  }
});

function updateTaskList(listId, tasks) {
  const listElement = document.getElementById(listId);

  listElement.innerHTML = "";

  if (tasks.length === 0) {
    const noTasksMessage = document.createElement("li");
    noTasksMessage.textContent = "No tasks available.";
    listElement.appendChild(noTasksMessage);
  } else {
    tasks.forEach((task) => {
      const listItem = createListItem(task);

      listItem.querySelector("#delete-btn").addEventListener("click", () => {
        deleteTask(task);
      });

      listElement.appendChild(listItem);
    });
  }
}

function deleteTask(taskToDelete) {
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
        updateTaskList("projectList", result.projectTasks);
        updateTaskList("reviewList", result.reviewTasks);
      }
    );
  });
}

function deleteAllTasks() {
  chrome.storage.local.get(["projectTasks", "reviewTasks"], function (result) {
    result.projectTasks = [];
    result.reviewTasks = [];

    chrome.storage.local.set(result, function () {
      console.log("All tasks deleted");

      updateTaskList("projectList", []);
      updateTaskList("reviewList", []);
    });
  });
}
