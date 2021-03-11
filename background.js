chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(
    ["rooms", "username", "autoFillActive"],
    function (result) {
      if (result.rooms == null) {
        setRooms([]);
      }
      console.log(result.username);
      if (result.username == null) {
        setUsername("Peter Champ");
      }
      if (result.autoFillActive == null) {
        setAutoFillActive(true);
      }
    }
  );
});

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.message == "openPage") openRoomPage(request.url);
  if (request.message == "changeUsername") setUsername(request.username);
  if (request.message == "addRoom") addRoom(request.room);
  if (request.message == "deleteRoom") deleteRoom(request.room);
});

function openRoomPage(url) {
  chrome.tabs.create({ url });
}

function addRoom(room) {
  chrome.storage.sync.get(["rooms"], function ({ rooms }) {
    rooms.push(room);
    setRooms(rooms);
  });
}

function deleteRoom(room) {
  chrome.storage.sync.get(["rooms"], function ({ rooms }) {
    setRooms(rooms.filter((r) => r.url != room.url));
  });
}

function setRooms(rooms) {
  chrome.storage.sync.set({ rooms: rooms });
}

function setUsername(name) {
  chrome.storage.sync.set({ username: name });
  console.log("name is now: " + name);
}

function setAutoFillActive(isActive) {
  chrome.storage.sync.set({ autoFillActive: isActive });
}
