const { useEffect, useMemo, useReducer, useState } = React;

const PROGRESS_STORAGE_KEY = "tarot-image-study-progress-v1";
const DAILY_CARD_STORAGE_KEY = "tarot-daily-card-v1";
const SPREAD_HISTORY_STORAGE_KEY = "tarot-spread-practice-history-v1";
const STATUS_LABELS = {
  not_started: "未学习",
  learning: "学习中",
  learned: "已学习",
  mastered: "已掌握"
};

const SUITS = [
  { id: "wands", name: "权杖牌组", english: "Wands", suit: "权杖", summary: "行动、热情、创造力" },
  { id: "swords", name: "宝剑牌组", english: "Swords", suit: "宝剑", summary: "思想、语言、判断" },
  { id: "cups", name: "圣杯牌组", english: "Cups", suit: "圣杯", summary: "情感、关系、直觉" },
  { id: "pentacles", name: "星币牌组", english: "Pentacles", suit: "星币", summary: "身体、资源、现实成果" }
];

const FIRST_MAJOR_IDS = ["fool", "magician", "high-priestess", "empress"];

const SPREAD_TYPES = [
  {
    id: "single-theme",
    title: "单张牌：当前主题",
    subtitle: "用一张牌练习抓住核心牌义。",
    positions: ["当前主题"],
    questions: [
      "这张牌最核心的关键词是什么？",
      "图像中哪个元素最吸引我？"
    ]
  },
  {
    id: "past-present-future",
    title: "三张牌：过去 / 现在 / 未来",
    subtitle: "练习观察牌义如何形成时间上的流动。",
    positions: ["过去", "现在", "未来"],
    questions: [
      "过去的牌代表什么背景？",
      "现在的牌显示什么状态？",
      "未来的牌提示什么方向？"
    ]
  },
  {
    id: "problem-block-advice",
    title: "三张牌：问题 / 阻碍 / 建议",
    subtitle: "练习把同一张牌放进不同位置理解。",
    positions: ["问题", "阻碍", "建议"],
    questions: [
      "问题牌显示什么核心主题？",
      "阻碍牌代表外部困难还是内在限制？",
      "建议牌提醒我可以采取什么学习视角？"
    ]
  },
  {
    id: "daily-reflection",
    title: "每日反思",
    subtitle: "用三张牌做轻量的学习复盘。",
    positions: ["今天的状态", "今天的提醒", "今天可以练习的行动"],
    questions: [
      "今天的状态是什么？",
      "今天最需要注意什么？",
      "我可以用哪个小行动回应这组牌？"
    ]
  }
];

TAROT_CARDS.forEach((card) => {
  if (!card.imageElements && Array.isArray(card.symbols)) {
    card.imageElements = card.symbols.map((symbol) => ({
      id: symbol.id,
      label: symbol.label,
      x: symbol.x,
      y: symbol.y,
      title: symbol.title || symbol.label,
      description: symbol.description || symbol.meaning,
      prompt: symbol.prompt || symbol.hint
    }));
  }
});

const initialState = {
  currentView: "home",
  selectedArcana: null,
  selectedSuit: null,
  selectedCard: "fool",
  selectedSymbol: null
};

const backMap = {
  cardList: "cardParent",
  suit: "minor",
  minor: "home",
  major: "home"
};

function reducer(state, action) {
  switch (action.type) {
    case "go":
      return {
        ...state,
        ...action.payload
      };
    case "selectCard":
      return {
        ...state,
        currentView: "cardList",
        selectedCard: action.cardId,
        selectedSymbol: null
      };
    case "selectSymbol":
      return {
        ...state,
        selectedSymbol: action.symbolId
      };
    case "back": {
      return parentStateFor(state);
    }
    case "home":
      return initialState;
    default:
      return state;
  }
}

function parentStateFor(state) {
  const target = backMap[state.currentView] || "home";

  if (target === "cardParent") {
    if (state.selectedArcana === "minor" && state.selectedSuit) {
      return {
        ...state,
        currentView: "suit",
        selectedSymbol: null
      };
    }

    if (state.selectedArcana === "major") {
      return {
        ...state,
        currentView: "major",
        selectedSymbol: null
      };
    }
  }

  if (target === "minor") {
    return {
      ...state,
      currentView: "minor",
      selectedSuit: null,
      selectedSymbol: null
    };
  }

  if (target === "home") {
    return initialState;
  }

  return initialState;
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [progress, setProgress] = useState(loadProgressFromLocalStorage);
  const [studyMode, setStudyMode] = useState("learn");
  const [dailyCard] = useState(() => getOrCreateDailyCard(TAROT_CARDS));
  const majorCards = useMemo(() => TAROT_CARDS.filter(isMajorCard), []);
  const minorCards = useMemo(() => TAROT_CARDS.filter((card) => !isMajorCard(card)), []);
  const selectedCard = TAROT_CARDS.find((card) => card.id === state.selectedCard) || majorCards[0] || TAROT_CARDS[0];
  const progressSummary = useMemo(() => calculateProgressSummary(TAROT_CARDS, progress), [progress]);

  useEffect(() => {
    if (selectedCard?.imageElements?.length) {
      setSelectedElementId(selectedCard.imageElements[0].id);
    } else {
      setSelectedElementId(null);
    }
  }, [selectedCard?.id]);

  function goMajor() {
    dispatch({
      type: "go",
      payload: {
        currentView: "major",
        selectedArcana: "major",
        selectedSuit: null,
        selectedCard: majorCards[0].id,
        selectedSymbol: null
      }
    });
  }

  function goMinor() {
    dispatch({
      type: "go",
      payload: {
        currentView: "minor",
        selectedArcana: "minor",
        selectedSuit: null,
        selectedSymbol: null
      }
    });
  }

  function goSuit(suitId) {
    const suit = SUITS.find((item) => item.id === suitId);
    const firstCard = TAROT_CARDS.find((card) => card.suit === suit.suit);
    dispatch({
      type: "go",
      payload: {
        currentView: "suit",
        selectedArcana: "minor",
        selectedSuit: suitId,
        selectedCard: firstCard ? firstCard.id : state.selectedCard,
        selectedSymbol: null
      }
    });
  }

  function updateCardProgress(cardId, updater) {
    setProgress((current) => {
      const nextRecord = normalizeProgressRecord(updater(current[cardId]));
      const next = {
        ...current,
        [cardId]: nextRecord
      };
      saveProgressToLocalStorage(next);
      return next;
    });
  }

  function markCardViewed(cardId) {
    updateCardProgress(cardId, (prev) => ({
      ...defaultProgressRecord(),
      ...prev,
      status: prev?.status && prev.status !== "not_started" ? prev.status : "learning",
      viewCount: (prev?.viewCount || 0) + 1,
      lastStudiedAt: new Date().toISOString()
    }));
  }

  function setCardStatus(cardId, status) {
    updateCardProgress(cardId, (prev) => ({
      ...defaultProgressRecord(),
      ...prev,
      status,
      lastStudiedAt: new Date().toISOString()
    }));
  }

  function handleCardSelect(card) {
    markCardViewed(card.id);
    dispatch({ type: "selectCard", cardId: card.id });
  }

  function openCardStudy(card) {
    if (!card) return;
    const arcana = isMajorCard(card) ? "major" : "minor";
    const suit = SUITS.find((item) => item.suit === card.suit);
    markCardViewed(card.id);
    setStudyMode("learn");
    dispatch({
      type: "go",
      payload: {
        currentView: arcana === "major" ? "major" : "suit",
        selectedArcana: arcana,
        selectedSuit: suit ? suit.id : null,
        selectedCard: card.id,
        selectedSymbol: null
      }
    });
  }

  function openDailyCardStudy() {
    openCardStudy(dailyCard);
  }

  return h("main", { className: "shell" },
    h(Header, { state, studyMode, setStudyMode, onHome: () => dispatch({ type: "home" }) }),
    h("div", { className: "app-layout" },
      h("aside", { className: "left-panel" },
        h(LeftNavigation, {
          state,
          majorCards,
          minorCards,
          progress,
          progressSummary,
          dailyCard,
          onMajor: goMajor,
          onMinor: goMinor,
          onSuit: goSuit,
          onCard: handleCardSelect,
          onOpenDailyCard: openDailyCardStudy,
          onBack: () => dispatch({ type: "back" })
        })
      ),
      h("section", { className: "right-panel" },
        studyMode === "learn"
          ? h("div", { className: "learn-stack" },
            state.currentView === "home" && h(DailyCardPanel, {
              card: dailyCard,
              onOpenDailyCard: openDailyCardStudy
            }),
            h(ImageLearningModule, {
              card: selectedCard,
              selectedElementId,
              setSelectedElementId,
              progressRecord: getCardProgress(selectedCard.id, progress),
              setCardStatus
            })
          )
          : studyMode === "quiz"
            ? h(QuizMode, {
            cards: TAROT_CARDS,
            onBackToLearn: () => setStudyMode("learn"),
            onAnswerCard: (cardId, isCorrect) => recordQuizAnswer(cardId, isCorrect)
          })
          : studyMode === "translate"
            ? h(TranslationGym, {
              cards: TAROT_CARDS,
              onStudyCard: openCardStudy,
            })
            : studyMode === "review"
              ? h(ReviewMode, {
                cards: TAROT_CARDS,
                onBackToLearn: () => setStudyMode("learn")
              })
              : h(SpreadPractice, {
                cards: TAROT_CARDS,
                onStudyCard: openCardStudy,
                onBackToLearn: () => setStudyMode("learn")
              })
      )
    )
  );
  function recordQuizAnswer(cardId, isCorrect) {
    updateCardProgress(cardId, (prev) => ({
      ...defaultProgressRecord(),
      ...prev,
      quizCorrect: (prev?.quizCorrect || 0) + (isCorrect ? 1 : 0),
      quizWrong: (prev?.quizWrong || 0) + (isCorrect ? 0 : 1),
      lastStudiedAt: new Date().toISOString()
    }));
  }
}

