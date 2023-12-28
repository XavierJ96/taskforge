import {
  onSnapshot,
  deleteDoc,
  collection,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase_config";

export const getCountForCardType = (cardType, taskData, today, yesterday) => {
  return taskData.filter(
    (task) =>
      task.cardType === cardType &&
      (new Date(task.dateAdded).toDateString() === today.toDateString() ||
        new Date(task.dateAdded).toDateString() === yesterday.toDateString())
  ).length;
};

export const togglePopup = (isPopupVisible, setIsPopupVisible) => {
  setIsPopupVisible(!isPopupVisible);
};

export const fetchTasks = (taskRef, userEmail, setTaskData) => {
  const unsubscribe = onSnapshot(taskRef, (snapshot) => {
    const tasks = [];

    snapshot.forEach((doc) => {
      const author = doc.data().author.name;

      if (author === userEmail) {
        tasks.push({
          id: doc.id,
          ...doc.data(),
        });
      }
    });

    setTaskData(tasks);
  });

  return () => unsubscribe();
};

export const fetchLearnerData = async (
  learnerRef,
  userEmail,
  setIsTechLead,
  setLearnerData
) => {
  const tasksByLearner = {};
  const unsub = onSnapshot(learnerRef, async (snapshot) => {
    snapshot.forEach(async (doc) => {
      if (doc.data().techLead === userEmail) {
        setIsTechLead(true);
      }
      const learnersMap = doc.data().learners;

      if (Array.isArray(learnersMap) && learnersMap.length > 0) {
        const taskQuery = query(
          collection(db, "forgedTasks"),
          where("author.name", "in", learnersMap)
        );

        const taskSnapshot = await getDocs(taskQuery);

        taskSnapshot.forEach((taskDoc) => {
          const learnerName = taskDoc.data().author.name;

          if (!tasksByLearner[learnerName]) {
            tasksByLearner[learnerName] = [];
          }
          tasksByLearner[learnerName].push({
            ...taskDoc.data(),
          });
        });
      }
    });

    setLearnerData(tasksByLearner);
  });

  return () => unsub();
};

export const formattedData = (learnerData) => {
  let formattedData = "";

  for (const learner in learnerData) {
    formattedData += `Learner: ${learner}\nToday:\n`;

    const todayCards = learnerData[learner].filter(
      (card) =>
        new Date(card.dateAdded).toDateString() === new Date().toDateString()
    );

    todayCards.forEach((card) => {
      formattedData += ` ${card.cardTitle} ${
        card.cardType === "review" ? `by ${card.cardAssignee}` : ""
      }\n`;
    });

    formattedData += "\nYesterday:\n";

    const yesterdayCards = learnerData[learner].filter(
      (card) =>
        new Date(card.dateAdded).toDateString() ===
        new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()
    );

    yesterdayCards.forEach((card) => {
      formattedData += ` ${card.cardTitle} ${
        card.cardType === "review" ? `by ${card.cardAssignee}` : ""
      }\n`;
    });

    formattedData += "\n";
  }

  return formattedData.trim();
};

export const copyToClipboard = (data) => {
  try {
    navigator.clipboard
      .writeText(data)
      .then(() => {
        alert("Formatted data copied to clipboard!");
      })
      .catch((error) => {
        console.error("Failed to copy to clipboard:", error);
      });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const setNotificationCount = (count) => {
  chrome.runtime.sendMessage({
    action: "setNotificationCount",
    count: count,
  });
};

export const logoutUser = async () => {
  setNotificationCount(0);
  await signOut(auth);
};

export const deleteAllTasks = (taskData, taskRef, setTaskData) => {
  try {
    taskData.forEach(async (task) => {
      await deleteDoc(doc(taskRef, task.id));
    });

    setTaskData([]);
  } catch (error) {
    console.error("Error deleting tasks:", error);
  }
};
