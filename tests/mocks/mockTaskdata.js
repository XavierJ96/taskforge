// __mocks__/mockCardData.js
export const mockCardData = [
  {
    author: {
      id: "plFecQBafcN2nwmv37zgltS8TfR2",
      name: "user3@gmail.com",
    },
    cardAssignee: "daniel.deacon@umuzi.org",
    cardTitle: "semitone difference - Make a simple GUI",
    cardType: "review",
    dateAdded: `${new Date().toDateString()}`,
    id: "VBETtuTbsNkeRUFzZhQu",
    isChecked: false,
    openPullRequest: false,
    pushCode: false,
  },
  {
    author: {
      id: "plFecQBafcN2nwmv37zgltS8TfR2",
      name: "user3@gmail.com",
    },
    cardTitle: "Email random inspirational quote - part 3",
    cardType: "project",
    dateAdded: `${new Date().toDateString()}`,
    id: "tph2nzusZCbV4JbaDE2Q",
    openPullRequest: false,
    pushCode: false,
  },
  {
    author: {
      id: "plFecQBafcN2nwmv37zgltS8TfR2",
      name: "user3@gmail.com",
    },
    cardAssignee: "jane.doe@example.com",
    cardTitle: "Develop login functionality",
    cardType: "project",
    dateAdded: `${new Date().toDateString()}`,
    id: "xw6J7uKzR8NeT4uQYk5A",
    openPullRequest: true,
    pushCode: true,
  },
  {
    author: {
      id: "plFecQBafcN2nwmv37zgltS8TfR2",
      name: "user3@gmail.com",
    },
    cardAssignee: "jane.doe@example.com",
    cardTitle: "Develop login",
    cardType: "project",
    dateAdded: `${new Date().toDateString()}`,
    id: "xw6J7uKzR8NeT4uQYk5A",
    openPullRequest: true,
    pushCode: true,
  },
];

export const mockDocs = [
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