function Header({ state, studyMode, setStudyMode, onHome }) {
  return h("header", { className: "app-header" },
    h("div", null,
      h("p", { className: "eyebrow" }, "Tarot Image Study"),
      h("h1", null, "塔罗图像学习")
    ),
    h("div", { className: "header-actions" },
      h("div", { className: "mode-toggle", "aria-label": "学习模式切换" },
        h("button", {
          type: "button",
          className: studyMode === "learn" ? "is-active" : "",
          onClick: () => setStudyMode("learn")
        }, "牌卡学习"),
        h("button", {
          type: "button",
          className: studyMode === "quiz" ? "is-active" : "",
          onClick: () => setStudyMode("quiz")
        }, "测验模式"),
        h("button", {
          type: "button",
          className: studyMode === "translate" ? "is-active" : "",
          onClick: () => setStudyMode("translate")
        }, "翻译训练")
      ),
      h("button", {
        className: studyMode === "spread" ? "home-btn is-active-mode" : "home-btn",
        onClick: () => setStudyMode("spread")
      }, "牌阵练习"),
      h("button", {
        className: studyMode === "review" ? "home-btn is-active-mode" : "home-btn",
        onClick: () => setStudyMode("review")
      }, "知识库审核"),
      h("button", { className: "home-btn", onClick: onHome }, viewLabel(state))
    )
  );
}

function LeftNavigation({ state, majorCards, minorCards, progress, progressSummary, dailyCard, onMajor, onMinor, onSuit, onCard, onOpenDailyCard, onBack }) {
  const selectedSuit = SUITS.find((suit) => suit.id === state.selectedSuit);
  const suitCards = selectedSuit ? TAROT_CARDS.filter((card) => card.suit === selectedSuit.suit) : [];
  const showBack = state.currentView !== "home";

  return h("div", { className: "nav-stack" },
    h("div", { className: "panel-title" },
      h("div", null,
        h("p", { className: "eyebrow" }, "Navigation"),
        h("h2", null, viewLabel(state))
      ),
      showBack && h("button", { className: "back-btn", onClick: onBack }, "返回")
    ),
    h(ProgressSummary, { summary: progressSummary }),
    h(DailyCardEntry, { card: dailyCard, onOpenDailyCard }),
    state.currentView === "home" && h(HomeView, {
      majorCount: majorCards.length,
      minorCount: minorCards.length,
      onMajor,
      onMinor
    }),
    state.currentView === "major" && h(MajorArcanaView, {
      cards: majorCards,
      selectedCard: state.selectedCard,
      progress,
      onCard
    }),
    state.currentView === "minor" && h(MinorArcanaView, {
      suits: SUITS,
      onSuit
    }),
    state.currentView === "suit" && h(SuitView, {
      suit: selectedSuit,
      cards: suitCards,
      selectedCard: state.selectedCard,
      progress,
      onCard
    }),
    state.currentView === "cardList" && h(CardListTrail, {
      state,
      selectedSuit,
      selectedCard: state.selectedCard,
    })
  );
}

function DailyCardEntry({ card, onOpenDailyCard }) {
  if (!card) return null;
  const keywords = getDailyKeywords(card).slice(0, 3).join("、");

  return h("section", { className: "daily-entry-card" },
    h("p", { className: "eyebrow" }, "今日一牌"),
    h("div", { className: "daily-entry-main" },
      h("span", null, card.number),
      h("div", null,
        h("strong", null, card.name),
        h("small", null, keywords || "观察图像，理解牌义")
      )
    ),
    h("button", { type: "button", onClick: onOpenDailyCard }, "进入今日牌卡学习")
  );
}

function DailyCardPanel({ card, onOpenDailyCard }) {
  if (!card) return null;
  const keywords = getDailyKeywords(card);
  const elements = getDailyElements(card);
  const insight = getTarotInsight(card, { query: card.coreMeaning || card.name });
  const actionScene = insight.lifeScenes[0] || "今天的现实情境";
  const question = card.dailyQuestion || `今天我可以从「${card.name}」这张牌中学习什么？`;
  const memoryTip = card.memoryTip || card.deepInsight || card.memory || `记住「${card.name}」：${card.coreMeaning || keywords.slice(0, 3).join("、") || "观察图像，理解牌义"}。`;

  return h("section", { className: "daily-panel" },
    h("div", { className: "daily-panel-head" },
      h("div", null,
        h("p", { className: "eyebrow" }, "Daily Tarot"),
        h("h2", null, "今日一牌")
      ),
      h("button", { type: "button", className: "primary-btn", onClick: onOpenDailyCard }, "进入今日牌卡学习")
    ),
    h("div", { className: "daily-panel-grid" },
      h("div", { className: "daily-card-token" },
        h("span", null, card.number),
        h("strong", null, card.name),
        h("small", null, card.english)
      ),
      h("div", { className: "daily-info-stack" },
        h("p", null, h("strong", null, "核心含义："), card.coreMeaning || card.theme || card.upright),
        h("p", null, h("strong", null, "今日关键词："), keywords.length ? keywords.join("、") : "观察图像，理解牌义"),
        h("p", null, h("strong", null, "今日图像元素："), elements.length ? elements.join("、") : "暂无图像元素数据，可进入学习页查看基础牌义。"),
        h("p", null, h("strong", null, "今日思考问题："), question),
        h("p", null, h("strong", null, "一句话记忆："), memoryTip)
      )
    ),
    h("section", { className: "daily-ai-layer" },
      h("p", null, h("strong", null, "行动建议："), `在「${actionScene}」里练习：${insight.summary}`)
    ),
    h(RagSnippetList, { snippets: insight.ragSnippets, title: "今日RAG补充" })
  );
}

