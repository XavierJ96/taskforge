const createListItem = (task) => {
  const listItem = document.createElement("li");

  const assigneeDiv = task.assignee
    ? `<div id="list-assignee">Assignee: ${task.assignee}</div>`
    : "";

  listItem.className = "list-item";
  listItem.innerHTML = `  
  <div id="card-container">
  <div id="list-container">
    <div id="list-header">${task.title}</div>
   ${assigneeDiv}
  </div>
  <div id="delete-btn-container">
    <button id="delete-btn">
      <img src="./src/images/delete-icon.png" alt="delete icon" id="delete-icon" />
    </button>
  </div>
    `;

  return listItem;
};
