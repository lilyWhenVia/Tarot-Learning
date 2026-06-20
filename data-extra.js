const EXTRA_MAJOR = [
  ["emperor", "IV", "皇帝", "The Emperor", "结构、边界与稳定掌控", ["秩序", "责任", "权威", "边界"], "建立规则、承担责任、让混乱有结构。", "控制欲、僵化、害怕失控，或缺少真正的担当。", "皇帝让力量有边界，让愿景能落地。", "山峰", "王座", "铠甲", "♔", "#b64b3e"],
  ["hierophant", "V", "教皇", "The Hierophant", "传统、传承与共同信念", ["学习", "传统", "导师", "仪式"], "向传统、老师或系统学习，寻找共同认可的道路。", "盲从、教条、只顾规则而忘了真实经验。", "教皇提醒你：知识也需要被传承和验证。", "钥匙", "双柱", "祝福", "钥", "#8f6d3f"],
  ["lovers", "VI", "恋人", "The Lovers", "选择、关系与价值一致", ["关系", "选择", "吸引", "价值"], "关系中的靠近，也代表基于价值观的选择。", "摇摆、诱惑、价值冲突，或关系中缺少诚实。", "恋人不是只有爱情，它问你选择什么样的自己。", "天使", "两人", "树", "心", "#d27b7b"],
  ["chariot", "VII", "战车", "The Chariot", "意志、方向与推进", ["胜利", "控制", "方向", "推进"], "集中意志，驾驭相反力量，向目标推进。", "失控、蛮冲、方向分裂，或外强中干。", "战车的胜利来自驾驭，而不是压制。", "战车", "黑白兽", "城门", "车", "#4f6ea9"],
  ["strength", "VIII", "力量", "Strength", "温柔驯服本能", ["勇气", "耐心", "柔软", "自控"], "用温柔、耐心和内在勇气处理本能冲动。", "逞强、压抑、失去耐心，或被情绪牵着走。", "真正的力量常常是温柔地不退让。", "狮子", "花环", "无限符号", "狮", "#d89a4a"],
  ["hermit", "IX", "隐士", "The Hermit", "独处、内省与寻找真理", ["内省", "孤独", "智慧", "寻找"], "退后一步，向内寻找答案，跟随自己的灯。", "孤立、逃避人群，或把沉默当成优越感。", "隐士拿灯，不是为了炫耀光，而是为了看清路。", "灯", "山路", "斗篷", "灯", "#6f7780"],
  ["wheel-of-fortune", "X", "命运之轮", "Wheel of Fortune", "周期、转折与流动", ["转机", "周期", "命运", "变化"], "局势转动，进入新的周期，顺势调整。", "抗拒变化、重复旧模式，或把一切推给运气。", "轮子会转，你要学会在变化中找到位置。", "轮", "四角", "蛇", "轮", "#c9963f"],
  ["justice", "XI", "正义", "Justice", "因果、判断与平衡", ["公平", "判断", "责任", "真相"], "面对事实，作出清楚判断，承担因果。", "偏见、逃避责任，或只讲道理不看现实。", "正义不是惩罚，它是让事实回到天平上。", "天平", "剑", "红幕", "衡", "#b84040"],
  ["hanged-man", "XII", "倒吊人", "The Hanged Man", "暂停、换位与臣服", ["暂停", "牺牲", "换角度", "等待"], "主动暂停，用不同角度理解局势。", "无意义拖延、被动受困，或不愿放下旧视角。", "倒吊人用暂停换来新的看法。", "倒吊", "光环", "树", "悬", "#6f9b77"],
  ["death", "XIII", "死神", "Death", "结束、转化与更新", ["结束", "转化", "放手", "重生"], "旧阶段结束，清理不再有生命力的部分。", "抗拒结束、停在腐朽关系或旧身份里。", "死神带走旧壳，让新生命有空间。", "白马", "旗帜", "日出", "终", "#30343b"],
  ["temperance", "XIV", "节制", "Temperance", "调和、流动与中道", ["调和", "平衡", "疗愈", "耐心"], "把不同元素调在一起，慢慢恢复流动。", "失衡、过量、急于求成，或无法整合矛盾。", "节制不是折中，而是找到能流动的比例。", "水杯", "道路", "翅膀", "水", "#6aa7b8"],
  ["devil", "XV", "恶魔", "The Devil", "束缚、欲望与看见阴影", ["束缚", "欲望", "依附", "阴影"], "看见被欲望、恐惧或习惯捆住的地方。", "否认依赖、沉迷控制，或把自由交给诱惑。", "恶魔揭露锁链，也提醒锁链可能可以解开。", "锁链", "火把", "黑柱", "链", "#4a3a46"],
  ["tower", "XVI", "高塔", "The Tower", "崩塌、震动与真相显露", ["突变", "崩塌", "觉醒", "释放"], "虚假的结构被击穿，真相突然显露。", "拖延崩塌、害怕改变，或在震动后仍抓住旧墙。", "高塔不是温柔的牌，但它拆掉不真实的东西。", "闪电", "塔", "坠落", "电", "#d06a3c"],
  ["star", "XVII", "星星", "The Star", "希望、疗愈与重新相信", ["希望", "疗愈", "灵感", "清澈"], "经历风暴后重新获得希望和内在清澈。", "失望、信念干涸，或只幻想不滋养现实。", "星星的光不刺眼，但足够让你继续。", "星", "水池", "裸身", "星", "#6da5c8"],
  ["moon", "XVIII", "月亮", "The Moon", "迷雾、潜意识与不确定", ["迷茫", "梦", "恐惧", "直觉"], "进入不确定地带，倾听梦、直觉和潜意识。", "被恐惧放大、误判现实，或沉迷幻想。", "月亮不保证清楚，它训练你在迷雾里辨认感觉。", "月", "两塔", "道路", "月", "#7780b6"],
  ["sun", "XIX", "太阳", "The Sun", "清晰、生命力与喜悦", ["成功", "喜悦", "清晰", "活力"], "事情变得明朗，生命力回升，成果可见。", "短暂低落、自我中心，或不敢完全享受快乐。", "太阳让一切变得简单、明亮、可被看见。", "太阳", "孩子", "白马", "日", "#e8b83e"],
  ["judgement", "XX", "审判", "Judgement", "召唤、觉醒与回应", ["觉醒", "召唤", "复苏", "回应"], "听见内在召唤，回应新的生命阶段。", "逃避召唤、害怕被评价，或沉睡在旧身份里。", "审判问你：听见了以后，要不要回应。", "号角", "升起", "棺木", "召", "#7c8fb6"],
  ["world", "XXI", "世界", "The World", "完成、整合与新的循环", ["完成", "整合", "圆满", "旅程"], "一个阶段完成，经验被整合，准备进入新循环。", "未完成感、卡在收尾，或不愿承认旅程已变。", "世界不是终点，而是一个完整循环的门。", "花环", "四角", "舞者", "界", "#6aa47a"]
];

