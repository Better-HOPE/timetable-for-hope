import { h, render } from "preact";
import App from "./App";
import migratorForV0_2 from "./migrator/migrator_0.2";

(async () => {
  // Migration
  await migratorForV0_2();

  const container = document.createElement("div");
  const regionMain = document.getElementById("region-main");
  if (regionMain) {
    regionMain.insertBefore(container, regionMain.firstChild);
    render(<App />, container);
  }
})();
