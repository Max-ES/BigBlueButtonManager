chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(
    ["rooms", "username", "autoFillActive"],
    function (result) {
      if (result.rooms == null) {
        setRooms([]);
      }
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
  if (request.message == "addMultipleRooms") addMultipleRooms(request.rooms);
  if (request.message == "deleteRoom") deleteRoom(request.room);
});

// add ids to rooms, if there aren't any
chrome.storage.sync.get(["rooms"], function (result) {
  let rooms = result.rooms;
  let idsWereReseted = false;
  for (let room of rooms) {
    if (!room.id) {
      console.log("found room without id... setting id...");
      room = addIdToRoom(room);
      idsWereReseted = true;
    }
  }
  if (idsWereReseted) {
    console.log({ rooms });
    setRooms(rooms);
  }
});

function openRoomPage(url) {
  chrome.tabs.create({ url });
}

function addRoom(room) {
  chrome.storage.sync.get(["rooms"], function ({ rooms }) {
    addIdToRoom(room);
    rooms.push(room);
    setRooms(rooms);
  });
}

function addMultipleRooms(newRooms) {
  chrome.storage.sync.get(["rooms"], function ({ rooms }) {
    let roomsWithId = newRooms.map((room) => addIdToRoom(room));
    rooms = rooms.concat(roomsWithId);
    setRooms(rooms);
  });
}

function addIdToRoom(room) {
  room.id = Math.floor(Math.random() * Date.now());
  return room;
}

function deleteRoom(room) {
  chrome.storage.sync.get(["rooms"], function ({ rooms }) {
    setRooms(rooms.filter((r) => r.id != room.id));
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