function HomeView({ majorCount, minorCount, onMajor, onMinor }) {
  return h("div", { className: "entry-grid" },
    h(NavCard, {
      title: "大阿卡纳牌组",
      subtitle: `${majorCount} 张`,
      description: "人生主题、阶段转化与核心原型。",
      onClick: onMajor
    }),
    h(NavCard, {
      title: "小阿卡纳牌组",
      subtitle: `${minorCount} 张`,
      description: "四元素中的日常经验、事件与人物状态。",
      onClick: onMinor
    })
  );
}

function MajorArcanaView({ cards, selectedCard, progress, onCard }) {
  return h("div", { className: "nav-section" },
    h("p", { className: "section-note" }, "0-21 共 22 张大阿卡纳"),
    h(CardGrid, { cards, selectedCard, progress, onCard })
  );
}

function MinorArcanaView({ suits, onSuit }) {
  return h("div", { className: "entry-grid" },
    suits.map((suit) => h(NavCard, {
      key: suit.id,
      title: suit.name,
      subtitle: suit.english,
      description: suit.summary,
      onClick: () => onSuit(suit.id)
    }))
  );
}

function SuitView({ suit, cards, selectedCard, progress, onCard }) {
  return h("div", { className: "nav-section" },
    h("p", { className: "section-note" }, `${suit.name}：1-10 + 侍从 / 骑士 / 皇后 / 国王`),
    h(CardGrid, { cards, selectedCard, progress, onCard })
  );
}

function CardListTrail({ state, selectedSuit, selectedCard }) {
  const card = TAROT_CARDS.find((item) => item.id === selectedCard);
  const parentLabel = state.selectedArcana === "major"
    ? "大阿卡纳牌列表"
    : `${selectedSuit ? selectedSuit.name : "花色"}牌列表`;

  return h("div", { className: "detail-nav-state" },
    h("p", { className: "section-note" }, "当前学习牌"),
    h("div", { className: "current-card-chip" },
      h("span", null, card ? card.number : ""),
      h("strong", null, card ? card.name : "未选择牌卡"),
      h("small", null, card ? card.english : "")
    ),
    h("p", null, `点击“返回”将直接回到 ${parentLabel}。`)
  );
}

function CardGrid({ cards, selectedCard, progress, onCard }) {
  return h("div", { className: "card-grid" },
    cards.map((card) => h("button", {
      key: card.id,
      className: `card-tile ${card.id === selectedCard ? "is-active" : ""}`,
      onClick: () => onCard(card)
    },
      h(ProgressBadge, { status: getCardStatus(card.id, progress) }),
      h("span", null, card.number),
      h("div", null,
        h("strong", null, card.name),
        h("small", null, card.english)
      )
    ))
  );
}

function ImageLearningModule({ card, selectedElementId, setSelectedElementId, progressRecord, setCardStatus }) {
  const element = getSelectedElement(card, selectedElementId);
  const knowledge = getApprovedKnowledge(card.id);

  return h("div", { className: "learning-layout" },
    h("div", { className: "card-stage" },
      h(TarotVisual, { card, selectedElementId, setSelectedElementId })
    ),
    h("article", { className: "meaning-panel" },
      h("div", { className: "meaning-head" },
        h("div", null,
          h("p", { className: "eyebrow" }, card.english),
          h("h2", null, `${card.number} ${card.name}`)
        ),
        h("span", { className: "suit-pill" }, card.suit)
      ),
      h("p", { className: "theme" }, card.coreMeaning || card.theme),
      h(StudyStatusActions, {
        card,
        progressRecord,
        onSetStatus: setCardStatus
      }),
      h("div", { className: "keyword-row" }, card.keywords.map((keyword) => h("span", { key: keyword }, keyword))),
      knowledge ? h(KnowledgePanel, { knowledge }) : h(StructuredReadingPanelV2, { card }),
      h(ElementStudyPanel, { card, element }),
      h("div", { className: "meaning-grid" },
        h("section", null,
          h("h3", null, "正位解释"),
          h("p", null, card.upright)
        ),
        h("section", null,
          h("h3", null, "逆位解释"),
          h("p", null, card.reversed)
        )
      ),
      h("section", { className: "memory-line" },
        h("h3", null, "一句话记忆"),
        h("p", null, card.deepInsight || card.memory || card.coreMeaning)
      )
    )
  );
}

function StructuredReadingPanel({ card }) {
  const elementLabels = getDailyElements(card);
  const lifeScenes = Array.isArray(card.lifeScenes) ? card.lifeScenes : [];
  const layers = card.learningLayers || {};

  return h("section", { className: "structured-reading" },
    h("p", { className: "eyebrow" }, "Structured Reading"),
    h("h3", null, "结构化解读"),
    h("div", { className: "structured-core" },
      h("strong", null, "核心含义"),
      h("p", null, card.coreMeaning || card.theme || card.upright)
    ),
    h("div", { className: "structured-grid" },
      h("div", null,
        h("strong", null, "正位"),
        h("p", null, card.upright)
      ),
      h("div", null,
        h("strong", null, "逆位"),
        h("p", null, card.reversed)
      )
    ),
    h("div", { className: "structured-insight" },
      h("strong", null, "深度洞察"),
      h("p", null, card.deepInsight || card.memory || card.coreMeaning)
    ),
    h("div", { className: "structured-chip-block" },
      h("strong", null, "图像元素拆解"),
      h("div", { className: "structured-chip-row" },
        elementLabels.length
          ? elementLabels.map((label) => h("span", { key: label }, label))
          : h("small", null, "暂无图像元素数据")
      )
    ),
    h("div", { className: "structured-chip-block" },
      h("strong", null, "生活场景"),
      h("div", { className: "structured-chip-row" },
        lifeScenes.length
          ? lifeScenes.map((scene) => h("span", { key: scene }, scene))
          : h("small", null, "可结合当前问题情境理解")
      )
    ),
    h("details", { className: "learning-layers" },
      h("summary", null, "学习层级"),
      ["level1", "level2", "level3", "level4"].map((level) => layers[level] && h("p", { key: level },
        h("strong", null, `${level.replace("level", "L")}：`),
        layers[level]
      ))
    )
  );
}

