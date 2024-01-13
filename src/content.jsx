"use strict";

import "./styles/index.css";
import "./styles/injectBtnStyles.css";
import { db } from "./utils/firebase_config";
import { collection, onSnapshot } from "firebase/firestore";

function addButtonToCard(card, cardTitle, cardType, cardAssignee, gitLink) {
  const addButton = createAddButton();
  const pushBtn = createActionBtn("pushBtn", "fa-solid fa-code-commit");
  const openBtn = createActionBtn("requestBtn", "fa-solid fa-code-compare");
  const icon = addButton.querySelector("i");
  const text = addButton.querySelector("span:last-child");
  let user;
  const taskRef = collection(db, "forgedTasks");

  chrome.runtime.sendMessage({ action: "getCurrentUserUid" }, (response) => {
    const currentUserUid = response.uid;
    const unsub = onSnapshot(taskRef, (snapshot) => {
      let isTaskAdded = false;
      let gitPushed = false;
      let openPr = false;

      snapshot.docs.forEach((doc) => {
        let docTitle = doc.data().cardTitle;
        let docAssignee = doc.data().cardAssignee;

        if (
          doc.data().author?.id === currentUserUid &&
          docTitle === cardTitle &&
          (docAssignee === cardAssignee || doc.data().cardType !== "review")
        ) {
          let docDate = new Date(doc.data().dateAdded);
          let today = new Date();

          if (docDate.toDateString() === today.toDateString()) {
            isTaskAdded = true;
          }

          if (
            docDate.toDateString() === today.toDateString() &&
            doc.data().pushCode
          ) {
            gitPushed = true;
          }
          if (
            docDate.toDateString() === today.toDateString() &&
            doc.data().openPullRequest
          ) {
            openPr = true;
          }
        }
      });

      chrome.runtime.sendMessage(
        { action: "checkSignInStatus" },
        (response) => {
          user = response.user;
          if (response.user.userEmail === null) {
            addButton.disabled = true;
            text.innerText = "Add to Planner";
            icon.classList.remove("fa-check");
            icon.classList.add("fa-plus");
            return;
          }
        }
      );

      if (isTaskAdded) {
        toggleIconAndText(icon, text, true);
        addButton.disabled = true;
        pushBtn.disabled = true;
        openBtn.disabled = true;
        text.innerText = "Added";
        icon.classList.remove("fa-plus");
        icon.classList.add("fa-check");
        gitPushed
          ? (pushBtn.style.backgroundColor = "lightgreen")
          : (pushBtn.style.backgroundColor = "");
        openPr
          ? (openBtn.style.backgroundColor = "lightgreen")
          : (openBtn.style.backgroundColor = "");
      } else {
        toggleIconAndText(icon, text, false);
        gitPushed
          ? (pushBtn.style.backgroundColor = "lightgreen")
          : (pushBtn.style.backgroundColor = "");
        openPr
          ? (openBtn.style.backgroundColor = "lightgreen")
          : (openBtn.style.backgroundColor = "");
        addButton.disabled = false;
        pushBtn.disabled = false;
        openBtn.disabled = false;
        text.innerText = "Add to Planner";
        icon.classList.remove("fa-check");
        icon.classList.add("fa-plus");
      }
    });
  });

  addButton.addEventListener("click", () => {
    if (addButton.disabled) {
      return;
    }

    chrome.runtime.sendMessage({
      action: "saveTaskToFirebase",
      user: user,
      cardTitle: cardTitle,
      cardType: cardType,
      dateAdded: new Date(),
      isChecked: false,
      ...(cardType === "review" && { cardAssignee: cardAssignee }),
      ...(gitLink && { gitLink: gitLink }),
      pushCode: pushBtn.style.backgroundColor === "lightgreen" ? true : false,
      openPullRequest:
        openBtn.style.backgroundColor === "lightgreen" ? true : false,
    });

    toggleIconAndText(icon, text, true);
    animateButton(addButton, icon, text);
  });

  card.appendChild(addButton);

  if (cardType !== "review") {
    card.appendChild(pushBtn);
    card.appendChild(openBtn);
  }
}

function toggleIconAndText(icon, text, added) {
  if (added) {
    icon.classList.remove("fa-plus");
    icon.classList.add("fa-check");
    text.innerText = "Added";
  } else {
    icon.classList.add("fa-plus");
    icon.classList.remove("fa-check");
    text.innerText = "Add to Planner";
  }
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

    setTimeout(() => {
      button.disabled = true;
    }, 500);
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

function createActionBtn(id, iconClass) {
  const button = document.createElement("button");
  button.id = id;
  button.classList.add("MuiChip-root", "jss367");

  const span = document.createElement("span");
  const icon = document.createElement("i");
  icon.className = iconClass;
  span.appendChild(icon);
  button.appendChild(span);

  button.addEventListener("click", () => {
    button.style.backgroundColor =
      button.style.backgroundColor === "" ? "lightgreen" : "";
  });

  return button;
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

        const gitLink = getLink(card);

        const cardTitle = cardTitleElement.textContent.trim();
        const cardAssignee = cardAssigneeElement.textContent.trim();

        const cardType = getCardType(card);

        if (gitLink !== null && gitLink !== undefined) {
          addButtonToCard(card, cardTitle, cardType, cardAssignee, gitLink);
        } else {
          addButtonToCard(card, cardTitle, cardType, cardAssignee);
        }
      }
    }
  } else {
    console.warn(`Column name not found for child ${index + 1}`);
  }
}

async function getCardData() {
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

function getLink(card) {
  const linkElement = card.querySelector(
    "div.MuiCardContent-root > div.jss364 > a"
  );

  if (linkElement) {
    return linkElement.getAttribute("href");
  }

  return null;
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
