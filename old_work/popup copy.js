document.addEventListener("DOMContentLoaded", function () {
  // Retrieve the details from Chrome Storage
  chrome.storage.local.get(["projectTasks", "reviewTasks"], function (result) {
    const projectTasks = result.projectTasks || [];
    const reviewTasks = result.reviewTasks || [];

    // Update the project and review task lists in the popup HTML
    updateTaskList("projectList", projectTasks);
    updateTaskList("reviewList", reviewTasks);
  });
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
      listItem.textContent = task.title;
      listElement.appendChild(listItem);
    });
  }
}