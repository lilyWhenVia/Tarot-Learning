#!/usr/bin/env node
// 把外包交付的单文件 dict-extract.json（key=牌id, value=dictionary对象）
// 合并进 knowledge/major|minor/<id>.json 的 dictionary 字段，位置在 imageElements 之后、translationDemos 之前（若无则追加到末尾前）。
// 用法：node scripts/merge-dictionary.js [path/to/dict-extract.json]
//   默认读取项目根目录的 dict-extract.json
// 特性：
//   - 校验 key 必须是 78 个合法 id 之一，否则报错列出
//   - 校验每张牌至少有 upright/reversed
//   - 保留原文件其它字段与缩进风格（2 空格）
//   - 只更新交付文件里出现的牌，未出现的牌不动（支持分批交付）

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const inputPath = process.argv[2] || path.join(root, "dict-extract.json");

const MAJOR_IDS = [
  "fool", "magician", "high-priestess", "empress", "emperor", "hierophant",
  "lovers", "chariot", "strength", "hermit", "wheel-of-fortune", "justice",
  "hanged-man", "death", "temperance", "devil", "tower", "star", "moon",
  "sun", "judgement", "world"
];
const SUITS = ["wands", "cups", "swords", "pentacles"];
const RANKS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "page", "knight", "queen", "king"];
const MINOR_IDS = SUITS.flatMap((s) => RANKS.map((r) => `${s}-${r}`));
const ALL_IDS = new Set([...MAJOR_IDS, ...MINOR_IDS]);

function fileForId(id) {
  const major = path.join(root, "knowledge", "major", `${id}.json`);
  const minor = path.join(root, "knowledge", "minor", `${id}.json`);
  if (fs.existsSync(major)) return major;
  if (fs.existsSync(minor)) return minor;
  return null;
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`找不到交付文件：${inputPath}`);
    console.error(`用法：node scripts/merge-dictionary.js [path/to/dict-extract.json]`);
    process.exit(1);
  }

  let extract;
  try {
    extract = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  } catch (err) {
    console.error(`交付文件不是合法 JSON：${err.message}`);
    process.exit(1);
  }

  const ids = Object.keys(extract);
  const badIds = ids.filter((id) => !ALL_IDS.has(id));
  if (badIds.length) {
    console.error(`发现非法牌 id（不在 78 张清单内）：${badIds.join(", ")}`);
    process.exit(1);
  }

  let updated = 0;
  const problems = [];
  for (const id of ids) {
    const dict = extract[id];
    if (!dict || typeof dict !== "object" || (!dict.upright && !dict.reversed)) {
      problems.push(`${id}: 缺少 upright/reversed`);
      continue;
    }
    if (!dict.source) dict.source = "丹尼尔《塔罗解牌字典》";

    const file = fileForId(id);
    if (!file) {
      problems.push(`${id}: 找不到对应的知识库文件`);
      continue;
    }

    const card = JSON.parse(fs.readFileSync(file, "utf8"));
    card.dictionary = dict;

    // 重新按期望的键顺序写出：dictionary 放在 imageElements 之后、translationDemos 之前
    const ordered = {};
    const keys = Object.keys(card);
    const preferredAfter = "imageElements";
    for (const k of keys) {
      if (k === "dictionary") continue; // 稍后按顺序插入
      ordered[k] = card[k];
      if (k === preferredAfter) ordered.dictionary = card.dictionary;
    }
    if (!("dictionary" in ordered)) ordered.dictionary = card.dictionary; // 兜底：没有 imageElements 就放末尾

    fs.writeFileSync(file, JSON.stringify(ordered, null, 2) + "\n", "utf8");
    updated++;
  }

  console.log(`合并完成：更新 ${updated} 张牌的 dictionary 字段（交付含 ${ids.length} 张）。`);
  if (problems.length) {
    console.log(`\n以下问题需处理（${problems.length}）：`);
    problems.forEach((p) => console.log("  · " + p));
  }
  console.log(`\n下一步：node scripts/compile-knowledge.js`);
}

main();
