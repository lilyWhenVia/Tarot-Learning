const GYM_CONFIG_KEY = "tarot-gym-config-v1";
const GYM_HISTORY_KEY = "tarot-gym-history-v1";
const GYM_STATE_KEY = "tarot-gym-session-v1";

const DEFAULT_CONFIG = {
  apiKey: "",
  apiEndpoint: "https://api.openai.com/v1/chat/completions",
  model: "gpt-4o-mini",
};

const SCENARIO_POOLS = {
  career: {
    label: "事业工作",
    questions: [
      "我该不该接受这个 offer？",
      "现在跳槽时机对吗？",
      "我和这位同事的冲突该怎么处理？",
      "创业的想法靠谱吗？",
      "工作让我精疲力竭，我该坚持还是放弃？",
      "我适合往哪个方向发展？",
    ],
  },
  love: {
    label: "感情关系",
    questions: [
      "这段关系还有继续下去的价值吗？",
      "为什么我总是在感情里重复同一种模式？",
      "对方对我的真实态度是什么？",
      "我该主动联系他/她吗？",
      "单身很久了，我的问题出在哪？",
    ],
  },
  self: {
    label: "自我成长",
    questions: [
      "我感觉被困住了，该怎么突破？",
      "为什么我总是拖延重要决定？",
      "我需要放下什么才能往前走？",
      "现在最重要的人生课题是什么？",
      "我该如何找回内心的平静？",
    ],
  },
  decision: {
    label: "两难抉择",
    questions: [
      "选项 A 和选项 B，哪个更适合我？",
      "我害怕做出错的选择，该怎么判断？",
      "周围人意见不一致，我该听谁的？",
    ],
  },
};