const MINOR_SPECS = {
  wands: {
    suit: "权杖",
    englishSuit: "Wands",
    glyph: "杖",
    palette: ["#c96a3e", "#f1c46b", "#fff0d8"],
    element: "火元素",
    domain: "行动、热情、创造力",
    symbols: ["火苗", "嫩芽", "远山"]
  },
  cups: {
    suit: "圣杯",
    englishSuit: "Cups",
    glyph: "杯",
    palette: ["#4e8fb8", "#9ed0df", "#edf7f8"],
    element: "水元素",
    domain: "情感、关系、直觉",
    symbols: ["水面", "杯", "月光"]
  },
  swords: {
    suit: "宝剑",
    englishSuit: "Swords",
    glyph: "剑",
    palette: ["#6f7f96", "#d5dbe4", "#f2f5f8"],
    element: "风元素",
    domain: "思想、语言、判断",
    symbols: ["云", "剑锋", "风"]
  },
  pentacles: {
    suit: "星币",
    englishSuit: "Pentacles",
    glyph: "币",
    palette: ["#7a9b62", "#d8bf64", "#f4efd8"],
    element: "土元素",
    domain: "身体、资源、现实成果",
    symbols: ["土地", "星币", "花园"]
  }
};

const NUMBER_MEANINGS = [
  null,
  ["Ace", "一", "种子与机会", ["开始", "潜力", "礼物"], "新的能量进入生活，像一颗刚落地的种子。", "机会未被接住，或潜力还没有找到出口。"],
  ["Two", "二", "选择与平衡", ["选择", "关系", "平衡"], "两个力量彼此照面，需要协调、选择或结盟。", "摇摆、失衡，或不愿承认关系里的张力。"],
  ["Three", "三", "生长与协作", ["成长", "合作", "扩展"], "事情开始向外生长，需要协作和更宽的视野。", "合作不顺、扩展受阻，或成果还不稳定。"],
  ["Four", "四", "结构与稳定", ["稳定", "边界", "基础"], "能量落入结构，适合建立秩序和安全感。", "僵化、停滞，或安全感变成了限制。"],
  ["Five", "五", "冲突与调整", ["冲突", "挑战", "变化"], "旧平衡被打破，问题浮现，逼你调整。", "逃避冲突、内耗，或一直卡在损失感里。"],
  ["Six", "六", "流动与修复", ["修复", "分享", "过渡"], "能量开始重新流动，关系或局面有修复空间。", "停在过去、不愿分享，或过渡过程拖延。"],
  ["Seven", "七", "考验与选择", ["考验", "评估", "坚持"], "你需要辨认真正重要的方向，接受考验。", "分心、防御过度，或选择太多导致失焦。"],
  ["Eight", "八", "推进与熟练", ["推进", "练习", "效率"], "重复练习带来熟练，事情进入加速或深化。", "忙乱、机械重复，或努力没有对准目标。"],
  ["Nine", "九", "临界与积累", ["积累", "独立", "临界"], "接近完成，经验已经积累到可以独立面对。", "疲惫、过度防备，或享受成果时仍不安心。"],
  ["Ten", "十", "完成与承担", ["完成", "结果", "承担"], "一个周期抵达结果，也带来新的责任。", "负担过重、收尾困难，或不愿进入下一阶段。"]
];