function StructuredReadingPanelV2({ card }) {
  const insight = getTarotInsight(card, { query: card.coreMeaning || card.name });
  const elementLabels = getDailyElements(card);
  const lifeScenes = insight.lifeScenes || [];
  const layers = insight.learningLayers || {};

  return h("section", { className: "structured-reading" },
    h("p", { className: "eyebrow" }, "AI Insight Engine"),
    h("h3", null, "AI分层解读"),
    h("div", { className: "structured-core" },
      h("strong", null, "基础解读"),
      h("p", null, insight.summary)
    ),
    h("div", { className: "structured-grid" },
      h("div", null,
        h("strong", null, "正位"),
        h("p", null, insight.upright)
      ),
      h("div", null,
        h("strong", null, "逆位"),
        h("p", null, insight.reversed)
      )
    ),
    h("div", { className: "structured-insight" },
      h("strong", null, "深度洞察"),
      h("p", null, insight.deepInsight)
    ),
    h("div", { className: "structured-chip-block" },
      h("strong", null, "图像元素拆解"),
      h("div", { className: "structured-chip-row" },
        elementLabels.length
          ? elementLabels.map((label) => h("span", { key: label }, label))
          : h("small", null, "暂无图像元素数据")
      )
    ),
    h("div", { className: "structured-chip-block" },
      h("strong", null, "应用场景"),
      h("div", { className: "structured-chip-row" },
        lifeScenes.length
          ? lifeScenes.map((scene) => h("span", { key: scene }, scene))
          : h("small", null, "可结合当前问题情境理解")
      )
    ),
    h("details", { className: "learning-layers" },
      h("summary", null, "学习层级"),
      ["level1", "level2", "level3", "level4"].map((level) => layers[level] && h("p", { key: level },
        h("strong", null, `${level.replace("level", "L")}：`),
        layers[level]
      ))
    ),
    h(RagSnippetList, { snippets: insight.ragSnippets, title: "RAG补充解释" }),
    h(ImageGuidePanel, { imageGuide: insight.imageGuide })
  );
}

function RagSnippetList({ snippets, title }) {
  if (!snippets || !snippets.length) return null;
  return h("section", { className: "rag-snippets" },
    h("strong", null, title || "RAG补充"),
    snippets.map((snippet) => h("p", { key: `${snippet.cardId}-${snippet.tag}` },
      h("span", null, snippet.tag),
      snippet.content
    ))
  );
}

function ImageGuidePanel({ imageGuide }) {
  if (!imageGuide || !imageGuide.length) return null;
  return h("section", { className: "image-guide-panel" },
    h("strong", null, "图像理解增强"),
    imageGuide.slice(0, 4).map((item) => h("p", { key: item.element },
      h("span", null, item.element),
      `${item.symbol} ${item.learningPrompt}`
    ))
  );
}

function KnowledgePanel({ knowledge }) {
  if (!knowledge) return null;
  const apps = knowledge.applications || {};
  const demos = Array.isArray(knowledge.translationDemos) ? knowledge.translationDemos : [];
  const combos = Array.isArray(knowledge.combos) ? knowledge.combos : [];

  return h("section", { className: "knowledge-panel" },
    h("p", { className: "eyebrow" }, "深度知识库"),
    knowledge.coreEnergy && h("div", { className: "kp-core" },
      h("h3", null, "核心能量"),
      h("p", { className: "kp-oneline" }, knowledge.coreEnergy.oneLine),
      knowledge.coreEnergy.expanded && h("p", null, knowledge.coreEnergy.expanded)
    ),
    Object.keys(apps).length > 0 && h("div", { className: "kp-apps" },
      h("h3", null, "四领域应用"),
      Object.keys(DOMAIN_LABELS).filter((d) => apps[d]).map((domain) => h("div", { className: "kp-app-row", key: domain },
        h("strong", { className: "kp-domain" }, DOMAIN_LABELS[domain]),
        h("div", { className: "kp-app-meanings" },
          apps[domain].upright && h("p", null, h("span", { className: "kp-tag up" }, "正位"), apps[domain].upright),
          apps[domain].reversed && h("p", null, h("span", { className: "kp-tag rev" }, "逆位"), apps[domain].reversed)
        )
      ))
    ),
    demos.length > 0 && h("div", { className: "kp-demos" },
      h("h3", null, "翻译公式示范"),
      h("p", { className: "kp-demo-hint" }, "看牌意如何一步步落地成具体建议——这正是解读最难的一环。"),
      demos.map((demo, index) => h("div", { className: "kp-demo", key: index },
        h("p", { className: "kp-demo-q" }, `问：${demo.question}`),
        h("ol", { className: "kp-demo-steps" },
          demo.step1_energy && h("li", null, demo.step1_energy),
          demo.step2_projection && h("li", null, demo.step2_projection),
          demo.step3_action && h("li", null, demo.step3_action)
        )
      ))
    ),
    combos.length > 0 && h("div", { className: "kp-combos" },
      h("h3", null, "常见牌组合"),
      combos.map((combo, index) => h("p", { key: index }, combo.reading))
    ),
    knowledge.numerology && h("div", { className: "kp-numerology" },
      h("h3", null, "数字学"),
      h("p", null, knowledge.numerology)
    )
  );
}

function ReviewMode({ cards, onBackToLearn }) {
  const meta = getKnowledgeMeta();
  const knowledgeCards = window.TAROT_KNOWLEDGE_CARDS || {};
  const ids = Object.keys(knowledgeCards);
  const [selectedId, setSelectedId] = useState(ids[0] || null);
  const knowledge = selectedId ? knowledgeCards[selectedId] : null;

  return h("div", { className: "review-mode" },
    h("div", { className: "review-head" },
      h("div", null,
        h("p", { className: "eyebrow" }, "Knowledge Review"),
        h("h2", null, "知识库审核")
      ),
      h("button", { type: "button", className: "soft-btn", onClick: onBackToLearn }, "回到牌卡学习")
    ),
    h("section", { className: "review-stats" },
      h("div", null, h("strong", null, meta.total), h("span", null, "已录入")),
      h("div", null, h("strong", null, meta.approved), h("span", null, "已通过")),
      h("div", null, h("strong", null, meta.draft), h("span", null, "草稿待审"))
    ),
    h("p", { className: "review-explain" },
      "这里预览知识库草稿。核对来源与内容后，把对应 JSON 文件的 ",
      h("code", null, "status"),
      " 改成 ",
      h("code", null, "\"approved\""),
      "，重新运行 ",
      h("code", null, "npm run compile-knowledge"),
      "，正式学习界面才会显示这份新内容。未通过的牌在学习界面仍用旧数据。"
    ),
    ids.length === 0
      ? h("p", { className: "review-empty" }, "知识库还没有内容。先在 knowledge/major 或 knowledge/minor 里添加 JSON 文件。")
      : h("div", { className: "review-layout" },
        h("div", { className: "review-list" },
          ids.map((id) => {
            const k = knowledgeCards[id];
            return h("button", {
              key: id,
              type: "button",
              className: `review-list-item ${id === selectedId ? "is-active" : ""}`,
              onClick: () => setSelectedId(id)
            },
              h("span", { className: `review-status-dot status-${k.status}` }),
              h("strong", null, `${k.number || ""} ${k.name}`),
              h("small", null, k.status === "approved" ? "已通过" : "草稿")
            );
          })
        ),
        h("div", { className: "review-detail" },
          knowledge && h(React.Fragment, null,
            h("div", { className: "review-detail-head" },
              h("h3", null, `${knowledge.number || ""} ${knowledge.name}`),
              h("span", { className: `review-badge status-${knowledge.status}` },
                knowledge.status === "approved" ? "已通过" : "草稿 · 未上线")
            ),
            Array.isArray(knowledge.sources) && knowledge.sources.length > 0 && h("section", { className: "review-sources" },
              h("h4", null, "权威来源"),
              h("ul", null, knowledge.sources.map((src, i) => h("li", { key: i }, src)))
            ),
            h(KnowledgePanel, { knowledge })
          )
        )
      )
  );
}

function ProgressSummary({ summary }) {
  return h("section", { className: "progress-summary-card" },
    h("div", null,
      h("strong", null, `${summary.completedTotal} / ${summary.total}`),
      h("span", null, "总进度")
    ),
    h("div", null,
      h("strong", null, `${summary.completedMajor} / ${summary.majorTotal}`),
      h("span", null, "大阿卡纳")
    ),
    h("div", null,
      h("strong", null, `${summary.completedMinor} / ${summary.minorTotal}`),
      h("span", null, "小阿卡纳")
    ),
    h("div", null,
      h("strong", null, `${summary.mastered}`),
      h("span", null, "已掌握")
    )
  );
}

