const path = require("path");
const { execFileSync } = require("child_process");
const { packager } = require("@electron/packager");
const config = require("../electron-packager.json");

const APP_NAME = config.name;

async function main() {
  const [appPath] = await packager({
    ...config,
    dir: path.join(__dirname, "..", config.dir),
    out: path.join(__dirname, "..", config.out),
    electronZipDir: path.join(__dirname, "..", config.electronZipDir),
    ignore: config.ignore.map((pattern) => new RegExp(pattern)),
  });

  console.log("Packaged app:", appPath);

  const zipName = `${APP_NAME}-darwin-arm64.zip`;
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
