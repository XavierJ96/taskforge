"use strict";

import { db, auth } from "./utils/firebase_config";
import { addDoc, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "setNotificationCount") {
    chrome.action.setBadgeText({ text: message.count.toString() });
  } else if (message.action === "checkSignInStatus") {
    const authSub = onAuthStateChanged(auth, (user) => {
      const userEmail = user ? user.email : null;
      sendResponse({ userEmail });
    });
  } else if (message.action === "getCurrentUserUid") {
    const authSub = onAuthStateChanged(auth, (user) => {
      const uid = user ? user.uid : null;
      sendResponse({ uid });
    });
  } else if (message.action === "saveTaskToFirebase") {
    const authSub = onAuthStateChanged(auth, (user) => {
      if (user && user !== null) {
        const {
          cardTitle,
          cardType,
          cardAssignee,
          dateAdded,
          isChecked,
          gitLink,
        } = message;
        const tasksCollection = collection(db, "forgedTasks");

        const createTasks = async () => {
          try {
            if (cardType === "project") {
              await addDoc(tasksCollection, {
                cardTitle,
                cardType,
                author: { name: user.email, id: user.uid },
                dateAdded,
                ...(gitLink !== null &&
                  gitLink !== undefined && { gitLink: gitLink }),
              });
            } else {
              await addDoc(tasksCollection, {
                cardTitle,
                cardType,
                cardAssignee,
                author: { name: user.email, id: user.uid },
                dateAdded,
                isChecked,
                ...(gitLink !== null &&
                  gitLink !== undefined && { gitLink: gitLink }),
              });
            }
          } catch (error) {
            console.error("Error saving task to Firebase:", error);
          }
        };

        createTasks();
      } else {
        console.log("User not signed in. Task not created.");
      }
    });
  }
  return true;
});
