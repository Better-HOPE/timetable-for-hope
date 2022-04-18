import { h, render } from "preact";
import App from "./App";
import migratorForV0_2 from "./migrator/migrator_0.2";

(async () => {
  // Migration
  await migratorForV0_2();

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
