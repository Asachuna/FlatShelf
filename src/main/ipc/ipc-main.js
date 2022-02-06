const { ipcMain, app } = require("electron")
const { config } = require("../managers/main-config-manager")
const { folders } = require("../managers/folders/main-folders-manager")
const { contents } = require("../managers/contents/main-contents-manager")
const { executeSearch } = require("../managers/search/main-search-manager")

//------------------------------------
// IPCレシーバー設定
// レンダラーからpreload.js経由で発火したイベントをこちらで受け取る
// 要するにメインプロセス側の通信APIだよ
//------------------------------------
export const registerIpcHandlers = ({ mainWindow }) => {
  //------------------------------------
  // 相互通信：レンダラー⇔メイン
  //------------------------------------

  //------------------------------------
  // 設定関連
  //------------------------------------

  //レンダラープロセスの設定をすべて取得
  ipcMain.handle("get-all-settings", () => {
    return config.getAll()
  })

  //設定を保存する。成功した場合settingsオブジェクト全体、失敗した場合falseを返す
  ipcMain.handle("set-config", (event, { key, value }) => {
    const result = config.set(key, value)
    if (result) {
      return config.getAll()
    } else {
      return false
    }
  })

  //------------------------------------
  // コンテンツ関連
  //------------------------------------

  //コンテンツ新規作成
  ipcMain.handle("create-content", (event, { data }) => {
    return contents.create(data)
  })

  //コンテンツ更新
  ipcMain.handle("update-content", (event, { data }) => {
    return contents.update(data)
  })

  //------------------------------------
  // フォルダ関連
  //------------------------------------

  ipcMain.handle("get-folders-structure", () => {
    return folders.getAll()
  })

  ipcMain.handle("create-new-folder", async (event, { targetID }) => {
    const newFolder = await folders.create(targetID)
    //新しく作ったフォルダも一緒に返す
    return { structure: folders.getAll(), newFolder }
  })

  ipcMain.handle("rename-folder", async (event, { folderID, name }) => {
    await folders.rename(folderID, name)
    return folders.getAll()
  })

  ipcMain.handle(
    "change-parent-folder",
    async (event, { folderID, parentFolderID }) => {
      await folders.changeParent(folderID, parentFolderID)
      return folders.getAll()
    }
  )

  ipcMain.handle("delete-folder", async (event, { folderID }) => {
    await folders.delete(folderID)
    return folders.getAll()
  })

  //------------------------------------
  // 検索関連
  //------------------------------------

  ipcMain.handle("search-content", (event, { query }) => {
    return executeSearch(query)
  })

  //------------------------------------
  // 片道通信：レンダラー→メイン
  //------------------------------------

  //------------------------------------
  // ウィンドウ関連
  //------------------------------------

  ipcMain.on("quit-app", () => {
    app.quit()
  })

  ipcMain.on("minimize-main-window", () => {
    mainWindow.minimize()
  })

  ipcMain.on("toggle-maximized", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.restore()
    } else {
      mainWindow.maximize()
    }
  })

  //------------------------------------
  // 片道通信：メイン→レンダラー
  //------------------------------------

  //------------------------------------
  // ウィンドウ関連
  //------------------------------------

  mainWindow.on("maximize", () => {
    mainWindow.send("toggle-maximized", { isMaximized: true })
  })

  mainWindow.on("unmaximize", () => {
    mainWindow.send("toggle-maximized", { isMaximized: false })
  })
}
