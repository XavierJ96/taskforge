import { describe, it, expect, test, vi, beforeEach } from "vitest";
import {
  setupDates,
  getCountForCardType,
  fetchTasks,
} from "../src/utils/taskUtils";
import { mockCardData } from "./mocks/mockTaskdata";
import { onSnapshot } from "firebase/firestore";

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
    expect(projectAmount).toEqual(2);
  });
});

describe("fetchTasks", () => {
  vi.mock("firebase/firestore", () => ({
    getFirestore: vi.fn(),
    onSnapshot: vi.fn(),
  }));

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
          const docs = [
            {
              id: "1",
              data: () => ({
                author: { name: "test@example.com" },
                title: "Task 1",
              }),
            },
            {
              id: "2",
              data: () => ({
                author: { name: "other@example.com" },
                title: "Task 2",
              }),
            },
            {
              id: "3",
              data: () => ({
                author: { name: "test@example.com" },
                title: "Task 3",
              }),
            },
          ];

          docs.forEach(cb);
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
