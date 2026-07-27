#!/usr/bin/env node
// 把审核模式导出的 approved-cards.json 固化进知识库：
// 读取一个 { "approved": ["fool","wands-01",...] } 文件，
// 把这些卡的 JSON 里的 status 改成 "approved"，其余保持不变。
//
// 用法: node scripts/apply-approvals.js <approved-cards.json 路径>
//   node scripts/apply-approvals.js ~/Downloads/approved-cards.json
// 之后记得 npm run compile-knowledge 重新编译、并 git 提交。

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const inputPath = process.argv[2];

if (!inputPath) {
  console.error("用法: node scripts/apply-approvals.js <approved-cards.json 路径>");
  process.exit(1);
}

function findCardFile(id) {
  for (const dir of ["major", "minor"]) {
    const p = path.join(root, "knowledge", dir, `${id}.json`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function main() {
  const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const approved = Array.isArray(data.approved) ? data.approved : [];
  if (!approved.length) {
    console.log("文件里没有 approved 列表，什么都没改。");
    return;
  }

  let changed = 0, missing = [];
  for (const id of approved) {
    const file = findCardFile(id);
    if (!file) { missing.push(id); continue; }
    const card = JSON.parse(fs.readFileSync(file, "utf8"));
    if (card.status !== "approved") {
      card.status = "approved";
      fs.writeFileSync(file, JSON.stringify(card, null, 2) + "\n", "utf8");
      changed++;
    }
  }

  console.log(`固化完成：${changed} 张改为 approved。`);
  if (missing.length) console.log(`找不到对应文件的 id: ${missing.join(", ")}`);
  console.log("下一步：npm run compile-knowledge，然后 git 提交。");
}

main();
