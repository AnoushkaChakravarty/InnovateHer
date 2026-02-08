# bank_sim.py
"""
InnovateHer 2026 - Career Break Cost Simulator
Bridge module: run_simulation(months, spend) -> {'lost': int, 'chart_data': [nums...]}
Tries Nessie API (banking_service) first, falls back to deterministic math.
"""

INITIAL_BALANCE = 25000


def _try_nessie(months: int, spend: float) -> dict | None:
    """Attempt live Nessie API simulation. Returns None on failure."""
    try:
        from backend.banking_service import (
            create_victim_account,
            simulate_drain,
            INITIAL_BALANCE as NES_BAL,
        )

        account_info = create_victim_account()
        if not account_info:
            return None

        timeline = simulate_drain(account_info["account_id"], months)
        if not timeline:
            return None

        chart_data = [NES_BAL] + [entry["balance"] for entry in timeline]
        lost = NES_BAL - timeline[-1]["balance"]
        return {"lost": int(lost), "chart_data": [int(b) for b in chart_data]}

    except Exception:
        return None


def run_simulation(months: int, spend: float) -> dict:
    """
    Simulate the financial cost of a career break.

    Args:
        months: Duration of break (clamped 1-24)
        spend: Monthly spending during break

    Returns:
        {'lost': int, 'chart_data': [int, ...]}
    """
    months = max(1, min(24, int(months)))
    spend = max(0, float(spend))

    # Try live Nessie API first
    live = _try_nessie(months, spend)
    if live:
        return live

    # Deterministic fallback calculation
    balance = INITIAL_BALANCE
    chart_data = [balance]

    for _ in range(months):
        balance = max(0, balance - spend)
        chart_data.append(int(balance))

    lost = INITIAL_BALANCE - chart_data[-1]
    return {"lost": int(lost), "chart_data": chart_data}
