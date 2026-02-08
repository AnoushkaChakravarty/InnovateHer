# app.py
"""
InnovateHer 2026 - The Equity Gap: Unified Flask API
PORT 8000 | Endpoints: /api/gap-check, /api/simulate, /api/chat, /api/lifetime
"""

import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

# ============================================
# GEMINI AI (optional, graceful degradation)
# ============================================
_gemini_model = None
try:
    import google.generativeai as genai
    _gemini_key = os.getenv("GEMINI_API_KEY", "")
    if _gemini_key:
        genai.configure(api_key=_gemini_key)
        _gemini_model = genai.GenerativeModel(
            "gemini-2.5-flash",
            system_instruction=(
                "You are GameChanger, an AI negotiation coach specializing in helping "
                "women close the pay gap in tech. You give specific, actionable advice "
                "tailored to the user's exact situation.\n\n"
                "RULES:\n"
                "- Be concise: 2-4 sentences max.\n"
                "- Sound like a supportive friend who happens to be a negotiation expert — "
                "warm, real, and encouraging. Never pushy or preachy.\n"
                "- Give DIFFERENT advice each time. Don't repeat yourself.\n"
                "- Use specific dollar amounts when you have the data.\n"
                "- LISTEN to what the user actually wants. If they value flexibility, "
                "remote work, culture, or work-life balance over max salary, respect that. "
                "Help them negotiate for THEIR priorities, not just the highest number.\n"
                "- Still gently inform them of their market value and the gap if one exists, "
                "so they can make an informed decision — but never pressure them.\n"
                "- Cover the full range: salary, equity, signing bonuses, promotions, "
                "benefits, parental leave, career breaks, timing, confidence, rejection.\n"
                "- If the user asks a follow-up, build on the conversation — don't restart.\n"
                "- Reference the RESEARCH TIP naturally but don't just restate it.\n"
                "- Give concrete scripts the user can say word-for-word when possible."
            ),
        )
except Exception:
    pass

# ============================================
# SAFE IMPORTS WITH DETERMINISTIC FALLBACKS
# ============================================

# truth_engine.py (Snowflake salary benchmarks) — DO NOT EDIT that file
try:
    from truth_engine import get_market_benchmark
except Exception:
    _MOCK_SALARIES = {
        "software engineer": 128000,
        "data analyst": 85000,
        "data scientist": 120000,
        "product manager": 135000,
        "ux designer": 95000,
        "marketing manager": 88000,
        "financial analyst": 78000,
        "project manager": 92000,
        "devops engineer": 130000,
        "machine learning engineer": 140000,
    }

    def get_market_benchmark(role: str) -> dict:
        avg = _MOCK_SALARIES.get(role.lower().strip(), 90000)
        return {
            "success": True,
            "role": role,
            "average_salary": avg,
            "salary_range": {"min": int(avg * 0.8), "max": int(avg * 1.25)},
            "sample_size": 150,
        }


# bank_sim.py (Career break simulator)
try:
    from bank_sim import run_simulation
except Exception:
    def run_simulation(months: int, spend: float, savings: float = None) -> dict:
        months = max(1, min(24, int(months)))
        spend = max(0, float(spend))
        balance = float(savings) if savings is not None else 25000
        starting = balance
        chart_data = [int(balance)]
        for _ in range(months):
            balance = max(0, balance - spend)
            chart_data.append(int(balance))
        lost = int(starting) - chart_data[-1]
        return {"lost": int(lost), "chart_data": chart_data}


# gender_engine.py (Gender-disaggregated Snowflake queries)
try:
    from gender_engine import get_gender_benchmark, compute_lifetime_impact
