/// <reference types="./electron.d.ts" />

const {
  app,
  BaseWindow,
  globalShortcut,
  shell,
  WebContentsView,
} = require("electron");
const { FloatingBall } = require("./FloatingBall");
const { MenuWindow } = require("./MenuWindow");
const path = require("path");

const MENU_OFFSET = 4;
const MENU_CONFIG = {
  items: [
    { text: "打开 mimo", subText: "⌘ + ⇧ + Space" },
    {
      text: "寻找作者",
      subMenu: [
        { text: "GitHub", icon: path.join(__dirname, "github.png") },
        { text: "小红书", icon: path.join(__dirname, "xiaohongshu.png") },
      ],
    },
  ],
};

class MimoInstance extends BaseWindow {
  static instance = null;

  static getInstance() {
    if (!this.instance) {
      this.instance = new MimoInstance();
      this.instance.on("closed", () => {
        globalShortcut.unregister("Escape");
        this.instance = null;
      });
    }
    return this.instance;
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
      if (!this.isDestroyed()) {
        this.destroy();
      }
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

  static registerGlobalShortcut() {
    globalShortcut.register("CommandOrControl+Shift+Space", () => {
      this.getInstance().show();
    });
  }
}

app.whenReady().then(() => {
  MimoInstance.registerGlobalShortcut();

  const floatingBall = new FloatingBall();
  let menuWindow = null;

  const closeMenuWindow = () => {
    const currentMenuWindow = menuWindow;
    menuWindow = null;

    if (currentMenuWindow && !currentMenuWindow.isDestroyed()) {
      currentMenuWindow.closeMenu();
    }
  };

  floatingBall.on("pet-click", closeMenuWindow);
  floatingBall.on("menu-request", (mousePosition) => {
    closeMenuWindow();

    const nextMenuWindow = new MenuWindow(MENU_CONFIG, false);
    nextMenuWindow.setPosition(
      mousePosition.x + MENU_OFFSET,
      mousePosition.y + MENU_OFFSET,
    );
    nextMenuWindow.moveTop();
    nextMenuWindow.focus();
    nextMenuWindow.once("closed", () => {
      if (menuWindow === nextMenuWindow) {
        menuWindow = null;
      }
    });

    nextMenuWindow.on("menu-click", (item) => {
      if (item.text === "打开 mimo") {
        nextMenuWindow.close();
        MimoInstance.getInstance().show();
      }
      if (item.text === "GitHub") {
        nextMenuWindow.close();
        shell.openExternal("https://github.com/mrchaofan");
      }

      if (item.text === "小红书") {
        nextMenuWindow.close();
        shell.openExternal(
          "https://www.xiaohongshu.com/user/profile/615d7c9d0000000002020fc6",
        );
      }
    });

    menuWindow = nextMenuWindow;
  });
});
