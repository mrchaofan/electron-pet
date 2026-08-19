/// <reference types="./electron.d.ts" />

const electron = require("electron");

class MenuItemView extends electron.View {
  static WIDTH = 200;
  static HEIGHT = 34;
  static ICON_SIZE = 16;
  static NORMAL_BACKGROUND_COLOR = "#ffffff";
  static HOVER_BACKGROUND_COLOR = "#f0f0f0";

  constructor() {
    super();

    this.isHover = false;
    this.hasIcon = false;
    this.hasSubText = false;
    this.childViews = [];
    this.hoverHandler = null;
    this.clickHandler = null;

    this.boxView = new electron.BoxLayoutView();
    this.iconView = new electron.ImageView();
    this.textView = new electron.LabelView();
    this.subTextView = new electron.LabelView();

    this.configureLayout();
    this.configureTextViews();
    this.updateChildViews();
    this.bindMouseEvents();
  }

  configureLayout() {
    const size = { width: MenuItemView.WIDTH, height: MenuItemView.HEIGHT };

    this.setPreferredSize(size);
    this.boxView.setPreferredSize(size);
    this.boxView.setOrientation("horizontal");
    this.boxView.setMainAxisAlignment("center");
    this.boxView.setBetweenChildSpacing(8);
    this.boxView.setInsideBorderInsets({
      top: 8,
      left: 8,
      bottom: 8,
      right: 8,
    });
    this.iconView.setPreferredSize({
      width: MenuItemView.ICON_SIZE,
      height: MenuItemView.ICON_SIZE,
    });

    this.addChildView(this.boxView);
    this.updateBackgroundColor();
  }

  configureTextViews() {
    this.textView.setFontSize(14);
    this.textView.setHorizontalAlignment("left");
    this.textView.setVerticalAlignment("center");
    this.textView.setTextColor("#4b4b4b");

    this.subTextView.setFontSize(12);
    this.subTextView.setTextColor("#aaa");
  }

  bindMouseEvents() {
    this.on("mouse-entered", () => this.setHoverState(true));
    this.on("mouse-exited", () => this.setHoverState(false));
    this.on("mouse-pressed", (event) => {
      event.returnValue = true;
    });
    this.on("mouse-released", () => this.clickHandler?.(this));
  }

  setIcon(iconPath) {
    this.hasIcon = Boolean(iconPath);
    if (iconPath) {
      this.iconView.setImage(
        electron.nativeImage.createFromPath(iconPath).resize({
          width: MenuItemView.ICON_SIZE,
          height: MenuItemView.ICON_SIZE,
        }),
      );
    }
    this.updateChildViews();
  }

  setText(text = "") {
    this.textView.setText(text);
    this.updateChildViews();
  }

  setSubText(subText) {
    this.hasSubText = Boolean(subText);
    if (subText) {
      this.subTextView.setText(subText);
    }
    this.updateChildViews();
  }

  setOnHover(handler) {
    this.hoverHandler = handler;
  }

  setOnClick(handler) {
    this.clickHandler = handler;
  }

  setHoverState(isHover) {
    this.isHover = isHover;
    this.updateBackgroundColor();
    this.hoverHandler?.(isHover, this);
  }

  updateChildViews() {
    for (const view of this.childViews) {
      this.boxView.removeChildView(view);
    }

    this.childViews = [
      ...(this.hasIcon ? [this.iconView] : []),
      this.textView,
      ...(this.hasSubText ? [this.subTextView] : []),
    ];

    for (const view of this.childViews) {
      this.boxView.addChildView(view);
    }

    this.boxView.setFlexForView(this.textView, 1);
    this.boxView.sizeToContents();
    this.invalidateLayout();
  }

  updateBackgroundColor() {
    this.setBackgroundColor(
      this.isHover
        ? MenuItemView.HOVER_BACKGROUND_COLOR
        : MenuItemView.NORMAL_BACKGROUND_COLOR,
    );
  }
}

exports.MenuItemView = MenuItemView;