except Exception:
    _MOCK_GENDER = {
        "software engineer": (134000, 121000),
        "data analyst": (89000, 79000),
        "data scientist": (123000, 116000),
        "product manager": (140000, 130000),
        "ux designer": (102000, 87000),
        "marketing manager": (93000, 81000),
        "financial analyst": (82000, 73000),
        "project manager": (96000, 87000),
        "devops engineer": (135000, 123000),
        "machine learning engineer": (145000, 135000),
    }

    def get_gender_benchmark(role: str) -> dict:
        m, f = _MOCK_GENDER.get(role.lower().strip(), (95000, 86000))
        gap = m - f
        return {
            "success": True, "role": role,
            "male_avg": m, "female_avg": f,
            "gap": gap, "gap_percent": round((gap / m) * 100, 1),
            "male_count": 1200, "female_count": 1200,
            "male_range": {"min": int(m * 0.8), "max": int(m * 1.2)},
            "female_range": {"min": int(f * 0.8), "max": int(f * 1.2)},
        }

    def compute_lifetime_impact(male_avg: int, female_avg: int, years: int = 30) -> dict:
        m, f = float(male_avg), float(female_avg)
        mt, ft, gt, labels = [], [], [], []
        cum_lost = 0.0
        cum_401k = 0.0
        pot = 0.0
        for y in range(years + 1):
            if y > 0:
                m *= 1.03
                f *= 1.03
            g = m - f
            mt.append(int(m)); ft.append(int(f)); gt.append(int(g))
            labels.append(f"Year {y}" if y > 0 else "Start")
            if y > 0:
                cum_lost += g
                cum_401k += g * 0.04
                pot = (pot + g) * 1.07
        return {
            "male_trajectory": mt, "female_trajectory": ft,
            "gap_trajectory": gt, "year_labels": labels,
            "annual_gap_start": int(male_avg - female_avg),
            "annual_gap_year30": gt[-1] if gt else 0,
            "total_lost_salary": int(cum_lost),
            "total_lost_retirement": int(cum_401k),
            "total_lost_investment": int(pot - cum_lost),
            "total_compound_loss": int(pot + cum_401k),
            "years": years,
        }


# negotiation_db.py (MongoDB knowledge base)
try:
    from negotiation_db import get_tip
except Exception:
    def get_tip(context: dict) -> str:
        return (
            "You deserve fair pay. Ask: 'What's the budgeted range for this "
            "role?' before revealing any numbers. (Source: Harvard Business Review)"
        )


# ============================================
# ROUTES
# ============================================

@app.route("/api/gap-check", methods=["POST"])
def gap_check():
    """POST /api/gap-check — Salary gap analysis against market data."""
    try:
        data = request.get_json(silent=True) or {}

        role = str(data.get("role", "")).strip()
        if not role:
            return jsonify({
                "verdict": "FAIR RATE",
                "gap_amount": 0,
                "market_average": 0,
                "message": "Please provide a job role to analyze.",
            }), 400

        try:
            current_salary = max(0, float(data.get("current_salary", 0)))
        except (TypeError, ValueError):
            current_salary = 0

        benchmark = get_market_benchmark(role)

        if not benchmark.get("success"):
            market_average = 90000
        else:
            market_average = benchmark.get("average_salary", 90000)

        gap_amount = max(0, market_average - current_salary)
        verdict = "UNDERPAID" if gap_amount > 0 else "FAIR RATE"

        if verdict == "UNDERPAID":
            message = f"You are leaving ${gap_amount:,} on the table."
        else:
            message = "Your salary is competitive with market rates. Keep negotiating to stay ahead!"

        # Enrich with gender-disaggregated data
        gender_data = {}
        try:
            gb = get_gender_benchmark(role)
            if gb.get("success"):
                gender_data = {
                    "male_avg": gb["male_avg"],
                    "female_avg": gb["female_avg"],
                    "gender_gap": gb["gap"],
                    "gender_gap_percent": gb["gap_percent"],
                }
        except Exception:
            pass

        return jsonify({
            "verdict": verdict,
            "gap_amount": int(gap_amount),
            "market_average": int(market_average),
            "message": message,
            **gender_data,
        })

    except Exception:
        return jsonify({
            "verdict": "FAIR RATE",
            "gap_amount": 0,
            "market_average": 90000,
            "message": "Unable to analyze right now. Keep researching your market rate!",
        })


@app.route("/api/lifetime", methods=["POST"])
def lifetime():
    """POST /api/lifetime — Gender pay gap lifetime compound impact analysis."""
    try:
        data = request.get_json(silent=True) or {}

        role = str(data.get("role", "")).strip()
        if not role:
            return jsonify({"success": False, "error": "Please provide a job role."}), 400

        try:
            years = int(data.get("years", 30))
        except (TypeError, ValueError):
            years = 30
        years = max(1, min(40, years))

        # Get gender-disaggregated benchmark from Snowflake
        gb = get_gender_benchmark(role)

        if not gb.get("success"):
            return jsonify({
                "success": False,
                "error": gb.get("error", "No data found for this role."),
            }), 404

        # Compute 30-year compound impact
        impact = compute_lifetime_impact(gb["male_avg"], gb["female_avg"], years)

        return jsonify({
            "success": True,
            "role": role,
            "male_avg": gb["male_avg"],
            "female_avg": gb["female_avg"],
            "gap": gb["gap"],
            "gap_percent": gb["gap_percent"],
            "male_count": gb.get("male_count", 0),
            "female_count": gb.get("female_count", 0),
            "male_range": gb.get("male_range", {}),
            "female_range": gb.get("female_range", {}),
            **impact,
        })

    except Exception:
        return jsonify({
            "success": False,
            "error": "Unable to compute lifetime impact right now.",
        }), 500


