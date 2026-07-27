#!/usr/bin/env node
// 扫描 assets/cards/*.jpg，映射到卡牌 id，生成 card-images.js（前端 <script> 加载）。
// 输出全局 window.TAROT_CARD_IMAGES = { <cardId>: "assets/cards/<file>.jpg", ... }
//
// 文件名规则:
//   major-NN-<slug>.jpg   → id = <slug>            (如 major-12-hanged-man → "hanged-man")
//   <suit>-01..10-<rank>  → id = <suit>-NN         (如 wands-03-three → "wands-03")
//   <suit>-11..14-<court> → id = <suit>-<court>    (如 wands-11-page → "wands-page")

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const cardsDir = path.join(root, "assets", "cards");
const outFile = path.join(root, "card-images.js");

const COURT = { "11": "page", "12": "knight", "13": "queen", "14": "king" };

function cardIdForFile(file) {
  const base = file.replace(/\.jpg$/i, "");
  const parts = base.split("-");
  const prefix = parts[0];

  if (prefix === "major") {
    // major-NN-slug...  → slug (可能含连字符)
    return parts.slice(2).join("-");
  }

  // 小牌: suit-NN-rank
  const suit = prefix; // wands/cups/swords/pentacles
  const num = parts[1];
  if (COURT[num]) return `${suit}-${COURT[num]}`;
  return `${suit}-${num}`; // wands-01 .. wands-10
}

function main() {
  if (!fs.existsSync(cardsDir)) {
    throw new Error("找不到 assets/cards 目录");
  }
  const files = fs.readdirSync(cardsDir).filter((f) => /\.jpg$/i.test(f)).sort();
  const map = {};
  for (const file of files) {
    const id = cardIdForFile(file);
    if (map[id]) {
      console.warn(`警告: id 冲突 "${id}" (${map[id]} vs ${file})`);
    }
    map[id] = `assets/cards/${file}`;
  }

  const banner = "// 自动生成，请勿手改。源在 assets/cards/*.jpg，改完运行 npm run map-images。\n";
  fs.writeFileSync(outFile, banner + "window.TAROT_CARD_IMAGES = " + JSON.stringify(map, null, 2) + ";\n", "utf8");
  console.log(`卡面图映射完成：${Object.keys(map).length} 张 → ${path.relative(root, outFile)}`);
}

main();
