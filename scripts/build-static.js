const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const checkOnly = process.argv.includes("--check-only");

const requiredFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "data.js",
  "data-extra.js",
  "knowledge-base.js",
  "knowledge-compiled.js",
  "card-images.js",
  "insight-engine.js",
  "translation-gym.js",
  "README.md"
];

const requiredDirs = [
  "vendor",
  "assets"
];

function assertExists(relativePath) {
  const target = path.join(root, relativePath);
  if (!fs.existsSync(target)) {
    throw new Error(`Missing required build input: ${relativePath}`);
  }
}

function removeDir(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function copyFile(relativePath) {
  const from = path.join(root, relativePath);
  const to = path.join(dist, relativePath);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function copyDir(relativePath) {
  const from = path.join(root, relativePath);
  const to = path.join(dist, relativePath);
  copyDirRecursive(from, to);
}

function copyDirRecursive(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(source, target);
    } else if (entry.isFile()) {
      fs.copyFileSync(source, target);
    }
  }
}

function getHtmlReferences() {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  return [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1].split("?")[0])
    .filter((ref) => ref && !/^https?:\/\//i.test(ref));
}

function generateKnowledgeBaseCards() {
  const context = {
    window: {}
  };
  vm.createContext(context);
  ["data.js", "data-extra.js", "knowledge-base.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
  });
  const cards = context.window.TAROT_KNOWLEDGE_BASE || [];
  if (!cards.length) {
    throw new Error("Knowledge base export failed: no cards generated.");
  }
  return cards;
}

function buildKnowledgeBaseJson() {
  const cards = generateKnowledgeBaseCards();
  fs.writeFileSync(
    path.join(dist, "tarot-knowledge-base.json"),
    JSON.stringify({ version: 1, cards }, null, 2),
    "utf8"
  );
}

function generateInsightEngineData() {
  const context = {
    window: {}
  };
  vm.createContext(context);
  ["data.js", "data-extra.js", "knowledge-base.js", "insight-engine.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
  });
  const ragDb = context.window.TAROT_RAG_DB || [];
  if (!ragDb.length) {
    throw new Error("RAG export failed: no snippets generated.");
  }
  return {
    ragDb,
    sampleInsight: context.window.generateTarotInsight(context.window.TAROT_KNOWLEDGE_BASE[0])
  };
}

function buildRagDbJson() {
  const { ragDb } = generateInsightEngineData();
  fs.writeFileSync(
    path.join(dist, "tarot-rag-db.json"),
    JSON.stringify({ version: 1, snippets: ragDb }, null, 2),
    "utf8"
  );
}

function main() {
  [...requiredFiles, ...requiredDirs].forEach(assertExists);

  const missingRefs = getHtmlReferences().filter((ref) => !fs.existsSync(path.join(root, ref)));
  if (missingRefs.length) {
    throw new Error(`Missing files referenced by index.html: ${missingRefs.join(", ")}`);
  }

  if (checkOnly) {
    generateKnowledgeBaseCards();
    generateInsightEngineData();
    console.log("Build inputs verified.");
    return;
  }

  removeDir(dist);
  fs.mkdirSync(dist, { recursive: true });
  requiredFiles.forEach(copyFile);
  requiredDirs.forEach(copyDir);
  buildKnowledgeBaseJson();
  buildRagDbJson();
  console.log(`Built static site into ${path.relative(root, dist)}`);
}

main();
