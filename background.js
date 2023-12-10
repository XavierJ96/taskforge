function updateTaskLists(projectTasks, reviewTasks) {
  chrome.storage.local.set({
    projectTasks,
    reviewTasks,
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getTasks") {
    chrome.storage.local.get(["projectTasks", "reviewTasks"], function (result) {
      const projectTasks = result.projectTasks || [];
      const reviewTasks = result.reviewTasks || [];
      sendResponse({ projectTasks, reviewTasks });
    });
    return true;
  }

  if (message.action === "updateTaskList") {
    const { listId, tasks } = message;
    updateTaskLists(listId === "projectList" ? tasks : null, listId === "reviewList" ? tasks : null);
    sendResponse({ action: "tasksUpdated" });
    return true;
  }

  if (message.action === "addTaskToPlanner") {
    const { cardTitle, cardType, cardAssignee } = message;
    chrome.storage.local.get(
      ["projectTasks", "reviewTasks"],
      function (result) {
        let projectTasks = result.projectTasks || [];
        let reviewTasks = result.reviewTasks || [];
        
        if (cardType === "project") {
          projectTasks = [
            ...projectTasks,
            { title: cardTitle, type: cardType, checked: false },
          ];
        } else if (cardType === "review") {
          reviewTasks = [
            ...reviewTasks,
            { title: cardTitle, type: cardType, assignee: cardAssignee, checked: false },
          ];
        }
        
        updateTaskLists(projectTasks, reviewTasks);
    
        sendResponse({ action: "tasksUpdated" });
      }
    );

    return true;
  }
});