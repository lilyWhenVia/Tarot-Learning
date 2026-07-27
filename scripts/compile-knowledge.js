#!/usr/bin/env node
// 读取 knowledge/**/*.json，校验字段，编译成一个前端可直接 <script> 加载的 knowledge-compiled.js。
// 输出两个全局：
//   window.TAROT_KNOWLEDGE_CARDS  —— 按 id 索引的全部卡牌知识（含 draft 和 approved）
//   window.TAROT_KNOWLEDGE_META   —— 编译信息（统计、每张状态、校验警告）
// 设计成无构建也能跑：dev 用 python3 -m http.server 时，先跑一次本脚本即可。

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const knowledgeDir = path.join(root, "knowledge");
const outFile = path.join(root, "knowledge-compiled.js");

const REQUIRED = ["id", "name", "english", "arcana", "status", "coreEnergy", "meanings"];
const VALID_STATUS = ["draft", "approved"];

function readJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const full = path.join(dir, entry.name);
    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(full, "utf8"));
    } catch (err) {
      throw new Error(`JSON 解析失败 ${path.relative(root, full)}: ${err.message}`);
    }
    out.push({ file: path.relative(root, full), data: parsed });
  }
  return out;
}

function validate(card, file, warnings) {
  const missing = REQUIRED.filter((f) => card[f] === undefined || card[f] === null || card[f] === "");
  if (missing.length) {
    throw new Error(`${file}: 缺少必填字段 ${missing.join(", ")}`);
  }
  if (!VALID_STATUS.includes(card.status)) {
    throw new Error(`${file}: status 必须是 draft 或 approved，当前是 "${card.status}"`);
  }
  if (!card.coreEnergy || !card.coreEnergy.oneLine) {
    throw new Error(`${file}: coreEnergy.oneLine 必填`);
  }
  if (!card.meanings || !card.meanings.upright || !card.meanings.reversed) {
    throw new Error(`${file}: meanings.upright 和 meanings.reversed 必填`);
  }
  // 软校验：内容完整度提醒（不阻断，仅进审核模式提示）
  const softFields = ["applications", "imageElements", "translationDemos", "keywords", "sources"];
  const thin = softFields.filter((f) => {
    const v = card[f];
    if (v === undefined || v === null) return true;
    if (Array.isArray(v) && v.length === 0) return true;
    if (typeof v === "object" && Object.keys(v).length === 0) return true;
    return false;
  });
  if (thin.length) {
    warnings.push(`${file} (${card.id}/${card.status}): 待补充字段 ${thin.join(", ")}`);
  }
}

function main() {
  const files = [
    ...readJsonFiles(path.join(knowledgeDir, "major")),
    ...readJsonFiles(path.join(knowledgeDir, "minor"))
  ];

  const cards = {};
  const perCard = [];
  const warnings = [];
  const seen = new Set();

  for (const { file, data } of files) {
    validate(data, file, warnings);
    if (seen.has(data.id)) {
      throw new Error(`重复的卡牌 id: ${data.id}（${file}）`);
    }
    seen.add(data.id);
    cards[data.id] = data;
    perCard.push({ id: data.id, name: data.name, arcana: data.arcana, status: data.status, file });
  }

  const approved = perCard.filter((c) => c.status === "approved").length;
  const meta = {
    version: 1,
    total: perCard.length,
    approved,
    draft: perCard.length - approved,
    cards: perCard,
    warnings
  };

  const banner = "// 自动生成，请勿手改。源在 knowledge/**/*.json，改完运行 npm run compile-knowledge。\n";
  const body =
    banner +
    "window.TAROT_KNOWLEDGE_CARDS = " + JSON.stringify(cards, null, 2) + ";\n" +
    "window.TAROT_KNOWLEDGE_META = " + JSON.stringify(meta, null, 2) + ";\n";

  fs.writeFileSync(outFile, body, "utf8");

  console.log(`编译完成：${perCard.length} 张（approved ${approved} / draft ${meta.draft}）→ ${path.relative(root, outFile)}`);
  if (warnings.length) {
    console.log(`\n内容完整度提醒（${warnings.length}）：`);
    warnings.forEach((w) => console.log("  · " + w));
  }
}

main();
