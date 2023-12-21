import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase_config";
import {
  query,
  collection,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import TaskCard from "../components/taskComponent";

function Home({ userEmail }) {
  const [taskData, setTaskData] = useState([]);

  const taskRef = collection(db, "forgedTasks");

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
    chrome.runtime.sendMessage({
      action: "setNotificationCount",
      count: taskData.length,
    });
  }, [taskData]);

  const logout = async () => {
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

  function generateTasks(type) {
    const tasks = Object.values(taskData);

    const taskCards = tasks
      .filter((task) => task.cardType === type)
      .map((task) => (
        <TaskCard
          taskId={task.id}
          cardTitle={task.cardTitle}
          cardAssignee={task.cardAssignee}
          isChecked={task.isChecked}
          cardType={task.cardType}
        />
      ));

    return taskCards;
  }

  return (
    <div className="container">
      <div className="header">
        <h2>Task Planner</h2>
      </div>
      <div className="task-board">
        <div id="stat-container">
          <div className="stat-section">
            <p className="stat-header">Projects</p>
            <span className="stat-count" id="project-count">
              {generateTasks("project").length}
            </span>
          </div>
          <div className="stat-section">
            <p className="stat-header">Reviews</p>
            <span className="stat-count" id="review-count">
              {generateTasks("review").length}
            </span>
          </div>
        </div>
        <div id="projectTasks">
          <h2 id="project-heeader" className="card-header">
            Projects:
          </h2>
          <ul id="projectList">{generateTasks("project")}</ul>
        </div>
        <div id="reviewTasks">
          <h2 id="review-header" className="card-header">
            Reviews:
          </h2>
          <ul id="reviewList">{generateTasks("review")}</ul>
        </div>
        <div className="flex justify-center">
          <button
            id="delete-all-btn"
            className="mx-auto font-bold"
            onClick={handleDeleteAll}
          >
            Delete All
          </button>
        </div>
        <div className="footer flex flex-col gap-3">
          {userEmail && (
            <p className="font-bold p-2 bg-[#f3f3f3] rounded-lg max-w-fit mx-auto">
              Signed in: <span className="font-semibold">{userEmail}</span>
            </p>
          )}
          <button
            className="p-3 bg-[#ff0000] rounded-xl text-white font-bold mx-auto"
            onClick={logout}
          >
            {" "}
            Sign Out{" "}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
