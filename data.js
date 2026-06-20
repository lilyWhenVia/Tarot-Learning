const TAROT_CARDS = [
  {
    id: "fool",
    number: "0",
    name: "愚人",
    english: "The Fool",
    suit: "大阿卡纳",
    theme: "信任未知，开始旅程",
    keywords: ["开始", "冒险", "自由", "天真", "信任"],
    upright: "新的开始、开放心态、愿意进入未知。它提醒你保持轻盈，但也要看见脚下的现实。",
    reversed: "鲁莽、逃避后果、准备不足，或因为害怕显得幼稚而不敢迈出第一步。",
    memory: "愚人不是无知的人，而是愿意带着信任上路的人。",
    palette: ["#f6d77a", "#74a7d9", "#f7f1dc"],
    localImageUrl: "assets/cards/major-00-fool.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/RWS_Tarot_00_Fool.jpg/340px-RWS_Tarot_00_Fool.jpg",
    imageSource: "https://commons.wikimedia.org/wiki/File:RWS_Tarot_00_Fool.jpg",
    imageCredit: "Rider-Waite-Smith Tarot, Wikimedia Commons",
    symbols: [
      {
        id: "sun",
        label: "太阳",
        x: 78,
        y: 12,
        meaning: "太阳象征生命力、祝福和清明的意识。它让愚人的冒险带着一种被照亮的信任。",
        hint: "这张牌的天真不是黑暗里的乱闯，而是带着光的出发。"
      },
      {
        id: "cliff",
        label: "悬崖",
        x: 61,
        y: 75,
        meaning: "悬崖代表未知边界。它既是风险，也是跨入新阶段前的门槛。",
        hint: "愚人的关键张力：自由和风险同时存在。"
      },
      {
        id: "dog",
        label: "小狗",
        x: 35,
        y: 69,
        meaning: "小狗像本能、提醒和陪伴。它可能在鼓励，也可能在提醒愚人看路。",
        hint: "直觉不是噪音，它常常是行动前的最后提醒。"
      },
      {
        id: "rose",
        label: "白玫瑰",
        x: 38,
        y: 34,
        meaning: "白玫瑰象征纯真、开放和未被复杂欲望污染的初心。",
        hint: "愚人的力量来自简单，而不是经验丰富。"
      }
    ]
  },
  {
    id: "magician",
    number: "I",
    name: "魔术师",
    english: "The Magician",
    suit: "大阿卡纳",
    theme: "意志显化，资源整合",
    keywords: ["行动", "创造", "专注", "掌控", "显化"],
    upright: "把想法变成现实，调动已有资源，清楚表达意图并采取行动。",
    reversed: "操控、浮夸、资源使用失衡，或明明有工具却迟迟不开始。",
    memory: "魔术师的魔法不是凭空出现，而是把天上的意图带到地上的行动。",
    palette: ["#c7423f", "#f2df9b", "#ffffff"],
    localImageUrl: "assets/cards/major-01-magician.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/RWS_Tarot_01_Magician.jpg/340px-RWS_Tarot_01_Magician.jpg",
    imageSource: "https://commons.wikimedia.org/wiki/File:RWS_Tarot_01_Magician.jpg",
    imageCredit: "Rider-Waite-Smith Tarot, Wikimedia Commons",
    symbols: [
      {
        id: "infinity",
        label: "无限符号",
        x: 50,
        y: 13,
        meaning: "无限符号代表意识流动、潜能循环和更高意志的连接。",
        hint: "魔术师先连接意图，再让意图落地。"
      },
      {
        id: "wand",
        label: "权杖",
        x: 35,
        y: 22,
        meaning: "举起的权杖指向上方，象征把灵感、意志和火元素引入现实。",
        hint: "上方的灵感需要下方的执行来承接。"
      },
      {
        id: "tools",
        label: "四元素工具",
        x: 50,
        y: 62,
        meaning: "桌上的权杖、圣杯、宝剑、星币代表四元素资源齐备。",
        hint: "魔术师不是等条件完美，而是看见手边已有的工具。"
      },
      {
        id: "flowers",
        label: "花园",
        x: 50,
        y: 86,
        meaning: "红白花朵代表欲望与纯净意图在现实中开花结果。",
        hint: "显化不是口号，它最终要长成看得见的东西。"
      }
    ]
  },
  {
    id: "high-priestess",
    number: "II",
    name: "女祭司",
    english: "The High Priestess",
    suit: "大阿卡纳",
    theme: "直觉、静默与隐秘知识",
    keywords: ["直觉", "潜意识", "等待", "秘密", "内在智慧"],
    upright: "倾听直觉、保留空间、观察未说出口的信息。答案未必来自立即行动。",
    reversed: "忽视直觉、信息不透明、过度封闭，或把神秘感当成逃避沟通。",
    memory: "女祭司不是不给答案，她要求你先安静下来，听见答案。",
    palette: ["#4267a9", "#d9d9e8", "#f7f1dc"],
    localImageUrl: "assets/cards/major-02-high-priestess.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/RWS_Tarot_02_High_Priestess.jpg/340px-RWS_Tarot_02_High_Priestess.jpg",
    imageSource: "https://commons.wikimedia.org/wiki/File:RWS_Tarot_02_High_Priestess.jpg",
    imageCredit: "Rider-Waite-Smith Tarot, Wikimedia Commons",
    symbols: [
      {
        id: "pillars",
        label: "黑白柱",
        x: 50,
        y: 38,
        meaning: "黑白柱象征二元性、边界和通往隐秘知识的入口。",
        hint: "她坐在对立之间，而不是急着选择一边。"
      },
      {
        id: "veil",
        label: "帷幕",
        x: 50,
        y: 47,
        meaning: "帷幕代表尚未揭开的真相，也提示有些知识需要准备好才能进入。",
        hint: "不是所有信息都适合立刻被掀开。"
      },
      {
        id: "scroll",
        label: "卷轴",
        x: 47,
        y: 58,
        meaning: "卷轴象征传统知识、神秘法则和被保存的智慧。",
        hint: "她掌握知识，但不急于展示知识。"
      },
      {
        id: "moon",
        label: "新月",
        x: 51,
        y: 78,
        meaning: "月亮连接潜意识、周期和直觉感知。",
        hint: "女祭司的语言常常不是逻辑句子，而是感觉、梦和暗示。"
      }
    ]
  },
  {
    id: "empress",
    number: "III",
    name: "皇后",
    english: "The Empress",
    suit: "大阿卡纳",
    theme: "滋养、丰盛与创造力",
    keywords: ["滋养", "丰盛", "身体", "创造", "关系"],
    upright: "生长、照料、感官丰盛和创造力。它鼓励你让事物自然成熟。",
    reversed: "过度付出、创造力堵塞、忽视身体需求，或关系里的依赖与消耗。",
    memory: "皇后的丰盛不是堆积，而是让生命有条件自然生长。",
    palette: ["#7eaa62", "#d47b87", "#f3dfb2"],
    localImageUrl: "assets/cards/major-03-empress.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/RWS_Tarot_03_Empress.jpg/340px-RWS_Tarot_03_Empress.jpg",
    imageSource: "https://commons.wikimedia.org/wiki/File:RWS_Tarot_03_Empress.jpg",
    imageCredit: "Rider-Waite-Smith Tarot, Wikimedia Commons",
    symbols: [
      {
        id: "crown",
        label: "星冠",
        x: 51,
        y: 14,
        meaning: "星冠连接自然节律、季节和宇宙秩序，显示她的创造力顺应周期。",
        hint: "生长有自己的时间表。"
      },
      {
        id: "wheat",
        label: "麦田",
        x: 48,
        y: 83,
        meaning: "麦田象征收获、身体层面的滋养和已经成熟的成果。",
        hint: "皇后关心的是生命能不能被喂养。"
      },
      {
        id: "venus",
        label: "金星符号",
        x: 74,
        y: 63,
        meaning: "金星符号代表爱、美、吸引力和关系中的柔软力量。",
        hint: "她通过吸引和滋养来创造，而不是通过控制。"
      },
      {
        id: "river",
        label: "河流",
        x: 23,
        y: 62,
        meaning: "河流象征情感流动、生命力和自然的连续滋养。",
        hint: "卡住时，先看哪里失去了流动。"
      }
    ]
  }
];
