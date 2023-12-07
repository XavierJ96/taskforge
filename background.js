// Function to update task lists in local storage
function updateTaskLists(projectTasks, reviewTasks) {
  chrome.storage.local.set({
    projectTasks,
    reviewTasks,
  });
}

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "addTaskToPlanner") {
    const { cardTitle, cardType, cardAssignee } = message;

    console.log(
      `Received message: Add '${cardTitle}' to '${cardType}' in the planner by ${cardAssignee}`
    );

    chrome.storage.local.get(
      ["projectTasks", "reviewTasks"],
      function (result) {
        let projectTasks = result.projectTasks || [];
        let reviewTasks = result.reviewTasks || [];

        if (cardType === "project") {
          projectTasks = [
            ...projectTasks,
            { title: cardTitle, type: cardType },
          ];
        } else if (cardType === "review") {
          reviewTasks = [
            ...reviewTasks,
            { title: cardTitle, type: cardType, assignee: cardAssignee },
          ];
        }

        // Update the task lists in local storage
        updateTaskLists(projectTasks, reviewTasks);

        // Notify the popup.js that tasks are updated
        sendResponse({ action: "tasksUpdated" });
      }
    );

    // Ensure the sendResponse callback is asynchronous
    return true;
  }
});
