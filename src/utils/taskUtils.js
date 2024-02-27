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

const todayDate = new Date();

export const getCountForCardType = (cardType, taskData, today, yesterday) => {
  return taskData.filter(
    (task) =>
      task.cardType === cardType &&
      (new Date(task.dateAdded).toDateString() === today.toDateString() ||
        new Date(task.dateAdded).toDateString() >= yesterday.toDateString())
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
  setLearnerData,
  setIsTechCoach,
  yesterdayDate
) => {
  const tasksByLearner = {};
  let taskQuery;

  try {
    const snapshot = await getDocs(learnerRef);

    for (const doc of snapshot.docs) {
      const techLeadEmail = doc.data().techLead;
      const techCoachEmail = doc.data().techCoach;

      if (techLeadEmail === userEmail) {
        setIsTechLead(true);
      }

      if (techCoachEmail === userEmail) {
        setIsTechCoach(true);
      }

      if (techLeadEmail === userEmail || techCoachEmail === userEmail) {
        const learnersMap = doc.data().learners;
        const nineDaysAgo = new Date(todayDate);
        nineDaysAgo.setDate(nineDaysAgo.getDate() - 9);

        const nineDaysAgoTimestamp = nineDaysAgo.toISOString();

        techCoachEmail !== userEmail
          ? (taskQuery = query(
              collection(db, "forgedTasks"),
              where("author.name", "in", learnersMap),
              where("dateAdded", ">=", yesterdayDate.toISOString())
            ))
          : (taskQuery = query(
              collection(db, "forgedTasks"),
              where("author.name", "in", learnersMap),
              where("dateAdded", ">", nineDaysAgoTimestamp)
            ));

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
    console.error("Error fetching learner data:", error);
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

export const formattedData = (learnerData, isGroup) => {
  let formattedData = "";

  const dateAddedStr = (card) => new Date(card.dateAdded).toDateString();

  const processLearnerData = (data, hasLearnerName) => {
    formattedData += hasLearnerName
      ? `Learner: ${hasLearnerName}\nYesterday:\n`
      : `Yesterday:\n`;

    const filterByDate = (cards, date) => {
      if (date === "yesterday") {
        return cards.filter(
          (card) => dateAddedStr(card) < new Date().toDateString()
        );
      } else {
        return cards.filter(
          (card) => dateAddedStr(card) === new Date().toDateString()
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

export const formatWeeklyReport = (learnerData) => {
  let formattedData = "";

  const processLearnerData = (data, hasLearnerName) => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - i);
      const currentDay = daysOfWeek[currentDate.getDay()];

      let startDate = new Date(currentDate);
      let endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      formattedData += hasLearnerName
        ? `Learner: ${hasLearnerName}\n${currentDay} (${
            startDate.toISOString().split("T")[0]
          }):\n`
        : `${currentDay} (${startDate.toISOString().split("T")[0]}):\n`;

      const filterByDateRange = (cards, startDate, endDate) =>
        cards.filter(
          (card) =>
            new Date(card.dateAdded).toISOString().split("T")[0] ===
            startDate.toISOString().split("T")[0]
        );

      const dayCards = filterByDateRange(data, startDate, endDate);

      const filterByCardType = (cards, cardType) =>
        cards.filter((card) => card.cardType === cardType);

      const dayProjectsCards = filterByCardType(dayCards, "project");

      formattedData += formatSectionData(dayProjectsCards, "day");

      formattedData += "\nReviews:\n";

      const dayReviewCards = filterByCardType(dayCards, "review");

      formattedData += formatSectionData(dayReviewCards, "day");
      formattedData += "\nMissed:\n";

      const missedCards = dayCards.filter((card) => !card.isChecked);

      formattedData += formatSectionData(missedCards, "missed");

      formattedData += "\n";
    }
  };

  for (const learner in learnerData) {
    const data = learnerData[learner];
    const learnerName = learner;
    processLearnerData(data, learnerName);
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
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  try {
    taskData.forEach(async (task) => {
      if (
        new Date(task.dateAdded).toDateString() === today.toDateString() ||
        new Date(task.dateAdded).toDateString() === yesterday.toDateString()
      ) {
        await deleteDoc(doc(collection(db, "forgedTasks"), task.id));
      }
    });

    setTaskData([]);
  } catch (error) {
    console.error("Error deleting tasks:", error);
  }
};
