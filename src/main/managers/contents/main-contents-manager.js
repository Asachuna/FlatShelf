//------------------------------------
// コンテンツ管理 for メインプロセス
//------------------------------------
const { imageManager } = require("./main-image-manager")
const log = require("electron-log")
const fileType = require("file-type")
const { Content } = require("../../initializers/init-db")
const { Op } = require("sequelize")

class ContentsManager {
  //コンテンツを登録する
  async create(data) {
    //ファイルの種類を判定
    const fileInfo = await fileType.fromFile(data.filePath)
    const type = fileInfo.mime.split("/")[0]
    try {
      //コンテンツの種類によって担当するマネージャーを変える
      //現状では対応していないファイルタイプもインポートできてしまうので注意
      switch (type) {
        case "image":
          return await imageManager.create(data)
        case "aaa":
          console.log(data)
      }
    } catch (err) {
      //登録に失敗した場合
      log.error(err)
      return false
    }
  }

  //これ別マネージャーに分けるかも
  async search(query) {
    const result = await Content.findAll({
      where: {
        name: {
          [Op.like]: `%${query.searchWord}%`
        }
      }
    })
    return result
  }
}

export const contents = new ContentsManager()
