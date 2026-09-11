/// <reference types="./electron.d.ts" />

const { app } = require("electron");
const { AppMenu } = require("./AppMenu");
const { FloatingBall } = require("./FloatingBall");
const { MimoWindow } = require("./MimoWindow");

app.whenReady().then(() => {
  MimoWindow.registerGlobalShortcut();

  const floatingBall = new FloatingBall();
  const appMenu = new AppMenu(MimoWindow);

  floatingBall.on("pet-click", () => appMenu.close());
  floatingBall.on("menu-request", (mousePosition) =>
    appMenu.show(mousePosition),
  );
});
