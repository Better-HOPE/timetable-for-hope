import { h, render } from "preact";
import App from "./App";
import migratorForV0_2 from "./migrator/migrator_0.2";
import { getStorage, setStorage } from "./api/storage";
import { read } from "./api/backup";
import getUserKey from "./api/userKey";
import { ScheduleStorage } from "./type/storage";

(async () => {
  // Migration
  await migratorForV0_2();

  if (!(await getStorage("storageRemains"))) {
    setStorage("storageRemains", true);

    try {
      const restoredSchedule = await read<ScheduleStorage>("schedule", await getUserKey());

      if (!restoredSchedule) {
        throw new Error("時間割が保存されていませんでした");
      }

      await setStorage<ScheduleStorage>("schedule", restoredSchedule);
    } catch(e) {
      console.log("時間割の自動リストアに失敗しました", e);
    }
  }

  let container;

  const customContainer = document.getElementById(
    "timetable-for-hope-placeholder"
  );

  if (customContainer) {
    container = customContainer;
  } else {
    container = document.createElement("div");
    const regionMain = document.getElementById("region-main");
    if (!regionMain) {
      console.error("コンテナのマウントに失敗しました");
      return;
    }
    regionMain.insertBefore(container, regionMain.firstChild);
  }

  render(<App />, container);
})();
