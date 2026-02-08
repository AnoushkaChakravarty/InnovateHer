# negotiation_db.py
"""
InnovateHer 2026 - The Equity Gap: Negotiation Knowledge Base
Bulletproof MongoDB-backed tip retrieval with hardcoded fallbacks.
Exposes ONE function: get_tip(context: dict) -> str
"""

import os
import random

# ============================================
# HARDCODED FALLBACK TIPS (always available)
# ============================================

_FALLBACK_TIPS = {
    "salary": [
        "Never reveal your current salary first. Ask 'What's the budgeted range for this role?' to anchor the negotiation. (Source: Harvard Business Review)",
        "Research market rates using Glassdoor, Levels.fyi, and Payscale before any negotiation. Data-driven requests are 3x more likely to succeed. (Source: Fearless Salary Negotiation)",
        "Use specific numbers like $127,000 instead of $130,000. Precise figures signal thorough research and are harder to negotiate down. (Source: Columbia Business School)",
    ],
    "equity": [
        "Request equity details in writing: vesting schedule, strike price, and percentage of fully-diluted shares — not just number of options. (Source: Holloway Guide to Equity Compensation)",
        "Ask: 'What was the valuation at the last funding round?' to determine if your equity offer is actually meaningful. (Source: Index Ventures)",
    ],
    "benefits": [
        "Negotiate family leave, remote flexibility, and professional development budgets — these often have more room than base salary. (Source: Lean In)",
        "Ask for a work-from-anywhere stipend ($500-1000/year) even if remote work is already standard. (Source: GitLab Remote Work Framework)",
    ],
    "rejection": [
        "If they say 'no budget,' know that 80% of the time this is negotiable. Ask about signing bonuses, equity, or a 6-month salary review. (Source: Never Split the Difference)",
        "If they say no to salary, ask: 'What would need to happen to revisit this in 6 months?' Turn rejection into a roadmap. (Source: Ask a Manager)",
    ],
    "confidence": [
        "Use collaborative framing: 'I'm excited about this role. Based on my research, I'd like to discuss...' This reduces social backlash by 40%. (Source: Women Don't Ask)",
        "Practice your negotiation script out loud 3 times before the real conversation. Rehearsal reduces anxiety significantly. (Source: Stanford GSB)",
    ],
    "general": [
        "Wait until you have a written offer before negotiating. A verbal 'we'd like to offer you...' is not an offer yet. (Source: Never Split the Difference)",
        "Document your wins quarterly in a 'brag document' with metrics. Concrete evidence is your strongest tool in any negotiation. (Source: Julia Evans)",
        "Negotiate within 2-3 business days of receiving an offer to show enthusiasm while maintaining leverage. (Source: Wharton School)",
        "You deserve to be paid fairly. Research shows women who negotiate their first salary earn over $1M more across their careers.",
        "If salary is 'maxed out,' ask for a signing bonus — it comes from a different budget pool and is often easier to approve. (Source: Never Split the Difference)",
    ],
}

_DEFAULT_TIP = (
    "You deserve to be paid fairly for your work. Start by asking: "
    "'What's the budgeted range for this role?' — this prevents lowball "
    "offers based on your current pay. (Source: Harvard Business Review)"
)

# Keyword-to-category mapping (matches categories in teammate's MongoDB seed data)
_KEYWORD_MAP = [
    (["no budget", "reject", "said no", "declined", "can't", "won't", "refused", "pushback"], "rejection"),
    (["equity", "stock", "options", "vesting", "shares", "rsu"], "equity"),
    (["benefit", "remote", "leave", "pto", "flexibility", "perks", "vacation", "wfh"], "benefits"),
    (["confident", "nervous", "scared", "afraid", "anxiety", "worried", "uncomfortable"], "confidence"),
    (["when", "timing", "wait", "how soon", "deadline", "days"], "timing"),
    (["signing bonus", "sign-on", "one-time", "lump sum", "maxed out"], "signing_bonus"),
    (["promotion", "promoted", "advance", "title", "level up", "brag doc"], "promotion"),
    (["counter", "counteroffer", "current employer", "match", "retain"], "counteroffer"),
    (["salary", "pay", "compensation", "raise", "money", "offer", "underpaid", "lowball"], "salary"),
]


def _classify_message(message: str) -> str:
    """Map a user message to a tip category."""
    msg = message.lower()
    for keywords, category in _KEYWORD_MAP:
        if any(kw in msg for kw in keywords):
            return category
    return "general"


# ============================================
# MONGODB (optional, graceful degradation)
# ============================================

def _try_get_tip_from_mongo(context: dict) -> str | None:
    """Attempt to fetch a tip from MongoDB. Returns None on any failure."""
    try:
        from pymongo import MongoClient

        mongo_uri = os.getenv("MONGO_URI", "")
        if not mongo_uri:
            return None

        db_name = os.getenv("DATABASE_NAME", "negotiation_db")
        coll_name = os.getenv("COLLECTION_NAME", "negotiation_tips")

        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)

        db = client[db_name]
        collection = db[coll_name]

        # Build query from context
        message = context.get("message", "")
        category = _classify_message(message)

        query = {"category": category} if category != "general" else {}
        tips = list(collection.find(query, {"_id": 0, "tip": 1, "source": 1}))
        client.close()

        if tips:
            chosen = random.choice(tips)
            tip_text = chosen.get("tip", "")
            source = chosen.get("source", "")
            if tip_text:
                return f"{tip_text} (Source: {source})" if source else tip_text

        return None

    except Exception:
        return None


# ============================================
# PUBLIC API
# ============================================

def get_tip(context: dict) -> str:
    """
    Get a negotiation tip based on context.

    Args:
        context: dict with optional keys 'role', 'message'

    Returns:
        str: A high-quality, actionable negotiation tip. NEVER fails.
    """
    if not isinstance(context, dict):
        context = {}

    # Try MongoDB first
    mongo_tip = _try_get_tip_from_mongo(context)
    if mongo_tip:
        return mongo_tip

    # Fallback: select from hardcoded tips based on message keywords
    message = context.get("message", "")
    category = _classify_message(message) if message else "general"
    tips = _FALLBACK_TIPS.get(category, _FALLBACK_TIPS["general"])
    return random.choice(tips)