function ProgressBadge({ status }) {
  const label = STATUS_LABELS[status] || STATUS_LABELS.not_started;
  const symbol = {
    not_started: "○",
    learning: "●",
    learned: "✓",
    mastered: "★"
  }[status] || "○";

  return h("i", {
    className: `progress-badge status-${status}`,
    title: label,
    "aria-label": label
  }, symbol);
}

function StudyStatusActions({ card, progressRecord, onSetStatus }) {
  const status = progressRecord.status || "not_started";
  return h("section", { className: "study-status-actions" },
    h("span", null, `状态：${STATUS_LABELS[status] || STATUS_LABELS.not_started}`),
    h("button", {
      type: "button",
      onClick: () => onSetStatus(card.id, "learned"),
      className: status === "learned" ? "is-active" : ""
    }, "标记为已学习"),
    h("button", {
      type: "button",
      onClick: () => onSetStatus(card.id, "mastered"),
      className: status === "mastered" ? "is-active" : ""
    }, "标记为已掌握")
  );
}

function SpreadPractice({ cards, onStudyCard, onBackToLearn }) {
  const [selectedSpreadType, setSelectedSpreadType] = useState(SPREAD_TYPES[0].id);
  const [drawnCards, setDrawnCards] = useState([]);
  const [error, setError] = useState("");
  const spread = SPREAD_TYPES.find((item) => item.id === selectedSpreadType) || SPREAD_TYPES[0];

  function handleSpreadTypeChange(spreadTypeId) {
    setSelectedSpreadType(spreadTypeId);
    setDrawnCards([]);
    setError("");
  }

  function handleDraw() {
    const result = drawSpreadCards(cards, spread.positions.length);
    if (result.length < spread.positions.length) {
      setDrawnCards([]);
      setError("当前牌卡数据不足，暂时无法完成这个牌阵。");
      return;
    }

    setError("");
    setDrawnCards(result);
    saveSpreadPracticeHistory({
      createdAt: new Date().toISOString(),
      spreadType: spread.id,
      cardIds: result.map((card) => card.id)
    });
  }

  return h("div", { className: "spread-practice" },
    h("div", { className: "spread-head" },
      h("div", null,
        h("p", { className: "eyebrow" }, "Spread Practice"),
        h("h2", null, "牌阵练习")
      ),
      h("button", { type: "button", className: "soft-btn", onClick: onBackToLearn }, "回到牌卡学习")
    ),
    h(SpreadTypeSelector, {
      spreadTypes: SPREAD_TYPES,
      selectedSpreadType,
      onSelect: handleSpreadTypeChange
    }),
    h("div", { className: "spread-actions" },
      h("div", null,
        h("strong", null, spread.title),
        h("p", null, spread.subtitle)
      ),
      h("button", { type: "button", className: "primary-btn", onClick: handleDraw }, "开始抽牌")
    ),
    error && h("p", { className: "spread-error" }, error),
    drawnCards.length
      ? h(SpreadResult, {
        spread,
        cards: drawnCards,
        onStudyCard
      })
      : h("section", { className: "spread-empty" },
        h("p", null, "选择一种牌阵后点击「开始抽牌」，用位置关系练习牌义组合。")
      )
  );
}

function SpreadTypeSelector({ spreadTypes, selectedSpreadType, onSelect }) {
  return h("div", { className: "spread-type-grid" },
    spreadTypes.map((spreadType) => h("button", {
      key: spreadType.id,
      type: "button",
      className: spreadType.id === selectedSpreadType ? "is-active" : "",
      onClick: () => onSelect(spreadType.id)
    },
      h("strong", null, spreadType.title),
      h("span", null, spreadType.subtitle)
    ))
  );
}

function SpreadResult({ spread, cards, onStudyCard }) {
  const positionedCards = cards.map((card, index) => ({
    card,
    position: spread.positions[index] || `位置 ${index + 1}`
  }));

  return h("div", { className: "spread-result" },
    h("div", { className: `spread-cards ${cards.length === 1 ? "is-single" : ""}` },
      positionedCards.map((item) => h(SpreadCard, {
        key: `${item.position}-${item.card.id}`,
        position: item.position,
        card: item.card,
        onStudyCard
      }))
    ),
    cards.length > 1 && h(SpreadSummaryV2, { positionedCards }),
    h(SpreadReflectionQuestions, { questions: spread.questions })
  );
}

function SpreadCard({ position, card, onStudyCard }) {
  const keywords = getDailyKeywords(card).slice(0, 4);
  const brief = card.coreMeaning || card.upright || card.theme || card.memory || "观察这张牌的图像、关键词和位置，练习建立自己的理解。";

  return h("article", { className: "spread-card" },
    h("p", { className: "spread-position" }, position),
    h(SpreadCardVisual, { card }),
    h("h3", null, card.name),
    h("p", { className: "spread-keywords" }, keywords.length ? keywords.join("、") : "观察图像，理解牌义"),
    h("p", { className: "spread-brief" }, cleanQuizText(brief)),
    h("button", { type: "button", className: "soft-btn", onClick: () => onStudyCard(card) }, "学习这张牌")
  );
}

function SpreadCardVisual({ card }) {
  const [accent, secondary, base] = card.palette || ["#c96a3e", "#ead7a5", "#f7f1dc"];

  return h("div", {
    className: `spread-card-visual card-art card-art-${card.id}`,
    style: {
      "--accent": accent,
      "--secondary": secondary,
      "--base": base
    }
  },
    h("div", { className: "card-label" },
      h("span", null, card.number),
      h("strong", null, card.name)
    ),
    h(CardArtwork, { card })
  );
}

function SpreadSummary({ positionedCards }) {
  return h("section", { className: "spread-summary" },
    h("h3", null, "组合主题"),
    positionedCards.map(({ position, card }) => h("p", { key: `${position}-${card.id}` },
      `${position}位置的「${card.name}」提示${getCardStudyFocus(card)}。`
    )),
    h("h4", null, "学习提示"),
    h("p", null, "观察这组牌之间的能量流动：哪张牌像起点？哪张牌代表行动？哪张牌代表限制？")
  );
}

function SpreadSummaryV2({ positionedCards }) {
  const spreadInsight = getSpreadInsight(positionedCards.map((item) => item.card));

  return h("section", { className: "spread-summary ai-spread-summary" },
    h("h3", null, "AI组合主题"),
    spreadInsight.cardBreakdown.map((item) => h("p", { key: item.card },
      h("strong", null, `${item.card}：`),
      item.meaning
    )),
    h("h4", null, "牌与牌之间的关系"),
    h("p", null, spreadInsight.relationship),
    h("h4", null, "整体故事线"),
    h("p", null, spreadInsight.narrative),
    h("h4", null, "学习提示"),
    h("p", null, spreadInsight.learningInsight),
    h("h4", null, "冲突点 / 张力点"),
    h("p", null, spreadInsight.contradictionPoints)
  );
}

function SpreadReflectionQuestions({ questions }) {
  return h("section", { className: "spread-questions" },
    h("h3", null, "思考问题"),
    h("ol", null, questions.map((question) => h("li", { key: question }, question)))
  );
}

function getCardStudyFocus(card) {
  const keywords = getDailyKeywords(card).slice(0, 2);
  if (keywords.length) return keywords.join("与");
  if (card.coreMeaning) return card.coreMeaning;
  if (card.theme) return card.theme;
  return "这张牌的核心图像和情绪";
}

