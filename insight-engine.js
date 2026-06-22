(function buildTarotInsightEngine() {
  const knowledgeBase = window.TAROT_KNOWLEDGE_BASE || [];
  const knowledgeByName = new Map(knowledgeBase.map((card) => [card.name, card]));
  const knowledgeById = new Map(knowledgeBase.map((card) => [card.id, card]));

  function asList(value) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
  }

  function getKnowledge(card) {
    if (!card) return null;
    return knowledgeById.get(card.id) || knowledgeByName.get(card.name) || card.knowledge || card;
  }

  function buildRagDb(cards) {
    return cards.flatMap((card) => {
      const chunks = [
        {
          tag: "核心含义",
          content: `${card.name}的核心是${card.coreMeaning}。`
        },
        {
          tag: "正逆位对比",
          content: `正位指向：${card.upright}；逆位提醒：${card.reversed}。`
        },
        {
          tag: "深度洞察",
          content: card.deepInsight
        },
        {
          tag: "生活场景",
          content: `这张牌适合放入这些场景理解：${asList(card.lifeScenes).join("、")}。`
        },
        ...asList(card.imageElementDetails).slice(0, 4).map((element) => ({
          tag: `图像元素：${element.label}`,
          content: `${element.label}象征：${element.description}`
        }))
      ];

      return chunks
        .filter((chunk) => chunk.content && chunk.content.trim())
        .map((chunk) => ({
          cardId: card.id,
          card: card.name,
          keywords: asList(card.keywords),
          tag: chunk.tag,
          content: chunk.content
        }));
    });
  }

  const ragDb = buildRagDb(knowledgeBase);

  function tokenize(text) {
    const normalized = String(text || "")
      .toLowerCase()
      .replace(/[，。；：、,.!?！？/\\|()[\]{}"'“”‘’]/g, " ");
    const roughTokens = normalized.split(/\s+/).filter(Boolean);
    const compact = normalized.replace(/\s+/g, "");
    const chinesePairs = compact.match(/[\u4e00-\u9fa5]{2}/g) || [];
    return [...new Set([...roughTokens, ...chinesePairs])];
  }

  function scoreSnippet(snippet, query) {
    const haystack = `${snippet.tag} ${snippet.content} ${snippet.keywords.join(" ")}`.toLowerCase();
    const tokens = tokenize(query);
    const keywordScore = snippet.keywords.reduce((score, keyword) => {
      return score + (query.includes(keyword) || haystack.includes(String(keyword).toLowerCase()) ? 1 : 0);
    }, 0);
    const tokenScore = tokens.reduce((score, token) => score + (haystack.includes(token) ? 1 : 0), 0);
    return tokenScore + keywordScore + (haystack.includes(String(query || "").toLowerCase()) ? 2 : 0);
  }

  function retrieveTarotKnowledge(cardName, query = "") {
    const scoped = ragDb.filter((snippet) => snippet.card === cardName);
    const fallbackQuery = query || cardName;
    return scoped
      .map((snippet) => ({
        ...snippet,
        score: scoreSnippet(snippet, fallbackQuery)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ score, ...snippet }) => snippet);
  }

  function enhanceImageMeaning(imageElements, card = null) {
    const knowledge = getKnowledge(card);
    const coreMeaning = knowledge?.coreMeaning || "";
    return asList(imageElements).map((element) => {
      const label = element.label || element.title || element;
      const description = element.description || `${label}是进入牌义的一条图像线索。`;
      return {
        element: label,
        symbol: description,
        learningPrompt: element.prompt || `看到「${label}」时，先问：它如何帮助我理解「${coreMeaning || "这张牌"}」？`,
        relatedCoreMeaning: element.relatedCoreMeaning || coreMeaning
      };
    });
  }

  function generateTarotInsight(card, context = {}) {
    const knowledge = getKnowledge(card) || {};
    const keywords = asList(knowledge.keywords || card?.keywords);
    const imageGuide = enhanceImageMeaning(knowledge.imageElementDetails || card?.imageElements, knowledge);
    const query = context.query || knowledge.coreMeaning || keywords.join(" ");
    const ragSnippets = retrieveTarotKnowledge(knowledge.name || card?.name, query);

    return {
      summary: knowledge.coreMeaning || card?.theme || card?.upright || "",
      keywords,
      upright: knowledge.upright || card?.upright || "",
      reversed: knowledge.reversed || card?.reversed || "",
      deepInsight: knowledge.deepInsight || card?.memory || "",
      imageGuide,
      lifeScenes: asList(knowledge.lifeScenes || card?.lifeScenes),
      learningLayers: knowledge.learningLayers || card?.learningLayers || {},
      ragSnippets
    };
  }

  function describeCardInSpread(card, index) {
    const insight = generateTarotInsight(card);
    const focus = insight.keywords.slice(0, 2).join("与") || insight.summary;
    return {
      card: card.name,
      meaning: `${card.name}带来${focus}的学习线索：${insight.summary}`,
      summary: insight.summary,
      keywords: insight.keywords
    };
  }

  function inferRelationship(insights) {
    const allKeywords = insights.flatMap((item) => item.keywords).slice(0, 8);
    const uniqueKeywords = [...new Set(allKeywords)];
    if (insights.length === 1) {
      return `这是一张单牌练习，重点是把「${insights[0].card}」的核心含义与图像线索对齐。`;
    }
    return `这组牌围绕「${uniqueKeywords.slice(0, 4).join("、")}」展开，适合观察能量如何从一个主题转向另一个主题。`;
  }

  function inferContradictions(insights) {
    const text = insights.flatMap((item) => item.keywords).join("、");
    const tensions = [];
    if (/行动|推进|速度|热情/.test(text) && /等待|暂停|内省|稳定/.test(text)) {
      tensions.push("行动与停顿之间的张力");
    }
    if (/控制|秩序|稳定|安全/.test(text) && /自由|冒险|变化|释放/.test(text)) {
      tensions.push("控制与自由之间的张力");
    }
    if (/情感|关系|直觉/.test(text) && /判断|理性|沟通|冲突/.test(text)) {
      tensions.push("感受与判断之间的张力");
    }
    return tensions.length ? tensions.join("；") : "这组牌的张力较温和，可以重点观察主题之间如何互相补充。";
  }

  function generateSpreadInsight(cards) {
    const cardBreakdown = asList(cards).map(describeCardInSpread);
    const relationship = inferRelationship(cardBreakdown);
    const narrative = cardBreakdown.map((item, index) => {
      const connector = index === 0 ? "起点" : index === cardBreakdown.length - 1 ? "落点" : "转折";
      return `${connector}是「${item.card}」：${item.summary}`;
    }).join(" ");

    return {
      cardBreakdown: cardBreakdown.map(({ card, meaning }) => ({ card, meaning })),
      relationship,
      narrative,
      learningInsight: "把这组牌当作学习材料：先看每张牌的关键词，再看它们之间是推进、补充还是形成张力。",
      contradictionPoints: inferContradictions(cardBreakdown)
    };
  }

  window.TAROT_RAG_DB = ragDb;
  window.retrieveTarotKnowledge = retrieveTarotKnowledge;
  window.enhanceImageMeaning = enhanceImageMeaning;
  window.generateTarotInsight = generateTarotInsight;
  window.generateSpreadInsight = generateSpreadInsight;
})();
