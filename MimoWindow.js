/// <reference types="./electron.d.ts" />

const { BaseWindow, WebContentsView, globalShortcut } = require("electron");

class MimoWindow extends BaseWindow {
  static instance = null;

  static getInstance() {
    if (!this.instance) {
      this.instance = new MimoWindow();
      this.instance.on("closed", () => {
        globalShortcut.unregister("Escape");
        this.instance = null;
      });
    }
    return this.instance;
  }

  static registerGlobalShortcut() {
    globalShortcut.register("CommandOrControl+Shift+Space", () => {
      this.getInstance().show();
    });
  }

  constructor() {
    super({
      width: 480,
      height: 640,
      activate: false,
      show: false,
      type: "panel",
      transparent: true,
      frame: false,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      minimizable: false,
      maximizable: false,
      hasShadow: true,
    });
    this.contentView.setBorderRadius(20);

    this.webContentsView = new WebContentsView();
    this.contentView.addChildView(this.webContentsView);
    this.webContentsView.setBounds({ x: 0, y: 0, width: 480, height: 640 });
    this.webContentsView.webContents.on("render-process-gone", () => {
      if (!this.isDestroyed()) this.destroy();
    });

    this.on("focus", () => {
      this.webContentsView.webContents.focus();
    });

    this.webContentsView.webContents.loadURL(
      "https://aistudio.xiaomimimo.com/#/c",
    );
  }

  show() {
    super.show();
    globalShortcut.register("Escape", () => this.hide());
  }

  hide() {
    globalShortcut.unregister("Escape");
    super.hide();
  }
}

exports.MimoWindow = MimoWindow;
