function addButtonToCard(card, cardTitle, cardType, cardAssignee) {
  const addButton = document.createElement("button");
  addButton.classList.add("MuiChip-root", "jss367");
  addButton.style.padding = "5px 10px";
  addButton.style.margin = "10px";
  addButton.style.cursor = "pointer";
  addButton.textContent = "➕ Add to Planner";

  addButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      action: "addTaskToPlanner",
      cardTitle: cardTitle,
      cardType: cardType,
      ...(cardType === "review" && { cardAssignee: cardAssignee }),
    });
  });

  card.appendChild(addButton);
}

// Function to process each card and its details
function processCard(child, index) {
  const columnNameElement = child.querySelector("div > h5");

  if (columnNameElement) {
    const columnName = columnNameElement.textContent.trim();

    if (!columnName.includes("Complete")) {
      const cards = child.querySelectorAll("div.MuiPaper-root.MuiCard-root");

      Array.from(cards).forEach((card, cardIndex) => {
        const cardTitleElement = card.querySelector("div.MuiCardContent-root > h2");
        const cardAssigneeElement = card.querySelector("div.MuiCardContent-root > p");

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

// Main function to get card data
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