function drawSpreadCards(cards, count) {
  const usableCards = cards.filter((card) => card?.id);
  if (usableCards.length < count) return [];
  return shuffleItems(usableCards).slice(0, count);
}

function saveSpreadPracticeHistory(record) {
  try {
    const raw = localStorage.getItem(SPREAD_HISTORY_STORAGE_KEY);
    const history = raw ? JSON.parse(raw) : [];
    const next = [record, ...(Array.isArray(history) ? history : [])].slice(0, 20);
    localStorage.setItem(SPREAD_HISTORY_STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    // Spread practice should remain usable even when history storage is unavailable.
  }
}

function QuizMode({ cards, onBackToLearn, onAnswerCard }) {
  const [quizQuestions, setQuizQuestions] = useState(() => generateQuizQuestions(cards));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizResult, setQuizResult] = useState({ correct: 0, wrong: 0 });
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const isFinished = currentQuestionIndex >= quizQuestions.length;

  function restartQuiz() {
    setQuizQuestions(generateQuizQuestions(cards));
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setQuizResult({ correct: 0, wrong: 0 });
  }

  function handleAnswer(optionId) {
    if (isAnswered || !currentQuestion) return;
    const isCorrect = optionId === currentQuestion.correctOptionId;
    setSelectedAnswer(optionId);
    setIsAnswered(true);
    setQuizResult((result) => ({
      correct: result.correct + (isCorrect ? 1 : 0),
      wrong: result.wrong + (isCorrect ? 0 : 1)
    }));
    onAnswerCard(currentQuestion.cardId, isCorrect);
  }

  function goNextQuestion() {
    if (!isAnswered) return;
    setCurrentQuestionIndex((index) => index + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);
  }

  if (!quizQuestions.length) {
    return h("div", { className: "quiz-mode" },
      h("section", { className: "quiz-card quiz-empty" },
        h("p", { className: "eyebrow" }, "Quiz Mode"),
        h("h2", null, "暂时还没有足够的数据生成测验"),
        h("p", null, "可以先继续补充牌卡关键词或图像元素，之后这里会自动生成题目。"),
        h("button", { type: "button", onClick: onBackToLearn }, "回到牌卡学习")
      )
    );
  }

  if (isFinished) {
    return h(QuizResult, {
      result: quizResult,
      total: quizQuestions.length,
      onRestart: restartQuiz,
      onBackToLearn
    });
  }

  return h("div", { className: "quiz-mode" },
    h("div", { className: "quiz-head" },
      h("div", null,
        h("p", { className: "eyebrow" }, "Quiz Mode"),
        h("h2", null, "测验模式")
      ),
      h("button", { type: "button", className: "soft-btn", onClick: onBackToLearn }, "回到牌卡学习")
    ),
    h(QuizQuestion, {
      question: currentQuestion,
      index: currentQuestionIndex,
      total: quizQuestions.length,
      selectedAnswer,
      isAnswered,
      onSelect: handleAnswer,
      onNext: goNextQuestion
    })
  );
}

function QuizQuestion({ question, index, total, selectedAnswer, isAnswered, onSelect, onNext }) {
  return h("article", { className: "quiz-card" },
    h("div", { className: "quiz-progress" },
      h("span", null, `第 ${index + 1} / ${total} 题`),
      h("span", null, question.typeLabel)
    ),
    question.meta && h("p", { className: "quiz-meta" }, question.meta),
    h("h3", null, question.prompt),
    question.clue && h("div", { className: "quiz-clue" }, question.clue),
    h("div", { className: "quiz-options" },
      question.options.map((option, optionIndex) => h(QuizOption, {
        key: option.id,
        option,
        optionIndex,
        isAnswered,
        isSelected: selectedAnswer === option.id,
        isCorrect: question.correctOptionId === option.id,
        onSelect: () => onSelect(option.id)
      }))
    ),
    isAnswered && h(QuizFeedback, { question, selectedAnswer }),
    h("div", { className: "quiz-actions" },
      h("button", {
        type: "button",
        className: "primary-btn",
        disabled: !isAnswered,
        onClick: onNext
      }, index + 1 === total ? "查看结果" : "下一题")
    )
  );
}

function QuizOption({ option, optionIndex, isAnswered, isSelected, isCorrect, onSelect }) {
  const optionLetters = ["A", "B", "C", "D"];
  const stateClass = isAnswered && isCorrect
    ? " is-correct"
    : isAnswered && isSelected
      ? " is-wrong"
      : "";

  return h("button", {
    type: "button",
    className: `quiz-option${isSelected ? " is-selected" : ""}${stateClass}`,
    disabled: isAnswered,
    onClick: onSelect
  },
    h("span", null, optionLetters[optionIndex]),
    h("strong", null, option.text)
  );
}

function QuizFeedback({ question, selectedAnswer }) {
  const selectedOption = question.options.find((option) => option.id === selectedAnswer);
  const correctOption = question.options.find((option) => option.id === question.correctOptionId);
  const isCorrect = selectedAnswer === question.correctOptionId;

  return h("section", { className: `quiz-feedback ${isCorrect ? "is-correct" : "is-wrong"}` },
    h("strong", null, isCorrect ? "回答正确" : "回答错误"),
    h("p", null, isCorrect
      ? `你选择了「${selectedOption ? selectedOption.text : ""}」。`
      : `正确答案是「${correctOption ? correctOption.text : ""}」。`),
    h("p", null, question.explanation)
  );
}

function QuizResult({ result, total, onRestart, onBackToLearn }) {
  const accuracy = total ? Math.round((result.correct / total) * 100) : 0;

  return h("div", { className: "quiz-mode" },
    h("section", { className: "quiz-card quiz-result" },
      h("p", { className: "eyebrow" }, "Quiz Complete"),
      h("h2", null, "本次测验完成"),
      h("div", { className: "result-grid" },
        h("div", null, h("strong", null, result.correct), h("span", null, "正确")),
        h("div", null, h("strong", null, result.wrong), h("span", null, "错误")),
        h("div", null, h("strong", null, `${accuracy}%`), h("span", null, "正确率"))
      ),
      h("div", { className: "quiz-actions" },
        h("button", { type: "button", className: "primary-btn", onClick: onRestart }, "再来一组"),
        h("button", { type: "button", className: "soft-btn", onClick: onBackToLearn }, "回到牌卡学习")
      )
    )
  );
}

function generateQuizQuestions(cards) {
  const usableCards = cards.filter((card) => card?.id && card?.name);
  const questionPool = [];

  usableCards.forEach((card) => {
    [
      buildKeywordToCardQuestion,
      buildCardToKeywordsQuestion,
      buildDeepInsightQuestion,
      buildElementMeaningQuestion
    ].forEach((builder) => {
      const question = builder(card, usableCards);
      if (question) questionPool.push(question);
    });
  });

  const selectedQuestions = [];
  const questionsByType = questionPool.reduce((groups, question) => {
    groups[question.typeLabel] = groups[question.typeLabel] || [];
    groups[question.typeLabel].push(question);
    return groups;
  }, {});

  Object.keys(questionsByType).forEach((typeLabel) => {
    selectedQuestions.push(sampleItem(questionsByType[typeLabel]));
  });

  const selectedIds = new Set(selectedQuestions.map((question) => question.id));
  const remainingQuestions = shuffleItems(questionPool.filter((question) => !selectedIds.has(question.id)));
  const quizSet = [...selectedQuestions, ...remainingQuestions].slice(0, Math.min(5, questionPool.length));

  return shuffleItems(quizSet);
}