const COURTS = [
  ["page", "侍从", "Page", "学习者", ["学习", "消息", "好奇"], "以开放心态接触这组元素，像初学者一样观察。", "幼稚、分心，或只停在兴趣没有行动。"],
  ["knight", "骑士", "Knight", "行动者", ["推进", "追求", "速度"], "这组元素正在行动，带着目标向前冲。", "急躁、偏执，或行动和内在需求不一致。"],
  ["queen", "皇后", "Queen", "内在掌握", ["滋养", "成熟", "感受"], "从内在成熟地掌握这组元素，懂得照料和回应。", "情绪化、过度保护，或把滋养变成控制。"],
  ["king", "国王", "King", "外在掌控", ["领导", "稳定", "表达"], "把这组元素稳定地带到外在世界，形成领导力。", "控制、固执，或权威失去弹性。"]
];

function makeMajorCard(item) {
  const [id, number, name, english, theme, keywords, upright, reversed, memory, s1, s2, s3, glyph, accent] = item;
  return {
    id,
    number,
    name,
    english,
    suit: "大阿卡纳",
    theme,
    keywords,
    upright,
    reversed,
    memory,
    palette: [accent, "#ead7a5", "#f7f1dc"],
    visual: { glyph, center: number, count: 4 },
    symbols: [
      { id: "symbol-a", label: s1, x: 50, y: 24, meaning: `${s1}是这张牌最直接的图像入口，提示“${theme}”的核心主题。`, hint: `看到${s1}，先问：这股力量正在邀请我做什么？` },
      { id: "symbol-b", label: s2, x: 38, y: 55, meaning: `${s2}补充了牌面的情境，让关键词不只是抽象概念，而是可以被读出来的线索。`, hint: `${s2}常常说明这张牌的力量如何在现实中显现。` },
      { id: "symbol-c", label: s3, x: 62, y: 75, meaning: `${s3}指出这张牌的落点：它可能是结果、提醒，也可能是下一步。`, hint: `把${s3}和正逆位放在一起看，牌意会更立体。` }
    ]
  };
}

