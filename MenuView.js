/// <reference types="./electron.d.ts" />

const electron = require("electron");
const { MenuItemView } = require("./MenuItemView");

class MenuView extends electron.BoxLayoutView {
  static BACKGROUND_COLOR = "#ffffff";

  constructor() {
    super();

    this.setOrientation("vertical");
    this.setBackgroundColor(MenuView.BACKGROUND_COLOR);
    this.setInsideBorderInsets({ top: 1, left: 1, bottom: 1, right: 1 });
    this.setBetweenChildSpacing(0);
  }

  addMenuItem({ icon, text, subText } = {}) {
    const menuItemView = new MenuItemView();

    menuItemView.setIcon(icon);
    menuItemView.setText(text);
    menuItemView.setSubText(subText);

    this.addChildView(menuItemView);
    return menuItemView;
  }
}

exports.MenuView = MenuView;
