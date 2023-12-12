const createListItem = (task) => {
  const listItem = document.createElement("li");

  const assigneeDiv = task.assignee
    ? `<div id="list-assignee">Assignee: ${task.assignee}</div>`
    : "";

  const checkedClass = task.checked ? "checked" : "";

  listItem.className = `list-item`;
  listItem.innerHTML = `  
  <div id="card-container" class="${checkedClass}">
    <label class="checkbox">
      <input type="checkbox" class="checkbox__input" ${task.checked ? "checked" : ""} />
      <span class="checkbox__inner"></span>
    </label>
    <div id="list-container">
      <div id="list-header">${task.title}</div>
      ${assigneeDiv}
    </div>
    <div id="delete-btn-container">
      <button id="delete-btn">
        <img src="../assets/delete-icon.png" alt="delete icon" id="delete-icon" />
      </button>
    </div>
  </div>`;

  return listItem;
};