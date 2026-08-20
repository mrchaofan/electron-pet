const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { packager } = require("@electron/packager");
const config = require("../electron-packager.json");

const APP_NAME = config.name;
const ELECTRON_ZIP_DIR = path.join(__dirname, "..", config.electronZipDir);
const ELECTRON_ZIP_NAME = `electron-v${config.electronVersion}-${config.platform}-${config.arch}.zip`;
const ELECTRON_ZIP_PATH = path.join(ELECTRON_ZIP_DIR, ELECTRON_ZIP_NAME);

async function main() {
  if (!fs.existsSync(ELECTRON_ZIP_PATH)) {
    throw new Error(`Missing Electron ZIP: ${ELECTRON_ZIP_PATH}`);
  }

  const [appPath] = await packager({
    ...config,
    dir: path.join(__dirname, "..", config.dir),
    out: path.join(__dirname, "..", config.out),
    electronZipDir: ELECTRON_ZIP_DIR,
    ignore: config.ignore.map((pattern) => new RegExp(pattern)),
  });

  console.log("Packaged app:", appPath);

  const zipName = `${APP_NAME}-${config.platform}-${config.arch}.zip`;
  const appDir = path.dirname(appPath);
  const appBase = path.basename(appPath);

  execFileSync("zip", ["-r", "-y", zipName, appBase], {
    cwd: appDir,
    stdio: "inherit",
  });

  console.log("Zipped app:", path.join(appDir, zipName));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