function makeMinorNumberCard(key, rank) {
  const suit = MINOR_SPECS[key];
  const [englishRank, cnRank, numberTheme, keywords, uprightBase, reversedBase] = NUMBER_MEANINGS[rank];
  const name = `${suit.suit}${cnRank}`;
  return {
    id: `${key}-${String(rank).padStart(2, "0")}`,
    number: cnRank,
    name,
    english: `${englishRank} of ${suit.englishSuit}`,
    suit: suit.suit,
    theme: `${suit.domain}中的${numberTheme}`,
    keywords: [...keywords, suit.element],
    upright: `${uprightBase} 在${suit.suit}里，它具体表现为${suit.domain}的展开。`,
    reversed: `${reversedBase} 在${suit.suit}里，常见为${suit.domain}失去自然流动。`,
    memory: `${suit.suit}${cnRank} = ${suit.element}的${numberTheme}。`,
    palette: suit.palette,
    visual: { glyph: suit.glyph, center: cnRank, count: rank },
    symbols: [
      { id: "element", label: suit.symbols[0], x: 50, y: 24, meaning: `${suit.symbols[0]}代表${suit.element}，把牌意带回${suit.domain}。`, hint: `先认元素，再看数字。` },
      { id: "number", label: `${cnRank}的数量`, x: 38, y: 55, meaning: `${cnRank}提示${numberTheme}，是理解这张小阿卡纳的数字骨架。`, hint: `数字回答“发展到哪一步了”。` },
      { id: "scene", label: suit.symbols[2], x: 62, y: 75, meaning: `${suit.symbols[2]}提供情境，让这张牌从关键词变成可读的画面。`, hint: `场景回答“这股能量在哪里发生”。` }
    ]
  };
}

function makeCourtCard(key, court, index) {
  const suit = MINOR_SPECS[key];
  const [idSuffix, cnTitle, englishTitle, courtTheme, keywords, uprightBase, reversedBase] = court;
  return {
    id: `${key}-${idSuffix}`,
    number: cnTitle,
    name: `${suit.suit}${cnTitle}`,
    english: `${englishTitle} of ${suit.englishSuit}`,
    suit: suit.suit,
    theme: `${suit.domain}中的${courtTheme}`,
    keywords: [...keywords, suit.element],
    upright: `${uprightBase} 在${suit.suit}里，重点落在${suit.domain}。`,
    reversed: `${reversedBase} 在${suit.suit}里，容易表现为${suit.domain}的失衡。`,
    memory: `${suit.suit}${cnTitle} = 用${courtTheme}来表达${suit.element}。`,
    palette: suit.palette,
    visual: { glyph: suit.glyph, center: cnTitle.slice(0, 1), count: index + 1 },
    symbols: [
      { id: "role", label: cnTitle, x: 50, y: 24, meaning: `${cnTitle}说明这张牌的人格角色：${courtTheme}。`, hint: `宫廷牌先看“谁在使用这股元素”。` },
      { id: "element", label: suit.symbols[1], x: 38, y: 55, meaning: `${suit.symbols[1]}把角色带回${suit.element}，对应${suit.domain}。`, hint: `角色加元素，就是宫廷牌的读法。` },
      { id: "expression", label: "姿态", x: 62, y: 75, meaning: `姿态象征这股元素是学习、行动、滋养，还是掌控。`, hint: `看它是在接收、追逐、照料，还是领导。` }
    ]
  };
}

function createMinorCards() {
  return Object.keys(MINOR_SPECS).flatMap((key) => [
    ...Array.from({ length: 10 }, (_, index) => makeMinorNumberCard(key, index + 1)),
    ...COURTS.map((court, index) => makeCourtCard(key, court, index))
  ]);
}

TAROT_CARDS.push(...EXTRA_MAJOR.map(makeMajorCard), ...createMinorCards());
