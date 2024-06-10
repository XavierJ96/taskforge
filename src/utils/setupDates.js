const setupDates = {
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

module.exports = { setupDates };