function buildKeywordToCardQuestion(card, cards) {
  const keywords = formatKeywords(card);
  if (!keywords) return null;

  const distractors = cards
    .filter((item) => item.id !== card.id)
    .map((item) => item.name);
  const options = makeQuizOptions(card.name, distractors);
  if (!options) return null;

  return withCorrectOption({
    typeLabel: "看关键词猜牌",
    cardId: card.id,
    prompt: "这些关键词对应哪张牌？",
    clue: keywords,
    options,
    correctText: card.name,
    explanation: `这些关键词对应的是「${card.name}」。${card.coreMeaning || card.theme || card.upright || ""}`
  });
}

function buildCardToKeywordsQuestion(card, cards) {
  const correctKeywords = formatKeywords(card);
  if (!correctKeywords) return null;

  const distractors = cards
    .filter((item) => item.id !== card.id)
    .map(formatKeywords)
    .filter(Boolean);
  const options = makeQuizOptions(correctKeywords, distractors);
  if (!options) return null;

  return withCorrectOption({
    typeLabel: "看牌名猜关键词",
    cardId: card.id,
    prompt: `「${card.name}」对应哪组关键词？`,
    options,
    correctText: correctKeywords,
    explanation: `「${card.name}」的核心可以从这些关键词进入：${correctKeywords}。${card.coreMeaning || card.deepInsight || card.memory || card.theme || ""}`
  });
}

function buildDeepInsightQuestion(card, cards) {
  const insight = getTarotInsight(card, { query: card.deepInsight || card.coreMeaning || card.name });
  const correctInsight = insight.deepInsight;
  if (!correctInsight) return null;

  const distractors = cards
    .filter((item) => item.id !== card.id)
    .map((item) => getTarotInsight(item, { query: item.name }).deepInsight)
    .filter(Boolean);
  const options = makeQuizOptions(card.name, cards.filter((item) => item.id !== card.id).map((item) => item.name));
  if (!options || distractors.length < 3) return null;

  return withCorrectOption({
    typeLabel: "看深度洞察猜牌",
    cardId: card.id,
    prompt: "这段深度洞察对应哪张牌？",
    clue: correctInsight,
    options,
    correctText: card.name,
    explanation: `这段洞察对应「${card.name}」：${insight.summary}`
  });
}

function buildElementMeaningQuestion(card, cards) {
  const elements = (card.imageElements || []).filter((element) => element?.description);
  if (!elements.length) return null;

  const element = sampleItem(elements);
  const distractors = cards
    .filter((item) => item.id !== card.id)
    .flatMap((item) => item.imageElements || [])
    .map((item) => item.description)
    .filter(Boolean);
  const options = makeQuizOptions(element.description, distractors);
  if (!options) return null;

  return withCorrectOption({
    typeLabel: "看图像元素猜含义",
    cardId: card.id,
    meta: `牌卡：${card.name} · 图像元素：${element.label}`,
    prompt: `${element.label}在这张牌中主要象征什么？`,
    options,
    correctText: element.description,
    explanation: `在「${card.name}」中，「${element.title || element.label}」：${element.description}`
  });
}

function withCorrectOption(question) {
  const correctOption = question.options.find((option) => option.text === cleanQuizText(question.correctText));
  if (!correctOption) return null;
  return {
    ...question,
    id: `${question.cardId}-${question.typeLabel}-${Math.random().toString(36).slice(2)}`,
    correctOptionId: correctOption.id
  };
}

function makeQuizOptions(correctText, distractors) {
  const uniqueTexts = uniqueQuizTexts([correctText, ...shuffleItems(distractors)]);
  if (uniqueTexts.length < 4) return null;
  return shuffleItems(uniqueTexts.slice(0, 4)).map((text, index) => ({
    id: `option-${index}-${Math.random().toString(36).slice(2)}`,
    text
  }));
}

function uniqueQuizTexts(items) {
  const seen = new Set();
  return items
    .map(cleanQuizText)
    .filter(Boolean)
    .filter((text) => {
      if (seen.has(text)) return false;
      seen.add(text);
      return true;
    });
}

function cleanQuizText(text) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (!value) return "";
  return value.length > 96 ? `${value.slice(0, 94)}...` : value;
}

function formatKeywords(card) {
  const keywords = Array.isArray(card?.keywords) ? card.keywords.filter(Boolean).slice(0, 4) : [];
  if (keywords.length) return keywords.join("、");
  return card?.theme || "";
}

function shuffleItems(items) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [next[index], next[target]] = [next[target], next[index]];
  }
  return next;
}

function sampleItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getSelectedElement(card, selectedElementId) {
  const elements = card.imageElements || [];
  if (elements.length) {
    return elements.find((item) => item.id === selectedElementId) || elements[0];
  }

  const symbol = card.symbols && card.symbols[0];
  if (!symbol) return null;

  return {
    id: symbol.id,
    label: symbol.label,
    title: symbol.label,
    description: symbol.meaning,
    prompt: symbol.hint
  };
}

function ElementStudyPanel({ card, element }) {
  if (!element) {
    return h("section", { className: "symbol-box" },
      h("p", { className: "eyebrow" }, "图像元素解析"),
      h("h3", null, card.name),
      h("p", null, "这张牌暂时还没有单独的图像元素数据，可以先结合关键词、正逆位和牌面整体来学习。")
    );
  }

  const guide = getEnhancedImageGuide(card).find((item) => item.element === (element.label || element.title));

  return h("section", { className: "symbol-box" },
    h("p", { className: "eyebrow" }, "图像元素解析"),
    h("h3", null, element.title || element.label),
    h("p", null, element.description),
    h("p", { className: "element-core-link" },
      h("strong", null, "关联核心含义："),
      element.relatedCoreMeaning || card.coreMeaning || card.theme
    ),
    guide && h("p", { className: "element-core-link" },
      h("strong", null, "AI图像提示："),
      guide.learningPrompt
    ),
    element.prompt && h(React.Fragment, null,
      h("h4", null, "学习提示："),
      h("blockquote", null, element.prompt)
    )
  );
}

function TarotVisual({ card, selectedElementId, setSelectedElementId }) {
  const [accent, secondary, base] = card.palette;
  return h("div", {
    className: `tarot-card card-image-wrapper card-art card-art-${card.id}`,
    style: {
      "--accent": accent,
      "--secondary": secondary,
      "--base": base
    },
    "aria-label": "可点击塔罗牌面"
  },
    h("div", { className: "card-label" },
      h("span", null, card.number),
      h("strong", null, card.name)
    ),
    h(CardArtwork, { card }),
    h(ImageHotspots, {
      elements: card.imageElements || [],
      selectedElementId,
      setSelectedElementId
    })
  );
}

function ImageHotspots({ elements, selectedElementId, setSelectedElementId }) {
  return h(React.Fragment, null,
    elements.map((element) => h("button", {
      key: element.id,
      type: "button",
      className: `image-hotspot ${selectedElementId === element.id ? "active" : ""}`,
      style: { left: `${element.x}%`, top: `${element.y}%` },
      onClick: () => setSelectedElementId(element.id),
      "aria-label": element.title || element.label
    }, h("span", null, element.label)))
  );
}

function getCardImage(card) {
  const images = window.TAROT_CARD_IMAGES || {};
  return images[card.id] || card.localImageUrl || null;
}

