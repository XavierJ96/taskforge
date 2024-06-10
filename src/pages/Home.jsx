import { useState, useEffect, useRef } from "react";
import { db } from "../utils/firebase_config";
import { collection, query, where, orderBy } from "firebase/firestore";
import "../styles/Home.css";
import Header from "../components/Header";
import Stats from "../components/Stats";
import TaskCard from "../components/TaskComponent";
import ToggleSection from "../components/ToggleSection";
import TaskList from "../components/TaskList";
import * as taskUtils from "../utils/taskUtils";

function Home({ userEmail }) {
  const [taskData, setTaskData] = useState([]);
  const [todayVisible, setTodayVisible] = useState(false);
  const [yesterdayVisible, setYesterdayVisible] = useState(false);
  const [learnerData, setLearnerData] = useState({});
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isTechLead, setIsTechLead] = useState(false);
  const [isTechCoach, setIsTechCoach] = useState(false);

  const effectRan = useRef(false);

  useEffect(() => {
    chrome.storage.local.get(["todayVisible", "yesterdayVisible"], (result) => {
      setTodayVisible(result.todayVisible);
      setYesterdayVisible(result.yesterdayVisible);
    });
  }, [todayVisible, yesterdayVisible]);
  
  const taskRef = query(
    collection(db, "forgedTasks"),
    where("author.name", "==", userEmail),
    where("dateAdded", ">=", taskUtils.setupDates.yesterdayDate().toISOString()),
    orderBy("dateAdded", "desc")
  );

  const learnerRef = query(collection(db, "learnerData"));

  useEffect(() => {
    taskUtils.fetchTasks(taskRef, userEmail, setTaskData);
  }, []);

  useEffect(() => {
    taskUtils.fetchLearnerData(
      learnerRef,
      userEmail,
      setIsTechLead,
      setLearnerData,
      setIsTechCoach
    );
  }, []);

  const logout = async () => {
    taskUtils.setNotificationCount(0);
    await taskUtils.logoutUser();
  };

  const togglePopup = () => {
    taskUtils.togglePopup(isPopupVisible, setIsPopupVisible);
  };

  const handleDeleteAll = async () => {
    taskUtils.deleteAllTasks(taskData, setTaskData);
  };

  const reviewTasksCount = taskUtils.getCountForCardType(
    "review",
    taskData,
  );

  const projectTasksCount = taskUtils.getCountForCardType(
    "project",
    taskData,
  );

  useEffect(() => {
    if (effectRan.current === false) {
      if (taskData.length > 0) {
        chrome.runtime.sendMessage({
          action: "postTasks",
          userEmail: userEmail,
          tasks: taskUtils.formattedData(taskData, false),
          date: taskUtils.setupDates.todayDate.toISOString().substring(0, 10),
          missed: taskData.filter(
            (task) =>
              new Date(task.dateAdded).toDateString() !==
                taskUtils.dateStrings.todayString && !task.isChecked
          ).length,
        });
      }
    }
  }, [taskData]);

  const generateTasks = (section) => {
    const filteredTasks = taskData.filter((task) => {
      const taskDate = new Date(task.dateAdded);

      if (section === "today") {
        return taskDate.toDateString() === taskUtils.dateStrings.todayString;
      } else if (section === "yesterday") {
        return taskDate.toDateString() !==  taskUtils.dateStrings.todayString;
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
        gitLink={task.gitLink}
      />
    ));
  };

  const copyLearnerData = () => {
    const data = taskUtils.formattedData(learnerData, true);
    taskUtils.copyToClipboard(data);
  };

  const copyMyTasks = () => {
    const data = taskUtils.formattedData(taskData, false);
    taskUtils.copyToClipboard(data);
  };

  const copyWeekReport = () => {
    const data = taskUtils.formatWeeklyReport(learnerData);
    taskUtils.copyToClipboard(data);
  };

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

  return (
    <div className="task-container">
      <Header
        userEmail={userEmail}
        togglePopup={togglePopup}
        handleDeleteAll={handleDeleteAll}
        copyLearnerData={copyLearnerData}
        copyWeekReport={copyWeekReport}
        logout={logout}
        copyMyTasks={copyMyTasks}
        isTechLead={isTechLead}
        isTechCoach={isTechCoach}
        isPopupVisible={isPopupVisible}
      />
      <div className="task-board space-y-3">
        <Stats
          projectTasksCount={projectTasksCount}
          reviewTasksCount={reviewTasksCount}
        />
        <ToggleSection
          isVisible={todayVisible}
          onClick={() => showTasks("today")}
          label="Today"
          taskCount={generateTasks("today").length}
        />
        <TaskList tasks={generateTasks("today")} isVisible={todayVisible} />
        <ToggleSection
          isVisible={yesterdayVisible}
          onClick={() => showTasks("yesterday")}
          label="Yesterday"
          taskCount={generateTasks("yesterday").length}
        />
        <TaskList
          tasks={generateTasks("yesterday")}
          isVisible={yesterdayVisible}
        />
      </div>
    </div>
  );
}

export default Home;
