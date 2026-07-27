# 交接文档 · 塔罗学习网站知识库重建

最后更新：2026-07-27

这份文档让你在任何一台新电脑上无痛接手。读完这一页就能继续工作。

---

## 一句话现状

已把塔罗学习网站的知识库从「模板拼出来的假内容」重建成「每张牌一个 JSON、权威可审核」的真实知识库。**全部 78 张(22 大牌 + 56 小牌)草稿已完成、编译通过、推送到 GitHub，全部 status: draft，等待用户在「知识库审核」模式分批审核通过。** 22 张大牌已额外经过一轮独立准确性复核并修正。

### 进度快照(2026-07-27)
- ✅ 22 张大阿卡纳：已写 + 已独立审核 + 已修正瑕疵
- ✅ 56 张小阿卡纳：权杖/圣杯/宝剑/星币 四花色各 14 张，已写 + 编译/结构审计通过
- ⏳ 下一步：用户审核 → 把满意的 `status` 改为 `"approved"` → `npm run compile-knowledge` 上线
- ⏳ 小牌尚未做像大牌那样的逐张独立准确性复核(可选)

### 重要环境问题(务必知道)
Workflow/Agent 子代理路径在本环境**不可用**：代理服务器(localhost:7001)把子代理请求路由到 `claude-opus-5` 时报 422(`role "system"` 不被接受)，秒失败、0 产出。因此 56 张小牌是**主循环直接手写**的，不能靠并行子代理批量生成。若换环境后子代理恢复，可用 workflow 加速后续的审核/复核。

## 核心痛点（所有内容设计的出发点）

用户能理解单张牌的意象，但**不知道怎么把牌意结合到实际问题上应用**（牌意 → 结合真实问题 → 落地建议）。所以每张牌内容的重心是：
1. `applications` —— 同一股能量在事业/感情/自我/财运四个领域里「具体长什么样」
2. `translationDemos` —— 三步翻译公式示范（抓能量 → 投射领域 → 落地建议）

不是背关键词。

## 架构（用户 2026-07-27 拍板的四个决策）

1. **知识库格式**：每张牌一个 JSON 文件
   - 大牌：`knowledge/major/<id>.json`
   - 小牌：`knowledge/minor/<id>.json`
   - 字段规范见 `knowledge/SCHEMA.md`
2. **审核门控**：每张牌带 `status: "draft" | "approved"`
   - 只有 `approved` 才渲染到正式学习界面
   - `draft` 在正式界面回退到旧 `data.js` 内容
   - App 里有「知识库审核」模式，预览草稿 + 来源
3. **首批范围**：先做 22 张大牌作样板，验收后再做 56 张小牌
4. **权威来源**：经典英文 RWS 体系 —— Waite《The Pictorial Key to the Tarot》、Rachel Pollack《78 Degrees of Wisdom》、Biddy Tarot

## 工作流

```bash
cd ~/tarot-study

# 1. 编译知识库（读 knowledge/**/*.json → 生成 knowledge-compiled.js）
npm run compile-knowledge

# 2. 本地预览
python3 -m http.server 8000
# 打开 http://localhost:8000 → 点顶部「知识库审核」

# 3. 全量校验（语法 + 编译 + 构建检查）
npm test

# 4. 构建静态站
npm run build
```

## 关键文件

| 文件 | 作用 |
|---|---|
| `knowledge/SCHEMA.md` | 每张牌 JSON 的字段规范（先读这个） |
| `knowledge/major/fool.json` | ✅ 已验收的样板牌，照它的深度和语气产出其余牌 |
| `scripts/compile-knowledge.js` | 编译器：校验字段、生成 `knowledge-compiled.js`、报告内容完整度 |
| `knowledge-compiled.js` | 自动生成，勿手改。挂 `window.TAROT_KNOWLEDGE_CARDS` / `TAROT_KNOWLEDGE_META` |
| `app.js` | `KnowledgePanel`（渲染知识库）、`ReviewMode`（审核模式）、`getApprovedKnowledge()` |
| `data.js` | 原始卡牌数据（fool/magician/high-priestess/empress 手写，其余是模板） |
| `data-extra.js` | 18 张大牌 + 56 张小牌，由模板函数生成 |
| `handoff/CONVERSATION.md` | 本次 agent 完整对话（可读版） |
| `handoff/session-*.jsonl` | 本次 agent 原始记录 |

## 22 张大牌 ID 清单（产出剩余牌时按此对齐）

`data.js` 里：`fool` ✅、`magician`、`high-priestess`、`empress`

`data-extra.js` 里：`emperor`、`hierophant`、`lovers`、`chariot`、`strength`、`hermit`、`wheel-of-fortune`、`justice`、`hanged-man`、`death`、`temperance`、`devil`、`tower`、`star`、`moon`、`sun`、`judgement`、`world`

> JSON 文件的 `id` 必须和这里完全一致，编译时按 id 合并覆盖旧数据。

## 下一步（TODO）

- [ ] 产出剩余 21 张大牌的 `knowledge/major/<id>.json`（status: draft），照 fool.json 标准
- [ ] 用户在「知识库审核」模式分批审核，满意的改成 `approved` 再 `npm run compile-knowledge`
- [ ] 22 张大牌全部 approved 后，开始 56 张小牌
- [ ] （可选）把「愚人之旅」学习路径、间隔重复记忆卡片做成模块

## 环境注意

- 这是纯静态站：CDN 引入 React，全局变量挂载，`python3 -m http.server` 直接跑，**没有前端构建步骤**
- 翻译训练场的 API Key 只存浏览器 localStorage，仓库里不含任何密钥
- 本环境 `WebFetch` 被网络策略拦截，核对来源只能用 web 搜索摘要
