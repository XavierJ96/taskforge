import { describe, it, expect, test, vi, beforeEach, afterEach } from "vitest";
import {
  setupDates,
  getCountForCardType,
  fetchTasks,
  fetchLearnerData,
  formattedData,
} from "../src/utils/taskUtils";
import { expectedFormat, formatData, mockCardData, mockDocs } from "./mocks/mockTaskdata";
import { onSnapshot, getDocs } from "firebase/firestore";

vi.mock("firebase/firestore", () => {
  return {
    getFirestore: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    collection: vi.fn(),
    where: vi.fn(),
    onSnapshot: vi.fn(),
  };
});

describe("setupDates", () => {
  test("should have todayDate set to current date", () => {
    const today = new Date();
    const todayDate = new Date(setupDates.todayDate);

    expect(todayDate.toDateString()).toBe(today.toDateString());
  });

  test("should return yesterday's date correctly", () => {
    const yesterday = setupDates.yesterdayDate();
    const today = new Date(setupDates.todayDate);

    const expectedDate = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek - 1 === 0 ? 3 : 1;
    expectedDate.setDate(today.getDate() - daysToSubtract);
    expectedDate.setHours(0, 0, 0, 0);

    expect(yesterday.toDateString()).toBe(expectedDate.toDateString());
  });

  test("should return the correct day of the week for yesterday", () => {
    const yesterday = setupDates.yesterdayDate();
    const yesterdayDayOfWeek = setupDates.yesterdayDayOfWeek();
    expect(yesterdayDayOfWeek).toBe(yesterday.getDay());
  });
});

describe("getCountForCardType", () => {
  test("should return the card amount for each card type", () => {
    const reviewAmount = getCountForCardType("review", mockCardData);
    const projectAmount = getCountForCardType("project", mockCardData);

    expect(reviewAmount).toEqual(1);
    expect(projectAmount).toEqual(3);
  });
});

describe("fetchTasks", () => {
  let taskRef;
  let userEmail;
  let setTaskData;

  beforeEach(() => {
    taskRef = {};
    userEmail = "test@example.com";
    setTaskData = vi.fn();

    onSnapshot.mockImplementation((ref, callback) => {
      const snapshot = {
        forEach: (cb) => {
          mockDocs.forEach(cb);
        },
      };

      callback(snapshot);

      return vi.fn();
    });
  });

  it("filters tasks by userEmail and calls setTaskData with the correct tasks", () => {
    fetchTasks(taskRef, userEmail, setTaskData);

    expect(setTaskData).toHaveBeenCalledWith([
      {
        id: "1",
        author: { name: "test@example.com" },
        title: "Task 1",
      },
      {
        id: "3",
        author: { name: "test@example.com" },
        title: "Task 3",
      },
    ]);
  });
});

describe("fetchLearnerData", () => {
  const mockLearnerRef = {};
  const mockUserEmail = "test@user.com";
  const mockSetIsTechLead = vi.fn();
  const mockSetLearnerData = vi.fn();

  const snapshot = {
    docs: [
      {
        data: () => ({ techLead: "test@user.com", learners: ["learner1"] }),
      },
    ],
  };

  beforeEach(() => {
    const taskSnapshot = {
      forEach: vi.fn((callback) => {
        const taskDoc = {
          data: () => ({
            author: { name: "learner1" },
            taskData: "someData",
          }),
        };
        callback(taskDoc);
      }),
    };

    getDocs.mockResolvedValueOnce(snapshot);
    getDocs.mockResolvedValueOnce(taskSnapshot);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should call setIsTechLead with true if the user is a tech lead", async () => {
    const snapshot = {
      docs: [
        {
          data: () => ({ techLead: "test@user.com", learners: ["learner1"] }),
        },
      ],
    };

    getDocs.mockResolvedValue(snapshot);

    await fetchLearnerData(
      mockLearnerRef,
      mockUserEmail,
      mockSetIsTechLead,
      mockSetLearnerData
    );

    expect(mockSetIsTechLead).toHaveBeenCalledWith(true);
  });

  it("should call setLearnerData with the correct data", async () => {
    await fetchLearnerData(
      mockLearnerRef,
      mockUserEmail,
      mockSetIsTechLead,
      mockSetLearnerData
    );

    expect(mockSetLearnerData).toHaveBeenCalledWith({
      learner1: [
        {
          author: { name: "learner1" },
          taskData: "someData",
        },
      ],
    });
    expect(mockSetIsTechLead).toHaveBeenCalledWith(true);
  });
});

describe("formattedData", () => {
  it("should return the correct formatted data", () => {
    const data = formattedData(mockCardData, false);
    
    expect(data).toBe(expectedFormat);
  });
});
