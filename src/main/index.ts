import { app, BrowserWindow } from "electron";
import { ChildProcess, exec } from "child_process";
import { ipcMain } from "electron";
import { IpcMainEvent } from "electron/main";

let mainWindow: BrowserWindow;
const isDev: boolean = process.env.ELECTRON_ENV == "dev";
let goServerProcess: ChildProcess;

// listen for message to kill whole app

const renderWindow = async () => {
  startGoServer();
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 500,
    center: true,
    webPreferences: {
      nodeIntegration: true,
      devTools: isDev,
    },
  });

  // Depending on the environment the frontend will either load from the react server or the static html file
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000/");
  } else {
    mainWindow.loadFile("./build/index.html");
  }

  // Detect if devtools was somehow opened outside development
  mainWindow.webContents.on("devtools-opened", () => {
    if (!isDev) {
      mainWindow.webContents.closeDevTools();
    }
  });
};

const startGoServer = () => {
  goServerProcess = exec("electron-golang-ws.exe");
};

app.on("ready", renderWindow);

// clicks X button to close whole app
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    mainWindow.webContents.send("kill-app");
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    renderWindow();
  }
});

// listens for a successful connection from renderer.
// renderer is just communicating a successful connection
ipcMain.on("render-go", (event: IpcMainEvent, args) => {
  console.log(args);
});

ipcMain.on("kill-backend", (_, args) => {
  mainWindow.webContents.send("kill-app");
});

ipcMain.on("backend-killed", (_, args) => {
  // Go server has been killed and now just to kill the server
  app.quit();
});
