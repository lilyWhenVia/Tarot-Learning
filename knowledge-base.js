(function buildTarotKnowledgeBase() {
  const minorSuitScenes = {
    Wands: ["行动计划", "创造表达", "热情与动力"],
    Cups: ["情绪关系", "直觉感受", "亲密连接"],
    Swords: ["沟通判断", "压力思辨", "冲突澄清"],
    Pentacles: ["现实资源", "工作金钱", "身体与安全感"]
  };

  function getArcana(card) {
    return /^(wands|cups|swords|pentacles)-/.test(card.id) ? "minor" : "major";
  }

  function getKeywords(card) {
    return Array.isArray(card.keywords) ? card.keywords.filter(Boolean) : [];
  }

  function normalizeImageElements(card, coreMeaning) {
    const source = card.imageElements || card.symbols || [];
    return source.map((element, index) => {
      const label = element.label || element.title || `元素 ${index + 1}`;
      const description = element.description || element.meaning || `${label}帮助理解「${card.name}」的核心主题。`;
      return {
        id: element.id || `element-${index + 1}`,
        label,
        title: element.title || label,
        x: typeof element.x === "number" ? element.x : 50,
        y: typeof element.y === "number" ? element.y : 50,
        description,
        prompt: element.prompt || element.hint || `这个元素如何呼应「${card.name}」的核心含义？`,
        relatedCoreMeaning: coreMeaning
      };
    });
  }

  function inferLifeScenes(card, arcana) {
    if (Array.isArray(card.lifeScenes) && card.lifeScenes.length) return card.lifeScenes;
    if (arcana === "major") return ["人生阶段", "自我理解", "关键选择"];
    const suitName = (card.english || "").split(" of ")[1];
    return minorSuitScenes[suitName] || ["日常事件", "现实练习", "关系互动"];
  }

  function buildCoreMeaning(card) {
    const keywords = getKeywords(card).slice(0, 3).join("、");
    return card.coreMeaning || card.theme || (keywords ? `${keywords}的核心经验` : card.upright || "");
  }

  function buildDeepInsight(card, coreMeaning) {
    return card.deepInsight || card.memory || `「${card.name}」不只是一组关键词，而是在提醒你观察：${coreMeaning}`;
  }

  function buildLearningLayers(card, coreMeaning, imageElements, lifeScenes) {
    const elementLabels = imageElements.map((element) => element.label).join("、") || "观察牌面中的主要图像线索";
    return {
      level1: card.learningLayers?.level1 || coreMeaning,
      level2: card.learningLayers?.level2 || `正位：${card.upright || coreMeaning} / 逆位：${card.reversed || "能量受阻或方向失衡"}`,
      level3: card.learningLayers?.level3 || `可放入这些现实情境理解：${lifeScenes.join("、")}。`,
      level4: card.learningLayers?.level4 || `从图像元素进入：${elementLabels}。`
    };
  }

  function buildKnowledge(card) {
    const arcana = getArcana(card);
    const keywords = getKeywords(card);
    const coreMeaning = buildCoreMeaning(card);
    const imageElements = normalizeImageElements(card, coreMeaning);
    const lifeScenes = inferLifeScenes(card, arcana);
    const deepInsight = buildDeepInsight(card, coreMeaning);
    const learningLayers = buildLearningLayers(card, coreMeaning, imageElements, lifeScenes);

    return {
      id: card.id,
      name: card.name,
      english: card.english,
      arcana,
      suit: card.suit,
      keywords,
      coreMeaning,
      upright: card.upright,
      reversed: card.reversed,
      imageElements: imageElements.map((element) => element.label),
      imageElementDetails: imageElements,
      deepInsight,
      lifeScenes,
      learningLayers
    };
  }

  const knowledgeBase = TAROT_CARDS.map((card) => {
    const knowledge = buildKnowledge(card);
    card.arcana = knowledge.arcana;
    card.coreMeaning = knowledge.coreMeaning;
    card.deepInsight = knowledge.deepInsight;
    card.lifeScenes = knowledge.lifeScenes;
    card.learningLayers = knowledge.learningLayers;
    card.imageElementLabels = knowledge.imageElements;
    card.imageElements = knowledge.imageElementDetails;
    card.knowledge = knowledge;
    return knowledge;
  });

  window.TAROT_KNOWLEDGE_BASE = knowledgeBase;
  window.TAROT_KNOWLEDGE_MAP = Object.fromEntries(knowledgeBase.map((card) => [card.id, card]));
})();
