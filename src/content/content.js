function addButtonToCard(card, cardTitle, cardType, cardAssignee) {
  const addButton = createAddButton();
  const icon = addButton.querySelector("i");
  const text = addButton.querySelector("span:last-child");

  function updateButtonState() {
    chrome.runtime.sendMessage({ action: "getTasks" }, function (response) {
      const storedTasks =
        cardType === "project" ? response.projectTasks : response.reviewTasks;
      const isTaskAdded = storedTasks.some((task) => {
        return (
          task.title === cardTitle &&
          (task.assignee === cardAssignee || task.type !== "review")
        );
      });

      if (isTaskAdded) {
        addButton.disabled = true;
        text.innerText = "Added";
        icon.classList.remove("fa-plus");
        icon.classList.add("fa-check");
      } else {
        addButton.disabled = false;
        text.innerText = "Add to Planner";
        icon.classList.remove("fa-check");
        icon.classList.add("fa-plus");
      }
    });
  }

  updateButtonState();

  addButton.addEventListener("click", () => {
    if (addButton.disabled) {
      return;
    }

    chrome.runtime.sendMessage({
      action: "addTaskToPlanner",
      cardTitle: cardTitle,
      cardType: cardType,
      ...(cardType === "review" && { cardAssignee: cardAssignee }),
    });

    toggleIconAndText(icon, text);
    animateButton(addButton, icon, text);
  });

  card.appendChild(addButton);

  chrome.storage.onChanged.addListener(function (changes) {
    if ("projectTasks" in changes || "reviewTasks" in changes) {
      updateButtonState();
    }
  });
}

function toggleIconAndText(icon, text) {
  icon.classList.toggle("fa-plus");
  icon.classList.toggle("fa-check");
  text.innerText = icon.classList.contains("fa-plus")
    ? "Add to Planner"
    : "Added";
}

function animateButton(button, icon, text) {
  icon.classList.add("rotate");
  text.classList.add("fade-in");
  button.disabled = true;

  setTimeout(() => {
    text.classList.remove("fade-in");
  }, 1000);

  setTimeout(() => {
    icon.classList.remove("rotate");
    button.disabled = false;
  }, 1000);
}

function createAddButton() {
  const addButton = document.createElement("button");
  addButton.id = "addBtn";
  addButton.classList.add("MuiChip-root", "jss367");

  const span = document.createElement("span");
  const icon = document.createElement("i");
  const text = document.createElement("span");

  icon.className = "fa-solid fa-plus";
  span.appendChild(icon);
  text.innerText = "Add to Planner";

  addButton.appendChild(span);
  addButton.appendChild(text);

  return addButton;
}

async function processCard(child, index) {
  const columnNameElement = child.querySelector("div > h5");

  if (columnNameElement) {
    const columnName = columnNameElement.textContent.trim();

    if (!columnName.includes("Complete")) {
      const cards = child.querySelectorAll("div.MuiPaper-root.MuiCard-root");

      for (const card of cards) {
        const cardTitleElement = card.querySelector(
          "div.MuiCardContent-root > h2"
        );
        const cardAssigneeElement = card.querySelector(
          "div.MuiCardContent-root > p"
        );

        const cardTitle = cardTitleElement.textContent.trim();
        const cardAssignee = cardAssigneeElement.textContent.trim();

        const cardType = getCardType(card);

        await addButtonToCard(card, cardTitle, cardType, cardAssignee);
      }
    }
  } else {
    console.warn(`Column name not found for child ${index + 1}`);
  }
}

function getCardData() {
  const parentElement = document.querySelector(
    "#root > div > main > div.jss12 > div.MuiGrid-root.MuiGrid-container.MuiGrid-wrap-xs-nowrap"
  );

  if (parentElement) {
    const children = parentElement.children;

    Array.from(children).forEach(async (child, index) => {
      await processCard(child, index);
    });
  } else {
    return null;
  }
}

function getCardType(cardElement) {
  const backgroundColor = window
    .getComputedStyle(cardElement)
    .getPropertyValue("background-color");

  if (
    backgroundColor === "rgb(187, 222, 251)" ||
    backgroundColor === "rgb(238, 238, 238)"
  ) {
    return "project";
  } else if (backgroundColor === "rgb(255, 224, 178)") {
    return "review";
  } else {
    return "unknown";
  }
}

setTimeout(function () {
  getCardData();
}, 10000);
