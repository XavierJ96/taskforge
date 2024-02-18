"use strict";

import "./styles/index.css";
import "./styles/injectBtnStyles.css";
import { db } from "./utils/firebase_config";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

let taskArr;

chrome.runtime.sendMessage({ action: "checkSignInStatus" }, (response) => {
  let uid = response.user.uid;
  const today = new Date();
  const yesterday = new Date(today);
  const dayOfWeek = yesterday.getDay();

  if (dayOfWeek === 0) {
    yesterday.setDate(today.getDate() - 2);
  } else {
    yesterday.setDate(today.getDate() - 1);
  }

  yesterday.setHours(0, 0, 0, 0);
  
  const taskRef = query(
    collection(db, "forgedTasks"),
    where("author.id", "==", uid),
    where("dateAdded", ">", yesterday.toISOString()),
    orderBy("dateAdded", "desc")
  );

  const unsub = onSnapshot(taskRef, (snapshot) => {
    taskArr = snapshot.docs;
    chrome.runtime.sendMessage({
      action: "setNotificationCount",
      count: taskArr.length,
    });
    updateButtonState();
  });
  
  () => unsub()
});

function updateButtonState() {
  const cards = document.querySelectorAll("div.MuiPaper-root.MuiCard-root");
  cards.forEach((card) => {
    const cardTitleElement = card.querySelector("div.MuiCardContent-root > h2");
    const cardAssigneeElement = card.querySelector(
      "div.MuiCardContent-root > p"
    );
    const cardAssignee = cardAssigneeElement.textContent.trim();
    const cardTitle = cardTitleElement.textContent.trim();

    const addButton = card.querySelector("#addBtn");
    if (addButton !== null) {
      const isTaskAdded = isTaskAlreadyAdded(cardTitle, cardAssignee);
      const pushBtn = card.querySelector("#pushBtn");
      const openBtn = card.querySelector("#requestBtn");
      const icon = addButton.querySelector("i");
      const text = addButton.querySelector("span:last-child");

      if (isTaskAdded) {
        toggleIconAndText(icon, text, true);
        addButton.disabled = true;
        if (pushBtn) pushBtn.disabled = true;
        if (openBtn) openBtn.disabled = true;
      } else {
        toggleIconAndText(icon, text, false);
        addButton.disabled = false;
        if (pushBtn) pushBtn.disabled = false;
        if (pushBtn) pushBtn.style.backgroundColor = "";
        if (openBtn) openBtn.disabled = false;
        if (openBtn) openBtn.style.backgroundColor = "";
      }
    }
  });
}

function isTaskAlreadyAdded(cardTitle, cardAssignee) {
  return taskArr.some((doc) => {
    const docTitle = doc.data().cardTitle;
    const docAssignee = doc.data().cardAssignee;
    return (
      docTitle === cardTitle &&
      (docAssignee === cardAssignee || doc.data().cardType !== "review")
    );
  });
}

function addButtonToCard(card, cardTitle, cardType, cardAssignee, gitLink) {
  const addButton = createAddButton();
  const pushBtn = createActionBtn("pushBtn", "fa-solid fa-code-commit");
  const openBtn = createActionBtn("requestBtn", "fa-solid fa-code-compare");
  const icon = addButton.querySelector("i");
  const text = addButton.querySelector("span:last-child");
  let user;

  chrome.runtime.sendMessage({ action: "checkSignInStatus" }, (response) => {
    const currentUserUid = response.user.uid;
    user = response.user;
    let isTaskAdded = false;
    let gitPushed = false;
    let openPr = false;

    taskArr.forEach((doc) => {
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

    if (
      response.user !== null &&
      response.user !== undefined &&
      response.user.userEmail
    ) {
      addButton.disabled = true;
      text.innerText = "Add to Planner";
      icon.classList.remove("fa-check");
      icon.classList.add("fa-plus");
      return;
    }

    if (isTaskAdded) {
      toggleIconAndText(icon, text, true);
      addButton.disabled = true;
      pushBtn.disabled = true;
      openBtn.disabled = true;
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
    }
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

function processCard(child, index) {
  const columnNameElement = child.querySelector("div > h5");

  if (columnNameElement) {
    const columnName = columnNameElement.textContent.trim();

    if (!columnName.includes("Complete")) {
      const cards = child.querySelectorAll("div.MuiPaper-root.MuiCard-root");

      for (const card of cards) {
        if (!card.querySelector("#addBtn")) {
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
    }
  } else {
    console.warn(`Column name not found for child ${index + 1}`);
  }
}

function checkLoad(child) {
  const columnNameElement = child.querySelector("div > h5");

  const span = document.createElement("span");
  const icon = document.createElement("i");

  icon.className = "ml-3 fa-solid fa-rotate-right";
  span.appendChild(icon);
  icon.style.cursor = "pointer";

  if (!columnNameElement.querySelector(".fa-rotate-right")) {
    columnNameElement.append(icon);
    icon.addEventListener("click", () => {
      getCardData();

      icon.classList.add("rotate-animation");

      setTimeout(() => {
        icon.classList.remove("rotate-animation");
      }, 1000);
    });
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
      checkLoad(child);
    });
  } else {
    return null;
  }
}

setTimeout(function () {
  getCardData();
}, 10000);
