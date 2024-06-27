import { table } from "./firebase_config";
import { getMissedTasks } from "./taskUtils";

export function resetTaskPostedState() {
  const today = new Date().toISOString().slice(0, 10);

  chrome.storage.local.get("lastResetDate", function (result) {
    const lastResetDate = result.lastResetDate;

    if (!lastResetDate || lastResetDate !== today) {
      chrome.storage.local.set(
        { taskPosted: "false", lastResetDate: today },
        function () {}
      );
    }
  });
}

export function updateOrCreateRecord(data) {
  table("Learners")
    .select({
      filterByFormula: `AND({Name} = '${data.userEmail}', {Date} = '${data.date}')`,
    })
    .firstPage((err, records) => {
      if (err) {
        console.error(err);
        return;
      }

      if (records && records.length > 0) {
        const record = records[0];
        table("Learners").update(
          [
            {
              id: record.id,
              fields: {
                "Plan Report": data.tasks,
                Missed: getMissedTasks(data.tasks),
                "Missed count": data.missed,
              },
            },
          ],
          (err, updatedRecords) => {
            if (err) {
              console.error("Error updating record:", err);
              return;
            }
            chrome.storage.local.set({ taskPosted: "true" }, function () {});
          }
        );
      } else {
        createNewRecord(data);
        chrome.storage.local.set({ taskPosted: "true" }, function () {});
      }
    });
}

function createNewRecord(data) {
  table("Learners").create(
    [
      {
        fields: {
          Name: data.userEmail,
          Date: data.date,
          "Plan Report": data.tasks,
          Missed: getMissedTasks(data.tasks),
          "Missed count": data.missed,
        },
      },
    ],
    (err, records) => {
      if (err) {
        console.error("Error creating record:", err);
        return;
      }
    }
  );
}