@app.route("/api/simulate", methods=["POST"])
def simulate():
    """POST /api/simulate — Career break cost simulation."""
    try:
        data = request.get_json(silent=True) or {}

        try:
            months = int(data.get("months", 6))
        except (TypeError, ValueError):
            months = 6
        months = max(1, min(24, months))

        try:
            monthly_spend = float(data.get("monthly_spend", 2000))
        except (TypeError, ValueError):
            monthly_spend = 2000
        monthly_spend = max(0, monthly_spend)

        try:
            savings = float(data.get("savings", 25000))
        except (TypeError, ValueError):
            savings = 25000
        savings = max(0, savings)

        result = run_simulation(months, monthly_spend, savings)

        lost = result.get("lost", int(months * monthly_spend))
        chart_data = result.get("chart_data", [int(savings)])

        compound_loss = int(lost * 3.3)
        message = (
            f"A {months}-month break costs you ${lost:,} in cash "
            f"+ ${compound_loss:,} in future compound interest."
        )

        return jsonify({
            "lost": int(lost),
            "chart_data": chart_data,
            "message": message,
        })

    except Exception:
        return jsonify({
            "lost": 12000,
            "chart_data": [25000, 23000, 21000, 19000, 17000, 15000, 13000],
            "message": "A 6-month break costs you $12,000 in cash + $40,000 in future compound interest.",
        })


@app.route("/api/chat", methods=["POST"])
def chat():
    """POST /api/chat — AI negotiation coach powered by Gemini + MongoDB RAG."""
    try:
        data = request.get_json(silent=True) or {}

        message = str(data.get("message", "")).strip()
        context = data.get("context", {})
        if not isinstance(context, dict):
            context = {}

        context["message"] = message

        # Step 1: Retrieve relevant tip from MongoDB (RAG retrieval)
        tip = get_tip(context)

        # Step 2: Try Gemini for a natural response grounded in the tip
        if _gemini_model and message:
            try:
                role = context.get("role", "")
                salary = context.get("salary", "")
                location = context.get("location", "")
                market_avg = context.get("market_average", "")
                gap = context.get("gap_amount", "")
                verdict = context.get("verdict", "")
                history = context.get("history", [])

                # Build context block
                ctx_lines = []
                if role:
                    ctx_lines.append(f"Role: {role}")
                if salary:
                    ctx_lines.append(f"Current salary: ${salary}")
                if market_avg:
                    ctx_lines.append(f"Market average: ${market_avg}")
                if gap and verdict == "UNDERPAID":
                    ctx_lines.append(f"Pay gap: ${gap} below market")
                if location:
                    ctx_lines.append(f"Location: {location}")

                user_context = "\n".join(ctx_lines) if ctx_lines else "No profile data provided"

                # Build conversation history
                history_text = ""
                if history:
                    recent = history[-6:]  # last 6 messages for context
                    history_text = "\nRECENT CONVERSATION:\n"
                    for h in recent:
                        speaker = "User" if h.get("from") == "user" else "Coach"
                        history_text += f"{speaker}: {h.get('text', '')}\n"

                prompt = (
                    f"USER PROFILE:\n{user_context}\n\n"
                    f"RESEARCH TIP (use as inspiration, don't just restate):\n{tip}\n"
                    f"{history_text}\n"
                    f"User's new message: {message}\n\n"
                    f"Give a specific, actionable response. If you have their salary "
                    f"and market data, reference exact numbers. Don't repeat advice "
                    f"from the conversation history."
                )
                ai_response = _gemini_model.generate_content(prompt)
                reply = ai_response.text.strip()
                return jsonify({"reply": reply})
            except Exception:
                pass  # Fall through to tip-only response

        # Step 3: Fallback — return tip directly if Gemini unavailable
        if message:
            reply = f"I checked our research database. {tip}"
        else:
            reply = tip

        return jsonify({"reply": reply})

    except Exception:
        return jsonify({
            "reply": (
                "Great question! Here's what research shows: Never reveal your "
                "current salary first. Instead ask 'What's the budgeted range "
                "for this role?' This prevents lowball offers. (Source: Harvard Business Review)"
            )
        })


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "running", "project": "The Equity Gap"})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)