function CardArtwork({ card }) {
  const imageUrl = getCardImage(card);
  if (imageUrl) {
    return h("img", {
      className: "card-photo",
      src: imageUrl,
      alt: `${card.name} ${card.english || ""}`.trim(),
      loading: "lazy"
    });
  }

  const known = knownArtwork(card.id);
  if (known) return h(React.Fragment, null, ...known);

  const visual = card.visual || {};
  const glyph = visual.glyph || card.number || "?";
  const count = Math.min(visual.count || 1, 10);
  return h(React.Fragment, null,
    h("div", { className: "generic-sky" }),
    h("div", { className: "generic-orb" }, glyph),
    h("div", { className: "generic-path" }),
    h("div", { className: "generic-center" }, visual.center || card.number),
    h("div", { className: "generic-pips" },
      Array.from({ length: count }, (_, index) => h("span", { key: index }, glyph))
    ),
    h("div", { className: "generic-base" })
  );
}

function knownArtwork(id) {
  const art = {
    fool: [
      h("div", { className: "sun" }),
      h("div", { className: "mountains" }),
      h("div", { className: "person fool-person" }),
      h("div", { className: "rose" }),
      h("div", { className: "dog" }),
      h("div", { className: "cliff" })
    ],
    magician: [
      h("div", { className: "infinity" }, "∞"),
      h("div", { className: "person magician-person" }),
      h("div", { className: "wand" }),
      h("div", { className: "table" }, h("span", null, "♣"), h("span", null, "♡"), h("span", null, "♢"), h("span", null, "♤")),
      h("div", { className: "flowers" })
    ],
    "high-priestess": [
      h("div", { className: "pillar left" }, "B"),
      h("div", { className: "pillar right" }, "J"),
      h("div", { className: "veil" }),
      h("div", { className: "person priestess-person" }),
      h("div", { className: "scroll" }, "TORA"),
      h("div", { className: "moon" })
    ],
    empress: [
      h("div", { className: "river" }),
      h("div", { className: "wheat" }),
      h("div", { className: "person empress-person" }),
      h("div", { className: "crown" }, "✦ ✦ ✦"),
      h("div", { className: "venus" }, "♀")
    ]
  };
  return art[id];
}

function NavCard({ title, subtitle, description, onClick }) {
  return h("button", { className: "nav-card", onClick },
    h("span", null, subtitle),
    h("strong", null, title),
    h("p", null, description)
  );
}

function viewLabel(state) {
  if (state.currentView === "major") return "大阿卡纳牌组";
  if (state.currentView === "minor") return "小阿卡纳牌组";
  if (state.currentView === "suit") {
    return (SUITS.find((suit) => suit.id === state.selectedSuit) || {}).name || "花色牌组";
  }
  if (state.currentView === "cardList") return "牌卡详情";
  return "选择牌组";
}

function isMajorCard(card) {
  return card.suit === "大阿卡纳" || FIRST_MAJOR_IDS.includes(card.id);
}

function loadProgressFromLocalStorage() {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function saveProgressToLocalStorage(progress) {
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

function getTodayKey() {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function getOrCreateDailyCard(cards) {
  const usableCards = cards.filter((card) => card?.id);
  if (!usableCards.length) return null;
  const today = getTodayKey();

  try {
    const saved = JSON.parse(localStorage.getItem(DAILY_CARD_STORAGE_KEY) || "null");
    const savedCard = saved?.date === today && saved?.cardId
      ? usableCards.find((card) => card.id === saved.cardId)
      : null;

    if (savedCard) return savedCard;
  } catch (error) {
    // Ignore malformed stored data and create a fresh daily card below.
  }

  const randomCard = usableCards[Math.floor(Math.random() * usableCards.length)];
  try {
    localStorage.setItem(DAILY_CARD_STORAGE_KEY, JSON.stringify({
      date: today,
      cardId: randomCard.id
    }));
  } catch (error) {
    // The feature should still work for the session even if storage is unavailable.
  }
  return randomCard;
}

function defaultProgressRecord() {
  return {
    status: "not_started",
    lastStudiedAt: null,
    viewCount: 0,
    quizCorrect: 0,
    quizWrong: 0
  };
}

function normalizeProgressRecord(record) {
  return {
    ...defaultProgressRecord(),
    ...(record || {})
  };
}

function getCardProgress(cardId, progress) {
  return normalizeProgressRecord(progress[cardId]);
}

function getCardStatus(cardId, progress) {
  return getCardProgress(cardId, progress).status || "not_started";
}

function isCompletedStatus(status) {
  return status === "learned" || status === "mastered";
}

function calculateProgressSummary(cards, progress) {
  const majorCards = cards.filter(isMajorCard);
  const minorCards = cards.filter((card) => !isMajorCard(card));
  const completed = (list) => list.filter((card) => isCompletedStatus(getCardStatus(card.id, progress))).length;

  return {
    total: cards.length,
    majorTotal: majorCards.length,
    minorTotal: minorCards.length,
    completedTotal: completed(cards),
    completedMajor: completed(majorCards),
    completedMinor: completed(minorCards),
    mastered: cards.filter((card) => getCardStatus(card.id, progress) === "mastered").length
  };
}

const DOMAIN_LABELS = {
  career: "事业",
  love: "感情",
  self: "自我",
  money: "财运"
};

function getKnowledge(cardId) {
  const all = window.TAROT_KNOWLEDGE_CARDS || {};
  return all[cardId] || null;
}

function getApprovedKnowledge(cardId) {
  const entry = getKnowledge(cardId);
  return entry && entry.status === "approved" ? entry : null;
}

function getKnowledgeMeta() {
  return window.TAROT_KNOWLEDGE_META || { total: 0, approved: 0, draft: 0, cards: [], warnings: [] };
}

function getDailyKeywords(card) {
  return Array.isArray(card?.keywords) ? card.keywords.filter(Boolean) : [];
}

function getDailyElements(card) {
  return (card?.imageElements || [])
    .map((element) => element.title || element.label)
    .filter(Boolean)
    .slice(0, 5);
}

function getTarotInsight(card, context = {}) {
  if (window.generateTarotInsight) {
    return window.generateTarotInsight(card, context);
  }

  return {
    summary: card?.coreMeaning || card?.theme || card?.upright || "",
    keywords: getDailyKeywords(card),
    upright: card?.upright || "",
    reversed: card?.reversed || "",
    deepInsight: card?.deepInsight || card?.memory || "",
    imageGuide: getEnhancedImageGuide(card),
    lifeScenes: Array.isArray(card?.lifeScenes) ? card.lifeScenes : [],
    learningLayers: card?.learningLayers || {},
    ragSnippets: []
  };
}

function getEnhancedImageGuide(card) {
  if (window.enhanceImageMeaning) {
    return window.enhanceImageMeaning(card?.imageElements || [], card);
  }

  return (card?.imageElements || []).map((element) => ({
    element: element.label || element.title,
    symbol: element.description || element.meaning || "",
    learningPrompt: element.prompt || element.hint || "",
    relatedCoreMeaning: card?.coreMeaning || card?.theme || ""
  }));
}

function getSpreadInsight(cards) {
  if (window.generateSpreadInsight) {
    return window.generateSpreadInsight(cards);
  }

  return {
    cardBreakdown: cards.map((card) => ({
      card: card.name,
      meaning: card.coreMeaning || card.theme || card.upright || ""
    })),
    relationship: "这组牌可以从关键词之间的补充与张力来理解。",
    narrative: cards.map((card) => `${card.name}：${card.coreMeaning || card.theme || ""}`).join(" "),
    learningInsight: "先看单张牌，再看牌与牌之间如何互相补充。",
    contradictionPoints: "暂无明显冲突点。"
  };
}

function h(type, props, ...children) {
  return React.createElement(type, props, ...children.flat());
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
