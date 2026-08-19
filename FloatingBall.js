/// <reference types="./electron.d.ts" />

const electron = require("electron");
const path = require("path");

const WIDTH = 60;
const HEIGHT = 65;
const SPRITE_ROWS = 11;
const SPRITE_COLUMNS = 8;
const SPRITE_ROW = 5;
const FRAME_INTERVAL_MS = 250;
const RIGHT_MOUSE_BUTTON_FLAG = 8192;

class FloatingBall extends electron.BaseWindow {
  constructor() {
    super({
      type: "panel",
      frame: false,
      transparent: true,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      minimizable: false,
      maximizable: false,
      hasShadow: false,
      roundedCorners: false,
      hiddenInMissionControl: true,
      width: WIDTH,
      height: HEIGHT,
      focusable: false,
    });

    this.setAlwaysOnTop(true, "floating");

    const view = new FloatingBallView(this);
    this.contentView.addChildView(view);
    view.sizeToContents();
  }
}

class FloatingBallView extends electron.View {
  constructor(window) {
    super();

    this.window = window;
    this.dragOffset = null;
    this.row = SPRITE_ROW;
    this.column = 0;
    this.boxView = new electron.BoxLayoutView();
    this.boxView.setOrientation("vertical");
    this.addChildView(this.boxView);

    this.spriteSheet = electron.nativeImage
      .createFromPath(
        path.join(__dirname, "rocky-spritesheet-v5-transparent.png"),
      )
      .resize({
        width: WIDTH * SPRITE_COLUMNS,
        height: HEIGHT * SPRITE_ROWS,
      });
    this.imageView = new electron.ImageView();
    this.updateFrame();
    this.imageView.setPreferredSize({ width: WIDTH, height: HEIGHT });
    this.boxView.addChildView(this.imageView);
    this.boxView.sizeToContents();
    this.setPreferredSize({ width: WIDTH, height: HEIGHT });
    this.animationTimer = null;

    this.on("mouse-pressed", (event) => {
      this.window.emit("pet-click");

      if (event.changedButtonFlags & RIGHT_MOUSE_BUTTON_FLAG) {
        this.dragOffset = null;
        this.window.emit(
          "menu-request",
          electron.screen.getCursorScreenPoint(),
        );
        return;
      }

      event.returnValue = true;
      const cursor = electron.screen.getCursorScreenPoint();
      const [windowX, windowY] = this.window.getPosition();
      this.dragOffset = { x: cursor.x - windowX, y: cursor.y - windowY };
    });

    this.on("mouse-dragged", () => {
      if (!this.dragOffset) return;

      const cursor = electron.screen.getCursorScreenPoint();
      this.window.setPosition(
        cursor.x - this.dragOffset.x,
        cursor.y - this.dragOffset.y,
      );
    });

    const stopDragging = () => {
      this.dragOffset = null;
    };
    this.on("mouse-released", stopDragging);
    this.on("mouse-capture-lost", stopDragging);

    this.animationTimer = setInterval(() => {
      this.column = (this.column + 1) % SPRITE_COLUMNS;
      this.updateFrame();
    }, FRAME_INTERVAL_MS);
  }

  updateFrame() {
    this.imageView.setImage(
      this.spriteSheet.crop({
        x: this.column * WIDTH,
        y: this.row * HEIGHT,
        width: WIDTH,
        height: HEIGHT,
      }),
    );
  }
}

exports.FloatingBall = FloatingBall;
