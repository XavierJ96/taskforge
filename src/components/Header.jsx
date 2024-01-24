import React from "react";

function Header({
  userEmail,
  togglePopup,
  handleDeleteAll,
  copyLearnerData,
  logout,
  isPopupVisible,
  isTechLead,
  copyMyTasks,
  copyWeekReport,
  isTechCoach,
}) {
  return (
    <div className="header">
      <div className="my-auto">
        <img
          src="/icons/icon128.png"
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
            {isTechLead ? (
              <div
                className="flex px-3 hover:bg-[#a2a2a2] hover:cursor-pointer"
                onClick={copyLearnerData}
              >
                <span
                  id=""
                  className="font-normal text-sm py-2 active:scale-90"
                >
                  Copy Learner Tasks
                </span>
              </div>
            ) : null}
            {isTechCoach ? (
              <div
                className="flex px-3 hover:bg-[#a2a2a2] hover:cursor-pointer"
                onClick={copyWeekReport}
              >
                <span
                  id=""
                  className="font-normal text-sm py-2 active:scale-90"
                >
                  Copy Learner's Report
                </span>
              </div>
            ) : null}
            <div
              className="flex px-3 hover:bg-[#a2a2a2] hover:cursor-pointer"
              onClick={copyMyTasks}
            >
              <span id="" className="font-normal text-sm py-2 active:scale-90">
                Copy My Tasks
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
  );
}

export default Header;
