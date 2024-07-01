import {
  onSnapshot,
  deleteDoc,
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase_config";

export const setupDates = {
  todayDate: new Date(),
  yesterdayDate: function () {
    const date = new Date(this.todayDate);
    const dayOfWeek = date.getDay();
    const daysToSubtract = dayOfWeek - 1 === 0 ? 3 : 1;
    date.setDate(date.getDate() - daysToSubtract);
    date.setHours(0, 0, 0, 0);
    return date;
  },
  yesterdayDayOfWeek: function () {
    return this.yesterdayDate().getDay();
  },
};

export function getMissedTasks(tasks) {
  const lines = tasks.split("\n");

  const missedIndex = lines.indexOf("Missed:");

  if (missedIndex !== -1) {
    const missedTasks = lines.slice(
      missedIndex + 1,
      lines.indexOf("", missedIndex)
    );

    const missedTasksString = missedTasks.join("\n").trim();

    return missedTasksString;
  }
}

export const dateStrings = {
  todayString: setupDates.todayDate.toDateString(),
  yesterdayString: setupDates.yesterdayDate().toDateString(),
};

export const userTaskRef = (userEmail, db) =>
  query(
    collection(db, "forgedTasks"),
    where("author.name", "==", userEmail),
    where("dateAdded", ">=", setupDates.yesterdayDate().toISOString()),
    orderBy("dateAdded", "desc")
  );

export const learnerDataRef = query(collection(db, "learnerData"));

export const getCountForCardType = (cardType, taskData) => {
  return taskData.filter(
    (task) =>
      task.cardType === cardType &&
      (new Date(task.dateAdded).toDateString() === dateStrings.todayString ||
        new Date(task.dateAdded).toDateString() >= dateStrings.yesterdayString)
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
  let taskQuery;

  try {
    const snapshot = await getDocs(learnerRef);

    for (const doc of snapshot.docs) {
      const techLeadEmail = doc.data().techLead;

      if (techLeadEmail === userEmail) {
        setIsTechLead(true);
      }

      if (techLeadEmail === userEmail) {
        const learnersMap = doc.data().learners;

        taskQuery = query(
          collection(db, "forgedTasks"),
          where("author.name", "in", learnersMap),
          where("dateAdded", ">=", setupDates.yesterdayDate().toISOString())
        );

        if (Array.isArray(learnersMap) && learnersMap.length > 0) {
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
      }
    }

    setLearnerData(tasksByLearner);
  } catch (error) {
    throw new Error("Error fetching learner data:", error);
  }
};

const formatSectionData = (data, option) => {
  return data
    .map((card) => {
      if (option === "missed" || card.isChecked || option === "today") {
        return `${card.cardTitle} ${
          card.cardType === "review" ? `by ${card.cardAssignee}` : ""
        }${card.pushCode || card.openPullRequest ? "-" : ""}${
          card.pushCode ? " GIT Push" : ""
        }${card.pushCode && card.openPullRequest ? " &" : ""}${
          card.openPullRequest ? " Open PR" : ""
        }\n`;
      }
      return "";
    })
    .join("");
};

export const formattedData = (learnerData, isGroup) => {
  let formattedData = "";

  const dateAddedStr = (card) => new Date(card.dateAdded).toDateString();

  const processLearnerData = (data, hasLearnerName) => {
    formattedData += hasLearnerName
      ? `Learner: ${hasLearnerName}\nYesterday:\n`
      : `Yesterday:\n`;

    const filterByDate = (cards, date) => {
      if (date === "yesterday") {
        return cards.filter((card) =>
          setupDates.yesterdayDayOfWeek() === 0
            ? dateAddedStr(card) >= setupDates.yesterdayDate().toDateString() &&
              dateAddedStr(card) !== setupDates.todayDate.toDateString()
            : dateAddedStr(card) === setupDates.yesterdayDate().toDateString()
        );
      } else {
        return cards.filter(
          (card) => dateAddedStr(card) === dateStrings.todayString
        );
      }
    };

    const yesterdayCards = filterByDate(data, "yesterday");

    const filterByCardType = (cards, cardType) =>
      cards.filter((card) => card.cardType === cardType);

    const yesterdayProjectsCards = filterByCardType(yesterdayCards, "project");

    formattedData += formatSectionData(yesterdayProjectsCards);

    formattedData += "\nReviews:\n";

    const yesterdayReviewCards = filterByCardType(yesterdayCards, "review");

    formattedData += formatSectionData(yesterdayReviewCards);
    formattedData += "\nMissed:\n";

    const missedData = data.filter((card) => !card.isChecked);
    const missedCards = filterByDate(missedData, "yesterday");

    formattedData += formatSectionData(missedCards, "missed");

    formattedData += `\nToday:\n`;

    const todayCards = filterByDate(data);

    const todayProjectsCards = filterByCardType(todayCards, "project");

    formattedData += formatSectionData(todayProjectsCards, "today");

    formattedData += "\nReviews:\n";

    const todayReviewCards = filterByCardType(todayCards, "review");

    formattedData += formatSectionData(todayReviewCards, "today");

    formattedData += "\n";
  };

  if (isGroup) {
    for (const learner in learnerData) {
      const data = learnerData[learner];
      const learnerName = learner;
      processLearnerData(data, learnerName);
    }
  } else {
    processLearnerData(learnerData);
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
        throw new Error("Failed to copy to clipboard:", error);
      });
  } catch (error) {
    throw new Error("Error fetching data:", error);
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

export const deleteAllTasks = async (taskData, setTaskData) => {
  try {
    await Promise.all(taskData.map(async (task) => {
      await deleteDoc(doc(collection(db, "forgedTasks"), task.id));
    }));
    setTaskData([]);
  } catch (error) {
    throw new Error(`Error deleting tasks: ${error.message}`);
  }
};