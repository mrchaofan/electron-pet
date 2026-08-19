/// <reference types="./electron.d.ts" />

const electron = require("electron");
const { MenuView } = require("./MenuView");

class MenuWindow extends electron.BaseWindow {
  static CLOSE_DEBOUNCE_MS = 280;

  constructor(menuConfig = {}, autoCloseOnMouseExit = true, parentMenu = null) {
    super({
      type: "panel",
      frame: false,
      transparent: true,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      minimizable: false,
      maximizable: false,
      roundedCorners: false,
      hiddenInMissionControl: true,
      activate: false,
    });

    this.parentMenu = parentMenu;
    this.autoCloseOnMouseExit = parentMenu ? true : autoCloseOnMouseExit;
    this.subMenuWindow = null;
    this.subMenuSource = null;
    this.closeTimer = null;

    this.configureWindowHierarchy();
    this.configureContent();
    this.addMenuItems(menuConfig.items);
  }

  configureWindowHierarchy() {
    this.setAlwaysOnTop(true, "floating", this.parentMenu ? 1 : 0);
    if (!this.parentMenu) return;

    this.setParentWindow(this.parentMenu);
    this.on("menu-click", (item) => this.parentMenu.emit("menu-click", item));
  }

  configureContent() {
    this.menuView = new MenuView();
    this.contentView.addChildView(this.menuView);
    this.contentView.calculatePreferredSize = () =>
      this.menuView.getPreferredSize();
    this.contentView.on("layout", () => {
      this.menuView.sizeToContents();
      this.contentView.sizeToContents();
      this.sizeToContents();
    });

    this.contentView.setBorderRadius(8);
    this.contentView.setMasksToBounds(true);
    this.on("blur", () => this.handleBlur());
    this.contentView.on("mouse-entered", () => this.cancelClose());
    this.contentView.on("mouse-exited", () => this.scheduleClose());
  }

  addMenuItems(items = []) {
    for (const item of items) {
      this.addMenuItem(item);
    }
  }

  addMenuItem(menuItem) {
    const menuItemView = this.menuView.addMenuItem(menuItem);

    menuItemView.setOnHover((isHover) => {
      if (isHover) {
        this.updateSubMenu(menuItem, menuItemView);
      }
    });
    menuItemView.setOnClick(() => this.emit("menu-click", menuItem));

    return menuItemView;
  }

  updateSubMenu(menuItem, menuItemView) {
    if (menuItem.subMenu) {
      this.showSubMenu(menuItem.subMenu, menuItemView);
    } else {
      this.destroySubMenu();
    }
  }

  showSubMenu(subMenuConfig, menuItemView) {
    if (this.isCurrentSubMenu(subMenuConfig)) {
      this.subMenuWindow.cancelClose();
      this.subMenuWindow.moveTop();
      this.subMenuWindow.focus();
      return;
    }

    this.destroySubMenu();

    const subMenuWindow = new MenuWindow(
      this.normalizeMenuConfig(subMenuConfig),
      true,
      this,
    );
    this.subMenuWindow = subMenuWindow;
    this.subMenuSource = subMenuConfig;

    subMenuWindow.on("closed", () => this.clearSubMenuReference(subMenuWindow));
    subMenuWindow.setPosition(...this.getSubMenuPosition(menuItemView));
    subMenuWindow.moveTop();
    subMenuWindow.focus();
  }

  normalizeMenuConfig(config) {
    return Array.isArray(config) ? { items: config } : config;
  }

  getSubMenuPosition(menuItemView) {
    const windowBounds = this.getBounds();
    const menuBounds = this.menuView.getBounds();
    const itemBounds = menuItemView.getBounds();

    return [
      windowBounds.x + menuBounds.x + itemBounds.x + itemBounds.width,
      windowBounds.y + menuBounds.y + itemBounds.y,
    ];
  }

  isCurrentSubMenu(config) {
    return this.subMenuSource === config && this.hasVisibleSubMenu();
  }

  clearSubMenuReference(subMenuWindow) {
    if (this.subMenuWindow !== subMenuWindow) return;

    this.subMenuWindow = null;
    this.subMenuSource = null;
  }

  hasVisibleSubMenu() {
    return Boolean(this.subMenuWindow && !this.subMenuWindow.isDestroyed());
  }

  handleBlur() {
    if (!this.hasVisibleSubMenu()) {
      this.closeMenu();
    }
  }

  scheduleClose() {
    if (!this.autoCloseOnMouseExit) return;

    this.cancelClose();
    this.closeTimer = setTimeout(() => {
      this.closeTimer = null;
      if (!this.hasVisibleSubMenu()) {
        this.closeMenu();
      }
    }, MenuWindow.CLOSE_DEBOUNCE_MS);
  }

  cancelClose() {
    if (!this.closeTimer) return;

    clearTimeout(this.closeTimer);
    this.closeTimer = null;
  }

  closeMenu() {
    this.cancelClose();
    this.destroySubMenu();
    if (!this.isDestroyed()) {
      this.destroy();
    }
  }

  destroySubMenu() {
    const subMenuWindow = this.subMenuWindow;
    this.subMenuWindow = null;
    this.subMenuSource = null;

    if (subMenuWindow && !subMenuWindow.isDestroyed()) {
      subMenuWindow.closeMenu();
    }
  }
}

exports.MenuWindow = MenuWindow;
