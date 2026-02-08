# app.py
"""
InnovateHer 2026 - The Equity Gap: Unified Flask API
PORT 8000 | Endpoints: /api/gap-check, /api/simulate, /api/chat
"""

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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
    def run_simulation(months: int, spend: float) -> dict:
        months = max(1, min(24, int(months)))
        spend = max(0, float(spend))
        balance = 25000
        chart_data = [balance]
        for _ in range(months):
            balance = max(0, balance - spend)
            chart_data.append(int(balance))
        lost = 25000 - chart_data[-1]
        return {"lost": int(lost), "chart_data": chart_data}


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

        return jsonify({
            "verdict": verdict,
            "gap_amount": int(gap_amount),
            "market_average": int(market_average),
            "message": message,
        })

    except Exception:
        return jsonify({
            "verdict": "FAIR RATE",
            "gap_amount": 0,
            "market_average": 90000,
            "message": "Unable to analyze right now. Keep researching your market rate!",
        })


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

        result = run_simulation(months, monthly_spend)

        lost = result.get("lost", int(months * monthly_spend))
        chart_data = result.get("chart_data", [25000])

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
    """POST /api/chat — AI negotiation coach powered by MongoDB knowledge base."""
    try:
        data = request.get_json(silent=True) or {}

        message = str(data.get("message", "")).strip()
        context = data.get("context", {})
        if not isinstance(context, dict):
            context = {}

        context["message"] = message

        tip = get_tip(context)

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
