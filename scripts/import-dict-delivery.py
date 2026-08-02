#!/usr/bin/env python3
# 把外包交付的 cards_final_78.json（key=中文牌名）转成 dict-extract.json（key=项目牌id）。
# 做两件事：
#   1. 中文名 -> 项目 id 映射（标准伟特牌序）
#   2. 各 section 的同义 key 归一化到渲染层 DICT_SECTIONS 认识的规范 key；
#      同一条目里多个源 key 映射到同一规范 key 时，做「合并拼接」而非覆盖（延伸应用的
#      相对时间/标示时间/星座 是书里并列的两个子概念，都并进 time，不丢弃任何一个）。
# 用法：python3 scripts/import-dict-delivery.py <delivery.json> [out.json]
#   默认 out = 项目根目录 dict-extract.json
# 不编造：只做 key 改名 + 同 key 合并，绝不改动任何文字内容。

import json
import sys
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MAJORS = [
    "fool", "magician", "high-priestess", "empress", "emperor", "hierophant",
    "lovers", "chariot", "strength", "hermit", "wheel-of-fortune", "justice",
    "hanged-man", "death", "temperance", "devil", "tower", "star", "moon",
    "sun", "judgement", "world",
]
MAJOR_NAMES = [
    "愚者", "魔术师", "女祭司", "皇后", "皇帝", "教皇", "恋人", "战车", "力量",
    "隐者", "命运之轮", "正义", "倒吊人", "死神", "节制", "恶魔", "塔", "星星",
    "月亮", "太阳", "审判", "世界",
]
SUIT_CN = {"权杖": "wands", "圣杯": "cups", "宝剑": "swords", "钱币": "pentacles"}
RANK_CN = {
    "一": "01", "二": "02", "三": "03", "四": "04", "五": "05",
    "六": "06", "七": "07", "八": "08", "九": "09", "十": "10",
    "侍者": "page", "骑士": "knight", "皇后": "queen", "国王": "king",
}

def name_to_id(name):
    if name in MAJOR_NAMES:
        return MAJORS[MAJOR_NAMES.index(name)]
    suit = name[:2]
    rank = name[2:]
    if suit in SUIT_CN and rank in RANK_CN:
        return f"{SUIT_CN[suit]}-{RANK_CN[rank]}"
    raise ValueError(f"无法映射牌名: {name}")

# 每个 section 的同义 key -> 规范 key。未列出的 key 原样保留。
KEYMAP = {
    "person": {},
    "work": {
        "jobSearch": "jobChange",
    },
    "love": {
        "reconciliation": "reunion",
        "reconcile": "reunion",
        "new_possibility": "newRomance",
        "newRelationship": "newRomance",
        "new_relationship": "newRomance",
        "new_love": "newRomance",
        "argue": "resolveConflict",
        "resolve_argument": "resolveConflict",
        "sexual_attraction": "attraction",
    },
    "friendship": {
        "resolveConflict": "resolveMisunderstanding",
        "relationship": "situation",
    },
    "family": {
        "with_elders": "elders",
        "with_peers": "peers",
        "with_juniors": "juniors",
        "with_younger": "juniors",
    },
    "study": {
        "teacher": "withTeacher",
        "classmates": "withClassmates",
    },
    "finance": {
        "procurement": "purchasing",
        "shopping": "purchasing",
        "purchase": "purchasing",
        "current": "situation",
    },
    "extended": {
        "sign_time": "time",
        "zodiac": "time",
        "relative_time": "time",
        "location": "place",
        "items": "objects",
        "body_parts": "body",
    },
}

def normalize_section(section_name, sec):
    """归一化一个 section 的 key；同规范 key 冲突则按源出现顺序拼接。"""
    mapping = KEYMAP.get(section_name, {})
    out = {}
    for src_key, val in sec.items():
        canon = mapping.get(src_key, src_key)
        if not isinstance(val, str):
            val = "" if val is None else str(val)
        if canon in out:
            existing = out[canon].strip()
            add = val.strip()
            if add and add not in existing:
                out[canon] = existing + ("　" if existing else "") + add
        else:
            out[canon] = val
    return out

def normalize_position(pos):
    out = {}
    for key, val in pos.items():
        if isinstance(val, dict):
            out[key] = normalize_section(key, val)
        else:
            out[key] = val
    return out

def main():
    if len(sys.argv) < 2:
        print("用法: python3 scripts/import-dict-delivery.py <delivery.json> [out.json]")
        sys.exit(1)
    delivery = json.load(open(sys.argv[1], encoding="utf-8"))
    out_path = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "dict-extract.json")

    result = {}
    for card in delivery["cards"]:
        cid = name_to_id(card["name"])
        entry = {"source": delivery.get("source", "丹尼尔《塔罗解牌字典》")}
        if "upright" in card:
            entry["upright"] = normalize_position(card["upright"])
        if "reversed" in card:
            entry["reversed"] = normalize_position(card["reversed"])
        result[cid] = entry

    if len(result) != len(delivery["cards"]):
        print(f"警告: 去重后 {len(result)} != 交付 {len(delivery['cards'])}（可能有重名映射冲突）")

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"已写出 {out_path}，{len(result)} 张牌。")
    print("下一步: node scripts/merge-dictionary.js")

if __name__ == "__main__":
    main()
