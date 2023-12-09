document.addEventListener("DOMContentLoaded", function () {
  // Initialize cardCheckedState or retrieve from storage
  chrome.storage.local.get(["cardCheckedState"], function (result) {
    const cardCheckedState = result.cardCheckedState || {};

    chrome.storage.local.get(
      ["projectTasks", "reviewTasks"],
      function (result) {
        const projectTasks = result.projectTasks || [];
        const reviewTasks = result.reviewTasks || [];

        updateTaskList("projectList", projectTasks, cardCheckedState);
        updateTaskList("reviewList", reviewTasks, cardCheckedState);
      }
    );
  });

  const deleteAllTasksButton = document.getElementById("delete-all-btn");
  if (deleteAllTasksButton) {
    deleteAllTasksButton.addEventListener("click", deleteAllTasks);
  }
});

function updateTaskList(listId, tasks, cardCheckedState) {
  const listElement = document.getElementById(listId);

  listElement.innerHTML = "";

  if (tasks.length === 0) {
    const noTasksMessage = document.createElement("li");
    noTasksMessage.textContent = "No tasks available.";
    listElement.appendChild(noTasksMessage);
  } else {
    tasks.forEach((task) => {
      const listItem = createListItem(task);
      const checkbox = listItem.querySelector(".checkbox__input");

      // Set the initial checked state based on storage
      if (cardCheckedState[task.title]) {
        checkbox.checked = true;
        listItem.classList.add("checked");
      }

      checkbox.addEventListener("change", function (event) {
        const container = document.getElementById("card-container");

        if (checkbox.checked) {
          container.classList.add("checked");
        } else {
          container.classList.remove("checked");
        }

        // Save the checked state in storage
        cardCheckedState[task.title] = checkbox.checked;
        chrome.storage.local.set({ cardCheckedState });
      });

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
      updateTaskList("projectList", []);
      updateTaskList("reviewList", []);
    });
  });
}
