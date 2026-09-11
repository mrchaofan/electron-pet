/// <reference types="./electron.d.ts" />

const electron = require("electron");
const path = require("path");
const { MenuWindow } = require("./MenuWindow");

const MENU_OFFSET = 4;

class AppMenu {
  constructor(MimoWindow) {
    this.MimoWindow = MimoWindow;
    this.menuWindow = null;
    this.menuConfig = {
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
  }

  close() {
    const menuWindow = this.menuWindow;
    this.menuWindow = null;

    if (menuWindow && !menuWindow.isDestroyed()) {
      menuWindow.closeMenu();
    }
  }

  show(mousePosition) {
    this.close();

    const menuWindow = new MenuWindow(this.menuConfig, false);
    this.menuWindow = menuWindow;
    menuWindow.setPosition(
      mousePosition.x + MENU_OFFSET,
      mousePosition.y + MENU_OFFSET,
    );
    menuWindow.once("closed", () => {
      if (this.menuWindow === menuWindow) this.menuWindow = null;
    });
    menuWindow.on("menu-click", (item) => this.handleMenuClick(item));
    menuWindow.moveTop();
    menuWindow.focus();
  }

  handleMenuClick(item) {
    if (item.text === "打开 mimo") {
      this.close();
      this.MimoWindow.getInstance().show();
      return;
    }
    if (item.text === "GitHub") {
      this.close();
      electron.shell.openExternal("https://github.com/mrchaofan");
      return;
    }
    if (item.text === "小红书") {
      this.close();
      electron.shell.openExternal(
        "https://www.xiaohongshu.com/user/profile/615d7c9d0000000002020fc6",
      );
      return;
    }
  }
}

exports.AppMenu = AppMenu;
