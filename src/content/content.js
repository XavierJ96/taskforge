function addButtonToCard(card, cardTitle, cardType, cardAssignee) {
  const addButton = createAddButton();
  const icon = addButton.querySelector("i");
  const text = addButton.querySelector("span:last-child");

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
  addButton.id = "addBtn"
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

function processCard(child, index) {
  const columnNameElement = child.querySelector("div > h5");

  if (columnNameElement) {
    const columnName = columnNameElement.textContent.trim();

    if (!columnName.includes("Complete")) {
      const cards = child.querySelectorAll("div.MuiPaper-root.MuiCard-root");

      Array.from(cards).forEach((card, cardIndex) => {
        const cardTitleElement = card.querySelector(
          "div.MuiCardContent-root > h2"
        );
        const cardAssigneeElement = card.querySelector(
          "div.MuiCardContent-root > p"
        );

        const cardTitle = cardTitleElement.textContent.trim();
        const cardAssignee = cardAssigneeElement.textContent.trim();

        const cardType = getCardType(card);

        addButtonToCard(card, cardTitle, cardType, cardAssignee);
      });
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

    Array.from(children).forEach((child, index) => {
      processCard(child, index);
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
