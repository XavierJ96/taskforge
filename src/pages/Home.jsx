import { useState, useEffect } from "react";
import { db } from "../utils/firebase_config";
import { collection } from "firebase/firestore";
import "../styles/Home.css";
import Header from "../components/Header";
import Stats from "../components/Stats";
import TaskCard from "../components/TaskComponent";
import ToggleSection from "../components/ToggleSection";
import TaskList from "../components/TaskList";
import * as taskUtils from "../utils/taskUtils";
import AddTasks from "../components/AddTasks";

function Home({ userEmail }) {
  const [taskData, setTaskData] = useState([]);
  const [todayVisible, setTodayVisible] = useState(false);
  const [yesterdayVisible, setYesterdayVisible] = useState(false);
  const [learnerData, setLearnerData] = useState({});
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isTechLead, setIsTechLead] = useState(false);
  const [isTechCoach, setIsTechCoach] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(["todayVisible", "yesterdayVisible"], (result) => {
      setTodayVisible(result.todayVisible);
      setYesterdayVisible(result.yesterdayVisible);
    });
  }, [todayVisible, yesterdayVisible]);

  const taskRef = collection(db, "forgedTasks");
  const learnerRef = collection(db, "learnerData");

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

  useEffect(() => {
    let today = new Date();
    let yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let formattedToday = today.toISOString().split("T")[0];
    let formattedYesterday = yesterday.toISOString().split("T")[0];

    let filteredTasks = taskData.filter((task) => {
      let taskDate = task.dateAdded.split("T")[0];
      return taskDate === formattedToday || taskDate === formattedYesterday;
    });

    taskUtils.setNotificationCount(filteredTasks.length);
  }, [taskData]);

  const logout = async () => {
    taskUtils.setNotificationCount(0);
    await taskUtils.logoutUser();
  };

  const togglePopup = () => {
    taskUtils.togglePopup(isPopupVisible, setIsPopupVisible);
  };

  const handleDeleteAll = async () => {
    taskUtils.deleteAllTasks(taskData, taskRef, setTaskData);
  };

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const reviewTasksCount = taskUtils.getCountForCardType(
    "review",
    taskData,
    today,
    yesterday
  );

  const projectTasksCount = taskUtils.getCountForCardType(
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
        if (today.getDay() === 1) {
          yesterday.setDate(yesterday.getDate() - 2);
        }

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
      <AddTasks />
    </div>
  );
}

export default Home;
