# 塔罗图像学习

一个轻量的本地网页应用，用图像元素来学习塔罗牌意。

## 打开方式

直接用浏览器打开 `index.html` 即可。

也可以在当前目录启动一个本地静态服务：

```powershell
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

如果图片在 `file://` 打开方式下不稳定，推荐直接双击 `start-tarot.bat`，它会用本地服务器打开：

```text
http://localhost:8765
```

## 目前包含

- 学习页：选择牌卡，点击牌面符号查看象征含义。
- 练习页：随机给出图像元素，练习联想到对应牌与牌意。
- 牌库页：记录每张牌的学习状态，数据保存在浏览器本地。
- 完整牌库：已包含 78 张塔罗牌，大阿卡纳与四组小阿卡纳都可学习和练习。

## 扩展牌卡

牌卡数据在 `data.js`。新增牌时复制一个对象，保持这些字段：

- `id`：唯一标识
- `number`：牌号
- `name` / `english`：中英文名
- `theme` / `keywords`：主题与关键词
- `upright` / `reversed`：正逆位含义
- `symbols`：可点击图像元素，`x` 和 `y` 是元素在牌面中的百分比位置

## 下载本地维特牌图

项目里有一份 78 张 Rider-Waite-Smith 图片清单：`assets/cards/rws-manifest.json`。

如果你的网络能访问 Wikimedia，可以运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\download-rws.ps1
```

这些图片资源当前不在学习页面展示，作为以后需要参考原始牌图时的备用素材。

如果 PowerShell 提示脚本不存在，通常是因为当前目录不在项目文件夹。可以先运行：

```powershell
cd "C:\Users\伍肆柒\Documents\tarot study"
powershell -ExecutionPolicy Bypass -File .\scripts\download-rws.ps1
```

也可以直接双击项目根目录里的 `download-rws.bat`。
