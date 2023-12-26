import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase_config";
import clipboard from "clipboardy";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import "../styles/Home.css";
import TaskCard from "../components/TaskComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faFileCode,
  faAngleDown,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";

function Home({ userEmail }) {
  const [taskData, setTaskData] = useState([]);
  const [todayVisible, setTodayVisible] = useState(false);
  const [yesterdayVisible, setYesterdayVisible] = useState(false);
  const [learnerData, setLearnerData] = useState({});

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [hasLearnersData, setHasLearnersData] = useState();

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  useEffect(() => {
    chrome.storage.local.get(["todayVisible", "yesterdayVisible"], (result) => {
      setTodayVisible(result.todayVisible);
      setYesterdayVisible(result.yesterdayVisible);
    });
  }, [todayVisible, yesterdayVisible]);

  const showTasks = (section) => {
    if (section === "today") {
      setTodayVisible((prev) => !prev);
      chrome.storage.local.set({ todayVisible: !todayVisible }, () => {});
    } else if (section === "yesterday") {
      setYesterdayVisible((prev) => !prev);
      chrome.storage.local.set(
        { yesterdayVisible: !yesterdayVisible },
        () => {}
      );
    }
  };

  const taskRef = collection(db, "forgedTasks");
  const learnerRef = collection(db, "learnerData");

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const tasksByLearner = {};
      const unsub = onSnapshot(learnerRef, async (snapshot) => {
        snapshot.forEach(async (doc) => {
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

    fetchData();
  }, []);

  function formattedData(learnerData) {
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
  }

  function copyToClipboard() {
    try {
      const data = formattedData(learnerData);

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
  }

  useEffect(() => {
    chrome.runtime.sendMessage({
      action: "setNotificationCount",
      count: taskData.length,
    });
  }, [taskData]);

  const logout = async () => {
    chrome.runtime.sendMessage({
      action: "setNotificationCount",
      count: 0,
    });
    await signOut(auth);
  };

  const handleDeleteAll = async () => {
    try {
      taskData.forEach(async (task) => {
        await deleteDoc(doc(taskRef, task.id));
      });

      setTaskData([]);
    } catch (error) {
      console.error("Error deleting tasks:", error);
    }
  };

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const getCountForCardType = (cardType, taskData, today, yesterday) => {
    return taskData.filter(
      (task) =>
        task.cardType === cardType &&
        (new Date(task.dateAdded).toDateString() === today.toDateString() ||
          new Date(task.dateAdded).toDateString() === yesterday.toDateString())
    ).length;
  };

  const reviewTasksCount = getCountForCardType(
    "review",
    taskData,
    today,
    yesterday
  );
  const projectTasksCount = getCountForCardType(
    "project",
    taskData,
    today,
    yesterday
  );

  const generateTasks = (section) => {
    const filteredTasks = taskData.filter((task) => {
      const today = new Date();
      const taskDate = new Date(task.dateAdded);

      if (section === "today") {
        return taskDate.toDateString() === today.toDateString();
      } else if (section === "yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return taskDate.toDateString() === yesterday.toDateString();
      }

      return false;
    });

    return filteredTasks.map((task) => (
      <TaskCard
        taskId={task.id}
        cardTitle={task.cardTitle}
        cardAssignee={task.cardAssignee}
        isChecked={task.isChecked}
        cardType={task.cardType}
      />
    ));
  };

  return (
    <div className="task-container">
      <div className="header">
        <div className="my-auto">
          <img
            src="/assets/icon128.png"
            alt=""
            className="w-6 h-6 rounded-[50%]"
          />
        </div>
        <div className="mx-auto">
          <h2 className="title">MY TASKS</h2>
        </div>
        <div>
          <button className="menu-btn" onClick={togglePopup}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              fill="none"
              className="w-6 h-6"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <g stroke="#B2B2B2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11.98" cy="12" r="0.6" strokeWidth="1.2"></circle>
                <circle cx="16.18" cy="12" r="0.6" strokeWidth="1.2"></circle>
                <circle cx="7.78" cy="12" r="0.6" strokeWidth="1.2"></circle>
                <circle cx="12" cy="12" r="10" strokeWidth="1.4"></circle>
              </g>
            </svg>
          </button>
          {isPopupVisible && (
            <div className="popup text-[#E4E4E4] fixed right-4 bg-[#252525] py-3 rounded-md min-w-[200px]">
              {userEmail && (
                <div className="font-semibold py-4 text-[#a2a2a2]">
                  {userEmail}
                </div>
              )}
              <div
                className="flex px-3 hover:bg-[#a2a2a2] hover:cursor-pointer"
                onClick={handleDeleteAll}
              >
                <span id="" className="font-normal text-sm py-2">
                  Delete All
                </span>
              </div>
              <div
                className="flex px-3 hover:bg-[#a2a2a2] hover:cursor-pointer"
                onClick={copyToClipboard}
              >
                <span id="" className="font-normal text-sm py-2">
                  Copy
                </span>
              </div>
              <div className="mt-3">
                <button
                  className="py-2 px-5 font-semibold bg-red-600 rounded-lg"
                  onClick={logout}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="task-board space-y-3">
        <div id="stat-container" className="flex justify-center mb-4">
          <div className="flex text-[#E4E4E4] gap-2 bg-[#424242] py-1 px-2 rounded-full font-semibold">
            <p className="">
              <FontAwesomeIcon icon={faFileCode} className="mr-1" />
              Projects
            </p>
            <span className="" id="project-count">
              {projectTasksCount}
            </span>
          </div>
          <div className="flex text-[#E4E4E4] gap-2 bg-[#424242] py-1 px-2 rounded-full font-semibold">
            <p className="">
              <FontAwesomeIcon
                icon={faPenToSquare}
                style={{ color: "#ffffff" }}
                className="my-auto mr-1"
              />
              Reviews
            </p>
            <span className="" id="review-count">
              {reviewTasksCount}
            </span>
          </div>
        </div>
        <div className="">
          <div className="text-[#E4E4E4] flex space-x-2 items-center">
            <FontAwesomeIcon
              icon={todayVisible ? faAngleDown : faAngleRight}
              className="my-auto w-6 h-6 hover:cursor-pointer hover:text-[#007bff] active:scale-75"
              onClick={() => showTasks("today")}
            />
            <p className="text-lg font-semibold font-[Montserrat]">Today</p>
            <div
              style={{ display: todayVisible ? "none" : "flex" }}
              className=" text-[#E4E4E4] items-center justify-center rounded-full bg-[#424242] min-w-[22px] h-[22px]"
            >
              <span className="">{generateTasks("today").length}</span>
            </div>
          </div>
          <div
            id="task-list"
            style={{ display: todayVisible ? "block" : "none" }}
          >
            {generateTasks("today")}
          </div>
        </div>
        <div className="">
          <div className="text-[#E4E4E4] flex space-x-2 items-center">
            <FontAwesomeIcon
              icon={yesterdayVisible ? faAngleDown : faAngleRight}
              className="my-auto w-6 h-6 hover:cursor-pointer hover:text-[#007bff] active:scale-75"
              onClick={() => showTasks("yesterday")}
            />
            <p className="text-lg font-semibold font-[Montserrat]">Yesterday</p>
            <div
              style={{ display: yesterdayVisible ? "none" : "flex" }}
              className=" text-[#E4E4E4] items-center justify-center rounded-full bg-[#424242] min-w-[22px] h-[22px]"
            >
              <span className="">{generateTasks("yesterday").length}</span>
            </div>
          </div>
          <div
            id="task-list"
            style={{ display: yesterdayVisible ? "block" : "none" }}
          >
            {generateTasks("yesterday")}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
