# 塔罗知识库 Schema（v1）

每张牌一个 JSON 文件：
- 大阿卡纳：`knowledge/major/<id>.json`（如 `fool.json`）
- 小阿卡纳：`knowledge/minor/<id>.json`（如 `wands-01.json`）

`id` 必须与 `data.js` / `data-extra.js` 里现有的卡牌 `id` 完全一致，编译时按 `id` 合并覆盖旧数据。

## 设计原则

内容围绕用户的核心痛点设计：**「能理解牌意，但不知道怎么结合到实际问题上应用」**。
所以每张牌的重心不在背关键词，而在：
1. `applications` —— 同一股能量在 4 个真实生活领域里「具体长什么样」。
2. `translationDemos` —— 用三步翻译公式做出的完整示范，让用户看到「牌意 → 领域 → 落地建议」的推理链条。

## 字段结构

```jsonc
{
  "id": "fool",                    // 必填，对应现有卡牌 id
  "name": "愚人",                  // 必填，中文名
  "english": "The Fool",           // 必填
  "number": "0",                   // 大牌数字 / 小牌点数
  "arcana": "major",               // "major" | "minor"
  "suit": null,                    // 小牌花色 wands/cups/swords/pentacles；大牌为 null

  "status": "draft",               // "draft" | "approved" —— 只有 approved 才渲染到正式界面
  "reviewNotes": "",               // 你审核时的批注，留空即可

  "coreEnergy": {                  // 核心能量：这张牌最本质的一团能量
    "oneLine": "带着信任跨入未知的第一步。",   // 一句话，用户先记这个
    "expanded": "愚人不是无知，而是……"        // 2-4 句展开，解释能量的方向和张力
  },

  "keywords": {                    // 正逆位各 3-5 个核心关键词
    "upright": ["开始", "冒险", "信任"],
    "reversed": ["鲁莽", "逃避", "准备不足"]
  },

  "meanings": {                    // 通用牌意（不分领域）
    "upright": "正位完整含义……",
    "reversed": "逆位完整含义……"
  },

  "applications": {                // ⭐ 四领域应用，每个领域正逆位分开，给现实指引
    "career":  { "upright": "在事业上，愚人正位意味着……具体表现是……", "reversed": "……" },
    "love":    { "upright": "……", "reversed": "……" },
    "self":    { "upright": "……", "reversed": "……" },
    "money":   { "upright": "……", "reversed": "……" }
  },

  "imageElements": [               // 牌面象征元素，x/y 是百分比坐标（点击热点用）
    {
      "id": "cliff",
      "label": "悬崖",
      "x": 61, "y": 75,           // 0-100，牌面上的位置
      "meaning": "悬崖象征未知的边界与风险……",
      "prompt": "看到悬崖时先问：我正站在哪一步的边缘？"   // 引导思考的问题
    }
  ],

  "translationDemos": [            // ⭐ 三步翻译公式示范（针对痛点）
    {
      "question": "我该不该辞职去创业？",
      "domain": "career",
      "step1_energy": "第一步·抓核心能量：愚人的核心是……",
      "step2_projection": "第二步·投射到领域：把这股能量放到辞职创业上……",
      "step3_action": "第三步·落地建议：所以给你的具体行动是……"
    }
  ],

  "combos": [                      // 常见牌组合解读，2-3 个
    { "with": "death", "reading": "愚人 + 死神：一个天真的开始遇上彻底的结束……" }
  ],

  "numerology": "愚人=0：0 是未成形的潜能……",   // 数字学与在愚人之旅中的位置

  "sources": [                     // 权威来源，可追溯，审核时核对用
    "A.E. Waite《The Pictorial Key to the Tarot》",
    "Rachel Pollack《78度智慧》",
    "Biddy Tarot: biddytarot.com/tarot-card-meanings/major-arcana/fool"
  ]
}
```

## 必填字段（编译时校验）

`id`, `name`, `english`, `arcana`, `status`, `coreEnergy.oneLine`, `meanings.upright`, `meanings.reversed`。

其余字段建议尽量填全；缺失时前端会显示「该字段待补充」提示（仅审核模式可见）。

## 审核流程

1. Agent 撰写内容 → `status: "draft"`，附 `sources`。
2. 你在「审核模式」下预览草稿，核对来源、修改内容。
3. 满意后把 `status` 改成 `"approved"`。
4. 只有 `approved` 的牌才在正式学习界面显示新内容；`draft` 的牌回退到旧的 `data.js` 内容，并在审核模式下带来源与「未审核」标记。
