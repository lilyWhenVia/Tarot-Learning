#!/usr/bin/env node
// 【可选】把 assets/cards 里的 500px RWS 牌面升级为更高清版本。
// 当前环境网络被拦截，无法联网；在能访问 Wikimedia 的机器上运行本脚本即可升级。
//
// 用法: node scripts/download-hires-rws.js [宽度，默认1000]
//   node scripts/download-hires-rws.js 1000
//
// 原理: 读取 assets/cards/rws-manifest.json 里每张牌的 Wikimedia source URL，
//   请求对应的 thumb/<宽度>px 版本，覆盖写回 assets/cards/<local>.jpg。
// 所有图片均为公共领域 Rider-Waite-Smith(1909)，Wikimedia Commons 托管。

const fs = require("fs");
const path = require("path");
const https = require("https");

const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "assets", "cards", "rws-manifest.json");
const width = parseInt(process.argv[2] || "1000", 10);

// 从 thumb URL 推导出指定宽度的 thumb URL（把 /340px- 换成 /<width>px-）
function retargetWidth(url, w) {
  return url.replace(/\/(\d+)px-/, `/${w}px-`);
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "tarot-study/1.0 (educational)" } }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        fs.writeFileSync(dest, Buffer.concat(chunks));
        resolve(Buffer.concat(chunks).length);
      });
    }).on("error", reject);
  });
}

async function main() {
  if (!fs.existsSync(manifestPath)) {
    throw new Error("找不到 assets/cards/rws-manifest.json");
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  console.log(`准备升级 ${manifest.length} 张牌面到 ${width}px 宽...`);

  let ok = 0, fail = 0;
  for (const card of manifest) {
    const url = retargetWidth(card.url, width);
    const dest = path.join(root, card.local);
    try {
      const size = await download(url, dest);
      ok++;
      console.log(`  ✓ ${card.id}  (${Math.round(size / 1024)}KB)`);
    } catch (err) {
      fail++;
      console.warn(`  ✗ ${card.id}: ${err.message}`);
    }
  }
  console.log(`\n完成: 成功 ${ok} / 失败 ${fail}。别忘了 git add assets/cards 并提交。`);
  if (fail > 0) console.log("失败的多半是网络问题，可重跑本脚本(已成功的会被再次覆盖，无副作用)。");
}

main().catch((e) => { console.error(e.message); process.exit(1); });
