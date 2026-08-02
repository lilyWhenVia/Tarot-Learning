# 《塔罗解牌字典》(丹尼尔) → JSON 提取 Prompt

把下面「===PROMPT 开始===」到「===PROMPT 结束===」之间的全部内容，连同**一张牌的扫描页图片**（正位约 3 页 + 逆位约 3 页，共约 6 页）一起发给多模态 AI。它会输出一个可直接粘进该牌 JSON 文件的 `dictionary` 字段。

---

===PROMPT 开始===

你是一个 OCR + 结构化转录助手。我会给你几张《塔罗解牌字典》(作者：丹尼尔)的扫描页图片，是**同一张塔罗牌**的内容（先是「XX正位」几页，再是「XX逆位」几页）。

你的任务：**逐字识别图片上的中文，忠实转录**，按下面固定结构输出一个 JSON 对象。

## 铁律
1. **只转录图片上真实存在的文字，一个字都不要编造、不要润色、不要补充。** 图片上没有的内容就省略该字段。
2. 图片是**繁体中文**，请**转换成简体中文**输出（用词不变，只转字形）。
3. 识别不清的字，用你最合理的判断，但不要凭空发挥整句。
4. 只输出 JSON，不要任何解释、前言、markdown 代码块标记。

## 页面固定结构（每张牌都一样）
每个「位」（正位 / 逆位）包含这些区块，图片上的小标题 → JSON 字段名对照如下：

- **心灵与精神层面的提示** → `spirit`（一段话）

- **《人物》** → `person`：
  - 当事人的个性 → `personality`
  - 当事人的工作观 → `workview`
  - 当事人的感情观 → `loveview`
  - 当事人的金钱观 → `moneyview`
  - 与当事人的应对方法 → `howtodeal`
  - 人物代表 → `represents`

- **《工作》** → `work`：
  - 工作本身的状况 → `situation`
  - 如何解决工作的困境 → `solution`
  - 工作中的人际关系 → `relationships`
  - 与上司相处的方法 → `withBoss`
  - 工作的发展性 → `development`
  - 找工作／换工作的状况 → `jobChange`

- **《爱情》** → `love`：
  - 感情本身的状况 → `situation`
  - 新恋情的可能性 → `newRomance`
  - 对这段感情的看法 → `view`
  - 性的吸引力 → `attraction`
  - 如何化解争吵 → `resolveConflict`
  - 分手的方法 → `breakup`
  - 复合的可能性 → `reunion`

- **《友情》** → `friendship`：
  - 我的人际关系状况 → `situation`
  - 如何化解与朋友的误会 → `resolveMisunderstanding`

- **《亲情》** → `family`：
  - 家庭的状况 → `situation`
  - 与长辈的关系 → `elders`
  - 与平辈的关系 → `peers`
  - 与晚辈的关系 → `juniors`

- **《学业》** → `study`：
  - 学业本身的状况 → `situation`
  - 学习的方法 → `method`
  - 与老师相处的关系 → `withTeacher`
  - 与同学相处的关系 → `withClassmates`

- **《财务》** → `finance`：
  - 目前的财务状况 → `situation`
  - 投资的状况 → `investment`
  - 采购的策略 → `purchasing`

- **《延伸应用》** → `extended`（**通常只出现在正位**，逆位若没有就省略整个 extended）：
  - 时间 → `time`（图上常分「相对时间：…」和「标示时间：…」两行，合并成一个字符串，如 `"相对时间：一小时、一天…。标示时间：星期三、水星时。"`）
  - 地点 → `place`（图上常分「区域：…」和「方位：…」，合并成一个字符串，如 `"区域：演讲会、医院…。方位：上方。"`）
  - 物品 → `objects`
  - 身体部位 → `body`

## 输出格式（严格照此）
```
{
  "source": "丹尼尔《塔罗解牌字典》",
  "upright": {
    "spirit": "...",
    "person": { "personality": "...", "workview": "...", "loveview": "...", "moneyview": "...", "howtodeal": "...", "represents": "..." },
    "work": { "situation": "...", "solution": "...", "relationships": "...", "withBoss": "...", "development": "...", "jobChange": "..." },
    "love": { "situation": "...", "newRomance": "...", "view": "...", "attraction": "...", "resolveConflict": "...", "breakup": "...", "reunion": "..." },
    "friendship": { "situation": "...", "resolveMisunderstanding": "..." },
    "family": { "situation": "...", "elders": "...", "peers": "...", "juniors": "..." },
    "study": { "situation": "...", "method": "...", "withTeacher": "...", "withClassmates": "..." },
    "finance": { "situation": "...", "investment": "...", "purchasing": "..." },
    "extended": { "time": "...", "place": "...", "objects": "...", "body": "..." }
  },
  "reversed": {
    "spirit": "...",
    "person": { ... },
    "work": { ... },
    "love": { ... },
    "friendship": { ... },
    "family": { ... },
    "study": { ... },
    "finance": { ... }
  }
}
```

注意：
- `upright` 一般有 `extended`，`reversed` 一般没有（除非逆位页真的印了《延伸应用》）。
- 某个字段图片上找不到，就删掉那个 key，不要留空字符串、不要写「无」。
- 保持字段顺序和上面一致。

现在开始识别我发给你的图片，输出这张牌的 JSON。

===PROMPT 结束===

---

## 拿到 JSON 后怎么用（给 Lily / 开发）
1. 另一个 AI 输出的 JSON 就是某张牌的 `dictionary` 字段的**值**。
2. 打开该牌对应的知识库文件（`knowledge/major/<id>.json` 或 `knowledge/minor/<id>.json`），
   在 `imageElements` 之后、`translationDemos` 之前，加一行 `"dictionary": <粘贴 JSON>,`。
3. 跑 `node scripts/compile-knowledge.js` 重新编译。
4. 78 张牌的文件名(id)清单见下方。

### 卡牌 id 对照（文件名）
**大牌 22**（knowledge/major/）：fool 愚人 · magician 魔术师 · high-priestess 女祭司 · empress 皇后 · emperor 皇帝 · hierophant 教皇 · lovers 恋人 · chariot 战车 · strength 力量 · hermit 隐者 · wheel-of-fortune 命运之轮 · justice 正义 · hanged-man 吊人 · death 死神 · temperance 节制 · devil 恶魔 · tower 高塔 · star 星星 · moon 月亮 · sun 太阳 · judgement 审判 · world 世界

**小牌 56**（knowledge/minor/）：每花色 wands/cups/swords/pentacles ×（01-10 + page 侍从 / knight 骑士 / queen 皇后 / king 国王）
例：wands-01…wands-10, wands-page, wands-knight, wands-queen, wands-king；cups-* / swords-* / pentacles-* 同理。

> 提示：书中牌序按标准伟特，宫廷牌顺序为 侍从→骑士→皇后→国王。渲染某张牌的页可用：
> `pdftoppm -png -r 110 -f <起始页> -l <结束页> ~/books/dict.pdf out`
> 每个位约占 3 页；正位在前、逆位紧随其后。魔术师正位在书页 10-12、逆位 13-15，可据此往后推算。
