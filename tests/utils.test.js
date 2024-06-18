import { describe, it, expect } from "vitest";
import { setupDates, getCountForCardType } from "../src/utils/taskUtils";
import { mockCardData } from "./mocks/mockTaskdata";

describe("setupDates", () => {
  it("should have todayDate set to current date", () => {
    const today = new Date();
    const todayDate = new Date(setupDates.todayDate);
    expect(todayDate.toDateString()).toBe(today.toDateString());
  });

  it("should return yesterday's date correctly", () => {
    const yesterday = setupDates.yesterdayDate();
    const today = new Date(setupDates.todayDate);

    const expectedDate = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek - 1 === 0 ? 3 : 1;
    expectedDate.setDate(today.getDate() - daysToSubtract);
    expectedDate.setHours(0, 0, 0, 0);

    expect(yesterday.toDateString()).toBe(expectedDate.toDateString());
  });

  it("should return the correct day of the week for yesterday", () => {
    const yesterday = setupDates.yesterdayDate();
    const yesterdayDayOfWeek = setupDates.yesterdayDayOfWeek();
    expect(yesterdayDayOfWeek).toBe(yesterday.getDay());
  });
});

describe("getCountForCardType", () => {
  it("should return the card amount for each card type", () => {
    const reviewAmount = getCountForCardType("review", mockCardData)
    const projectAmount = getCountForCardType("project", mockCardData)

    expect(reviewAmount).toEqual(1)
    expect(projectAmount).toEqual(2)
  })
})