function loadGymConfig() {
  try {
    const raw = localStorage.getItem(GYM_CONFIG_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (e) { /* ignore */ }
  return { ...DEFAULT_CONFIG };
}

function saveGymConfig(config) {
  localStorage.setItem(GYM_CONFIG_KEY, JSON.stringify(config));
}

function loadGymHistory() {
  try {
    const raw = localStorage.getItem(GYM_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return [];
}

function saveGymHistory(entry) {
  const history = loadGymHistory();
  history.unshift(entry);
  if (history.length > 50) history.length = 50;
  localStorage.setItem(GYM_HISTORY_KEY, JSON.stringify(history));
}

function loadGymSession() {
  try {
    const raw = localStorage.getItem(GYM_STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return null;
}

function saveGymSession(session) {
  localStorage.setItem(GYM_STATE_KEY, JSON.stringify(session));
}

function drawCards(cards, count) {
  const pool = [...cards];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

function TranslationGym({ cards, onStudyCard }) {
  const [config, setConfig] = useState(loadGymConfig);
  const [showSettings, setShowSettings] = useState(!config.apiKey);

  const saved = loadGymSession();
  const [step, setStep] = useState(saved ? saved.step : "scenario");
  const [domain, setDomain] = useState(saved ? saved.domain : "career");
  const [customQuestion, setCustomQuestion] = useState(saved ? saved.customQuestion : "");
  const [cardCount, setCardCount] = useState(saved ? saved.cardCount : 3);
  const [drawnCards, setDrawnCards] = useState(saved ? saved.drawnCards : []);
  const [question, setQuestion] = useState(saved ? saved.question : "");

  const [coreEnergy, setCoreEnergy] = useState(saved ? saved.coreEnergy : "");
  const [domainProjection, setDomainProjection] = useState(saved ? saved.domainProjection : "");
  const [actionAdvice, setActionAdvice] = useState(saved ? saved.actionAdvice : "");

  const [feedback, setFeedback] = useState(saved ? saved.feedback : "");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState(saved ? saved.feedbackError : "");
  const [history, setHistory] = useState(loadGymHistory);

  const pool = SCENARIO_POOLS[domain];
  const questions = pool ? pool.questions : [];

  function persistSession(overrides) {
    saveGymSession({
      step, domain, customQuestion, cardCount, drawnCards, question,
      coreEnergy, domainProjection, actionAdvice,
      feedback, feedbackError,
      ...overrides,
    });
  }

  function resetSession() {
    setStep("scenario");
    setDomain("career");
    setCustomQuestion("");
    setCardCount(3);
    setDrawnCards([]);
    setQuestion("");
    setCoreEnergy("");
    setDomainProjection("");
    setActionAdvice("");
    setFeedback("");
    setFeedbackError("");
    saveGymSession(null);
  }

  function handleDomainChange(newDomain) {
    setDomain(newDomain);
    setCustomQuestion("");
    persistSession({ domain: newDomain, customQuestion: "" });
  }

  function selectQuestion(q) {
    setQuestion(q);
    setCustomQuestion("");
    persistSession({ question: q, customQuestion: "" });
  }

  function handleUseCustom() {
    const q = customQuestion.trim();
    if (!q) return;
    setQuestion(q);
    persistSession({ question: q });
  }

  function handleDraw() {
    const drawn = drawCards(cards, cardCount);
    setDrawnCards(drawn);
    setStep("interpreting");
    setCoreEnergy("");
    setDomainProjection("");
    setActionAdvice("");
    setFeedback("");
    setFeedbackError("");
    persistSession({ step: "interpreting", drawnCards: drawn, coreEnergy: "", domainProjection: "", actionAdvice: "", feedback: "", feedbackError: "" });
  }

  function handleRedraw() {
    const drawn = drawCards(cards, cardCount);
    setDrawnCards(drawn);
    setCoreEnergy("");
    setDomainProjection("");
    setActionAdvice("");
    setFeedback("");
    setFeedbackError("");
    persistSession({ drawnCards: drawn, coreEnergy: "", domainProjection: "", actionAdvice: "", feedback: "", feedbackError: "" });
  }

  function handleBackToScenario() {
    setStep("scenario");
    setDrawnCards([]);
    setCoreEnergy("");
    setDomainProjection("");
    setActionAdvice("");
    setFeedback("");
    setFeedbackError("");
    persistSession({ step: "scenario", drawnCards: [], coreEnergy: "", domainProjection: "", actionAdvice: "", feedback: "", feedbackError: "" });
  }

  async function handleGetFeedback() {
    if (!coreEnergy.trim() && !domainProjection.trim() && !actionAdvice.trim()) return;

    setFeedbackLoading(true);
    setFeedbackError("");
    setFeedback("");

    const cardDescriptions = drawnCards.map((card, i) =>
      `第${i + 1}张牌：${card.name}（${card.english}）- 关键词：${(card.keywords || []).join("、")} - 核心含义：${card.upright}`
    ).join("\n");

    const systemPrompt = `你是一位有十年经验的塔罗导师。你的任务是帮助学生学习"把牌意翻译成对真实问题的回答"的能力。

你不会给出完整的占卜解读。你会像一个老师一样：
1. 点评学生写的"核心能量"是否抓住了牌的关键，有没有遗漏重要层面
2. 点评"领域投射"是否自然——学生是否真的把牌意放进了问题场景，还是只是在复述牌意
3. 点评"行动建议"是否具体可执行——模糊的建议（"你需要反思"）必须指出来，鼓励具体建议
4. 给一个简短的示范：如果你拿到同样的牌和问题，你会怎么把这三步串成一段自然的话

你的语气是温和但严格的——像教练，不说"很棒"除非真的洞察到了点子上。学生卡住的地方就是进步的地方。

请用中文回复，保持简洁（300字以内）。`;

    const userMessage = `问卜者的问题：${question}

抽到的牌：
${cardDescriptions}

学生的解读：
【核心能量】${coreEnergy || "（未填写）"}
【领域投射】${domainProjection || "（未填写）"}
【行动建议】${actionAdvice || "（未填写）"}

请点评学生的翻译能力，并给出示范。`;

    try {
      const res = await fetch(config.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`API 错误 (${res.status}): ${err.slice(0, 200)}`);
      }

      const data = await res.json();
      const aiText = data.choices?.[0]?.message?.content || "（AI 未返回内容）";
      setFeedback(aiText);
      setStep("feedback");

      const entry = {
        createdAt: new Date().toISOString(),
        question,
        domain,
        cardIds: drawnCards.map((c) => c.id),
        interpretation: { coreEnergy, domainProjection, actionAdvice },
        feedback: aiText,
      };
      saveGymHistory(entry);
      setHistory(loadGymHistory());
      persistSession({ step: "feedback", feedback: aiText, feedbackError: "" });
    } catch (e) {
      setFeedbackError(e.message || "请求失败，请检查 API 设置和网络");
      persistSession({ feedbackError: e.message || "请求失败" });
    } finally {
      setFeedbackLoading(false);
    }
  }

  function saveConfig(newConfig) {
    setConfig(newConfig);
    saveGymConfig(newConfig);
    if (newConfig.apiKey) setShowSettings(false);
  }

  if (showSettings) {
    return h(GymSettings, { config, onSave: saveConfig, onCancel: () => setShowSettings(false) });
  }

  return h("div", { className: "gym-container" },
    h("div", { className: "gym-head" },
      h("div", null,
        h("p", { className: "eyebrow" }, "Translation Gym"),
        h("h2", null, "翻译训练场")
      ),
      h("div", { className: "gym-head-actions" },
        h("button", { type: "button", className: "soft-btn", onClick: () => setShowSettings(true) }, "API 设置"),
        history.length > 0 && h("button", { type: "button", className: "soft-btn", onClick: () => setStep("history") }, "练习记录"),
        step !== "scenario" && h("button", { type: "button", className: "soft-btn", onClick: resetSession }, "重新开始")
      )
    ),

    step === "scenario" && h(ScenarioStep, {
      domain, onDomainChange: handleDomainChange,
      questions, selectedQuestion: question,
      onSelectQuestion: selectQuestion,
      customQuestion, onCustomQuestionChange: setCustomQuestion,
      onUseCustom: handleUseCustom,
      cardCount, onCardCountChange: setCardCount,
      onDraw: handleDraw,
    }),

    step === "interpreting" && h(InterpretingStep, {
      question, drawnCards, cardCount,
      coreEnergy, onCoreEnergyChange: setCoreEnergy,
      domainProjection, onDomainProjectionChange: setDomainProjection,
      actionAdvice, onActionAdviceChange: setActionAdvice,
      onGetFeedback: handleGetFeedback,
      feedbackLoading, feedbackError,
      onRedraw: handleRedraw,
    }),

    step === "feedback" && h(FeedbackStep, {
      question, drawnCards,
      coreEnergy, domainProjection, actionAdvice,
      feedback,
      onBackToInterpreting: () => {
        setStep("interpreting");
        setFeedback("");
        persistSession({ step: "interpreting", feedback: "" });
      },
      onNewPractice: resetSession,
    }),

    step === "history" && h(HistoryStep, {
      history, cards,
      onBack: () => setStep("scenario"),
    })
  );
}

function GymSettings({ config, onSave, onCancel }) {
  const [draft, setDraft] = useState({ ...config });
  const [showKey, setShowKey] = useState(false);

  function handleSave() {
    if (!draft.apiKey.trim()) return;
    onSave(draft);
  }

  return h("div", { className: "gym-settings" },
    h("p", { className: "eyebrow" }, "API 配置"),
    h("h3", null, "连接 AI 翻译教练"),
    h("p", { className: "gym-settings-desc" }, "翻译训练场需要一个 AI 模型来扮演塔罗导师，给你反馈。支持任何兼容 OpenAI 接口的服务。API Key 只保存在你的浏览器本地。"),

    h("label", { className: "gym-field" },
      h("span", null, "API 端点"),
      h("input", {
        type: "text",
        value: draft.apiEndpoint,
        onInput: (e) => setDraft({ ...draft, apiEndpoint: e.target.value }),
        placeholder: "https://api.openai.com/v1/chat/completions",
      })
    ),
    h("label", { className: "gym-field" },
      h("span", null, "模型名称"),
      h("input", {
        type: "text",
        value: draft.model,
        onInput: (e) => setDraft({ ...draft, model: e.target.value }),
        placeholder: "gpt-4o-mini",
      })
    ),
    h("label", { className: "gym-field" },
      h("span", null, "API Key"),
      h("div", { className: "gym-key-row" },
        h("input", {
          type: showKey ? "text" : "password",
          value: draft.apiKey,
          onInput: (e) => setDraft({ ...draft, apiKey: e.target.value }),
          placeholder: "sk-...",
        }),
        h("button", { type: "button", className: "soft-btn", onClick: () => setShowKey(!showKey) }, showKey ? "隐藏" : "显示")
      )
    ),

    h("div", { className: "gym-settings-actions" },
      h("button", { type: "button", className: "soft-btn", onClick: onCancel }, "取消"),
      h("button", {
        type: "button",
        className: "primary-btn",
        onClick: handleSave,
        disabled: !draft.apiKey.trim(),
      }, "保存")
    )
  );
}

function ScenarioStep({
  domain, onDomainChange,
  questions, selectedQuestion, onSelectQuestion,
  customQuestion, onCustomQuestionChange, onUseCustom,
  cardCount, onCardCountChange,
  onDraw,
}) {
  return h("div", { className: "gym-step gym-scenario" },
    h("div", { className: "gym-section" },
      h("p", { className: "eyebrow" }, "Step 1"),
      h("h3", null, "选择练习领域"),
      h("div", { className: "gym-domain-grid" },
        Object.entries(SCENARIO_POOLS).map(([key, pool]) =>
          h("button", {
            key,
            type: "button",
            className: domain === key ? "gym-domain-btn is-active" : "gym-domain-btn",
            onClick: () => onDomainChange(key),
          }, h("strong", null, pool.label))
        )
      )
    ),

    h("div", { className: "gym-section" },
      h("p", { className: "eyebrow" }, "Step 2"),
      h("h3", null, "选择一个问题（或自己输入）"),
      h("div", { className: "gym-question-grid" },
        questions.map((q) =>
          h("button", {
            key: q,
            type: "button",
            className: selectedQuestion === q ? "gym-question-btn is-active" : "gym-question-btn",
            onClick: () => onSelectQuestion(q),
          }, q)
        ),
        h("button", {
          type: "button",
          className: customQuestion ? "gym-question-btn is-custom" : "gym-question-btn",
          onClick: onUseCustom,
          disabled: !customQuestion.trim(),
        }, customQuestion.trim() ? `"${customQuestion.trim()}"` : "自己输入一个问题…")
      ),
      h("div", { className: "gym-custom-row" },
        h("input", {
          type: "text",
          className: "gym-custom-input",
          value: customQuestion,
          onInput: (e) => onCustomQuestionChange(e.target.value),
          onKeyDown: (e) => { if (e.key === "Enter") onUseCustom(); },
          placeholder: "或在这里输入你自己的问题…",
        })
      )
    ),

    h("div", { className: "gym-section" },
      h("p", { className: "eyebrow" }, "Step 3"),
      h("h3", null, "选择抽牌数量"),
      h("div", { className: "gym-count-row" },
        [1, 2, 3].map((n) =>
          h("button", {
            key: n,
            type: "button",
            className: cardCount === n ? "gym-count-btn is-active" : "gym-count-btn",
            onClick: () => onCardCountChange(n),
          }, `${n} 张`)
        )
      )
    ),

    h("div", { className: "gym-section" },
      h("button", {
        type: "button",
        className: "primary-btn gym-draw-btn",
        onClick: onDraw,
        disabled: !selectedQuestion && !customQuestion.trim(),
      }, "开始抽牌")
    )
  );
}

function InterpretingStep({
  question, drawnCards,
  coreEnergy, onCoreEnergyChange,
  domainProjection, onDomainProjectionChange,
  actionAdvice, onActionAdviceChange,
  onGetFeedback, feedbackLoading, feedbackError,
  onRedraw,
}) {
  return h("div", { className: "gym-step gym-interpreting" },
    h("div", { className: "gym-question-banner" },
      h("p", { className: "eyebrow" }, "问卜者的问题"),
      h("p", { className: "gym-question-text" }, question)
    ),

    h("div", { className: "gym-cards-row" },
      drawnCards.map((card, i) =>
        h("div", { key: card.id, className: "gym-drawn-card" },
          h("p", { className: "gym-card-position" }, `第 ${i + 1} 张`),
          h("div", { className: "gym-card-visual" },
            h("span", { className: "gym-card-number" }, card.number),
            h("strong", null, card.name),
            h("small", null, card.english)
          ),
          h("div", { className: "gym-card-keywords" },
            (card.keywords || []).slice(0, 4).map((kw) => h("span", { key: kw, className: "gym-kw-tag" }, kw))
          ),
          h("p", { className: "gym-card-upright" }, card.upright)
        )
      )
    ),
    h("button", { type: "button", className: "soft-btn gym-redraw-btn", onClick: onRedraw }, "重新抽牌"),

    h("div", { className: "gym-section" },
      h("p", { className: "eyebrow" }, "你的解读"),
      h("h3", null, "三步翻译练习"),

      h("label", { className: "gym-field gym-field-area" },
        h("span", null, "第一步：每张牌的核心能量是什么？（不是背牌意，是用自己的话说这张牌在表达什么）"),
        h("textarea", {
          value: coreEnergy,
          onInput: (e) => onCoreEnergyChange(e.target.value),
          rows: 3,
          placeholder: "例：宝剑二的核心是回避决定——表面上她蒙着眼双手交叉，其实心里已经知道答案，只是不敢面对…",
        })
      ),

      h("label", { className: "gym-field gym-field-area" },
        h("span", null, "第二步：把这些能量投射到问卜者的问题领域上（用你的话把牌和问题连起来）"),
        h("textarea", {
          value: domainProjection,
          onInput: (e) => onDomainProjectionChange(e.target.value),
          rows: 3,
          placeholder: "例：问卜者问事业问题，宝剑二的回避放到这个场景里，意味着 ta 可能在离职/跳槽上已经纠结很久了，但故意不去看真实数据…",
        })
      ),

      h("label", { className: "gym-field gym-field-area" },
        h("span", null, "第三步：综合这几张牌，给问卜者一个具体的行动建议"),
        h("textarea", {
          value: actionAdvice,
          onInput: (e) => onActionAdviceChange(e.target.value),
          rows: 3,
          placeholder: "例：建议你本周内列出两个选项的优缺点清单，诚实面对数据——你其实已经有倾向了，回避只是在拖延痛苦…",
        })
      )
    ),

    h("div", { className: "gym-section" },
      h("button", {
        type: "button",
        className: "primary-btn gym-feedback-btn",
        onClick: onGetFeedback,
        disabled: feedbackLoading || (!coreEnergy.trim() && !domainProjection.trim() && !actionAdvice.trim()),
      }, feedbackLoading ? "AI 教练正在看你的解读…" : "提交给 AI 教练点评"),
      feedbackError && h("p", { className: "gym-error" }, feedbackError)
    )
  );
}

function FeedbackStep({
  question, drawnCards,
  coreEnergy, domainProjection, actionAdvice,
  feedback,
  onBackToInterpreting, onNewPractice,
}) {
  return h("div", { className: "gym-step gym-feedback" },
    h("div", { className: "gym-question-banner" },
      h("p", { className: "eyebrow" }, "练习回顾"),
      h("p", { className: "gym-question-text" }, question)
    ),

    h("div", { className: "gym-section" },
      h("p", { className: "eyebrow" }, "你的解读"),
      h("div", { className: "gym-answer-block" },
        h("p", null, h("strong", null, "核心能量："), coreEnergy || "（未填写）"),
        h("p", null, h("strong", null, "领域投射："), domainProjection || "（未填写）"),
        h("p", null, h("strong", null, "行动建议："), actionAdvice || "（未填写）"),
      )
    ),

    h("div", { className: "gym-section" },
      h("p", { className: "eyebrow" }, "AI 教练点评"),
      h("div", { className: "gym-feedback-block" },
        feedback.split("\n").filter(Boolean).map((line, i) =>
          h("p", { key: i }, line)
        )
      )
    ),

    h("div", { className: "gym-feedback-actions" },
      h("button", { type: "button", className: "soft-btn", onClick: onBackToInterpreting }, "修改解读"),
      h("button", { type: "button", className: "primary-btn", onClick: onNewPractice }, "再来一题")
    )
  );
}

function HistoryStep({ history, cards, onBack }) {
  function getCardName(id) {
    const card = cards.find((c) => c.id === id);
    return card ? `${card.name}` : id;
  }

  return h("div", { className: "gym-step gym-history" },
    h("div", { className: "gym-head" },
      h("div", null,
        h("p", { className: "eyebrow" }, "Practice Log"),
        h("h3", null, "练习记录")
      ),
      h("button", { type: "button", className: "soft-btn", onClick: onBack }, "返回训练")
    ),

    history.length === 0
      ? h("p", null, "还没有练习记录。完成一次翻译训练后会自动保存到这里。")
      : h("div", { className: "gym-history-list" },
        history.map((entry, i) =>
          h("details", { key: i, className: "gym-history-item" },
            h("summary", null,
              h("span", null, new Date(entry.createdAt).toLocaleDateString("zh-CN")),
              h("strong", null, entry.question),
              h("small", null, (entry.cardIds || []).map(getCardName).join(" · "))
            ),
            h("div", { className: "gym-history-body" },
              h("div", { className: "gym-history-interp" },
                h("p", null, h("strong", null, "核心能量："), entry.interpretation?.coreEnergy || "（未填写）"),
                h("p", null, h("strong", null, "领域投射："), entry.interpretation?.domainProjection || "（未填写）"),
                h("p", null, h("strong", null, "行动建议："), entry.interpretation?.actionAdvice || "（未填写）"),
              ),
              h("div", { className: "gym-history-feedback" },
                h("p", { className: "eyebrow" }, "AI 教练点评"),
                (entry.feedback || "").split("\n").filter(Boolean).map((line, j) =>
                  h("p", { key: j }, line)
                )
              )
            )
          )
        )
      )
  );
}
