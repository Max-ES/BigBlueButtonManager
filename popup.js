let addFormWrapper = document.getElementById("add-form-wrapper");
let addForm = document.getElementById("add-form");
addFormWrapper.style.display = "none";

// ADD ROOM INFO
addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  console.log(event);
  const name = (event.target[0].value || "").trim();
  const url = (event.target[1].value || "").toLowerCase().trim();
  const code = (event.target[2].value || "").trim();

  chrome.runtime.sendMessage({
    message: "addRoom",
    room: { name, url, code },
  });

  addForm.reset();
  addFormWrapper.style.display = "none";
  addButton.style.display = "block";
});

let addButton = document.getElementById("add-button");
addButton.addEventListener("click", async () => {
  addFormWrapper.style.display = "block";
  addButton.style.display = "none";
});

let cancelButton = document.getElementById("cancel-button");
cancelButton.addEventListener("click", async (e) => {
  e.preventDefault();
  addFormWrapper.style.display = "none";
  addButton.style.display = "block";
});

// EXPORT
let exportButton = document.getElementById("export-button");
let exportTooltipText = document.getElementById("export-tooltiptext");
exportButton.addEventListener("click", async () => {
  chrome.storage.sync.get(["rooms"], function ({ rooms }) {
    rooms.forEach((room) => delete room.id);
    navigator.clipboard.writeText(JSON.stringify(rooms));
  });
  exportTooltipText.innerText = "Copied info to clipboard";
  exportButton.addEventListener("mouseout", async () => {
    exportTooltipText.innerHTML = "Copy every room info to your clipboard";
  });
});

// IMPORT
let importButton = document.getElementById("import-button");
let importForm = document.getElementById("import-form");
let importCancelButton = document.getElementById("import-cancel-button");
let importFormWrapper = document.getElementById("import-form-wrapper");
let errorText = document.getElementById("import-error-text");
// open
importButton.addEventListener("click", async () => {
  importFormWrapper.style.display = "block";
});
// close
importCancelButton.addEventListener("click", async () => {
  importFormWrapper.style.display = "none";
});
// import
importForm.addEventListener("submit", (event) => {
  event.preventDefault();
  console.log(event);
  errorText.innerText = "";
  let jsonString = (event.target[0].value || "").trim();
  try {
    let rooms = JSON.parse(jsonString);
    console.log(rooms);

    chrome.runtime.sendMessage({
      message: "addMultipleRooms",
      rooms,
    });

    importForm.reset();
    importFormWrapper.style.display = "none";
  } catch {
    errorText.innerText = "Error: Invalid JSON string";
  }
});

// Initialize values
chrome.storage.sync.get(["username", "autoFillActive"], function (result) {
  let usernameInput = document.getElementById("username");
  usernameInput.value = result.username;

  usernameInput.addEventListener("input", async (e) => {
    chrome.runtime.sendMessage({
      message: "changeUsername",
      username: e.target.value,
    });
  });

  generateRoomButtons();
});

// listen to changes
chrome.storage.onChanged.addListener(function (changes) {
  if (Object.keys(changes).includes("rooms")) {
    generateRoomButtons();
  }
});

let roomButtonWrapper = document.getElementById("button-wrapper");

function generateRoomButtons() {
  roomButtonWrapper.innerHTML = "";
  chrome.storage.sync.get(["rooms"], function ({ rooms }) {
    for (const room of rooms) {
      const row = document.createElement("DIV");
      row.classList.add("button-row");

      const tooltip = document.createElement("DIV");
      tooltip.classList.add("tooltip");

      const tooltipText = document.createElement("SPAN");
      tooltipText.classList.add("tooltiptext");
      tooltipText.innerHTML = "Click right to copy info to clipboard.";

      const btn = document.createElement("BUTTON");
      btn.innerHTML = room.name;
      btn.addEventListener("click", async () => {
        chrome.runtime.sendMessage({ message: "openPage", url: room.url });
      });
      btn.addEventListener("mouseout", async () => {
        tooltipText.innerHTML = "Click right to copy info to clipboard.";
      });
      btn.addEventListener("contextmenu", async (e) => {
        e.preventDefault();
        const text = room.name + "\n" + room.url + "\nCode: " + room.code;
        navigator.clipboard.writeText(text);
        tooltipText.innerHTML = "Room info copied to clipboard.";
      });

      const deleteBtn = document.createElement("BUTTON");
      deleteBtn.classList.add("delete-button");
      deleteBtn.innerHTML = "delete";
      deleteBtn.addEventListener("click", async () => {
        if (confirm("DELETE '" + room.name + "'?")) {
          chrome.runtime.sendMessage({ message: "deleteRoom", room: room });
        }
      });

      btn.appendChild(tooltipText);
      tooltip.appendChild(btn);
      row.appendChild(tooltip);
      row.appendChild(deleteBtn);
      roomButtonWrapper.appendChild(row);
    }
  });
}
