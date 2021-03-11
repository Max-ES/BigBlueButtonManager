chrome.storage.sync.get(
  ["rooms", "username", "autoFillActive"],
  function (result) {
    if (!result.autoFillActive) {
      return;
    }

    for (const room of result.rooms) {
      if (room.url == window.location.href) {
        let errorOccurred = !!document.querySelector(".alert");
        if (errorOccurred) {
          console.error("wrong room code");
          break;
        }

        const codeInput = document.querySelector("#room_access_code");
        if (codeInput) {
          codeInput.value = room.code;
          document.querySelector(".btn.join-form")?.click?.();
        } else {
          console.log("room code input field not found");
        }

        const nameInput = document.querySelector(".join-form");
        if (nameInput) {
          nameInput.value = result.username || "";
        } else {
          console.log("name input field not found");
        }

        break;
      }
    }
  }
);
