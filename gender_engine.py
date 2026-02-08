# gender_engine.py
"""
InnovateHer 2026 - The Equity Gap: Gender-Disaggregated Salary Engine
Queries Snowflake SALARIES table by GENDER to power the Lifetime Impact feature.
Exposes: get_gender_benchmark(role) and compute_lifetime_impact(male_avg, female_avg)
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ============================================
# SNOWFLAKE CONNECTION (mirrors truth_engine.py)
# ============================================

_SNOWFLAKE_CONFIG = {
    "user": os.getenv("SNOWFLAKE_USER"),
    "password": os.getenv("SNOWFLAKE_PASSWORD"),
    "account": os.getenv("SNOWFLAKE_ACCOUNT"),
    "warehouse": "COMPUTE_WH",
    "database": "HACKATHON_DB",
    "schema": "PUBLIC",
}


def _get_connection():
    import snowflake.connector
    return snowflake.connector.connect(**_SNOWFLAKE_CONFIG)


# ============================================
# GENDER-DISAGGREGATED BENCHMARK
# ============================================

def get_gender_benchmark(role: str) -> dict:
    """
    Query Snowflake for male vs female salary averages for a given role.
    Returns: {success, role, male_avg, female_avg, gap, gap_percent, male_count, female_count}
    """
    conn = None
    try:
        conn = _get_connection()
        cursor = conn.cursor()

        query = """
            SELECT
                GENDER,
                AVG(ANNUAL_SALARY)  AS avg_salary,
                MIN(ANNUAL_SALARY)  AS min_salary,
                MAX(ANNUAL_SALARY)  AS max_salary,
                COUNT(*)            AS sample_size
            FROM SALARIES
            WHERE UPPER(JOB_TITLE) = UPPER(%s)
            GROUP BY GENDER
        """
        cursor.execute(query, (role,))
        rows = cursor.fetchall()

        male_avg = female_avg = 0
        male_count = female_count = 0
        male_range = female_range = {"min": 0, "max": 0}

        for row in rows:
            gender, avg_sal, min_sal, max_sal, count = row
            if gender and gender.strip().upper() == "MALE":
                male_avg = int(avg_sal)
                male_count = count
                male_range = {"min": int(min_sal), "max": int(max_sal)}
            elif gender and gender.strip().upper() == "FEMALE":
                female_avg = int(avg_sal)
                female_count = count
                female_range = {"min": int(min_sal), "max": int(max_sal)}

        if male_avg == 0 and female_avg == 0:
            return {"success": False, "error": f"No gender data found for role: {role}"}

        gap = male_avg - female_avg
        gap_percent = round((gap / male_avg) * 100, 1) if male_avg > 0 else 0

        return {
            "success": True,
            "role": role,
            "male_avg": male_avg,
            "female_avg": female_avg,
            "gap": gap,
            "gap_percent": gap_percent,
            "male_count": male_count,
            "female_count": female_count,
            "male_range": male_range,
            "female_range": female_range,
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        if conn:
            conn.close()


# ============================================
# LIFETIME COMPOUND IMPACT CALCULATOR
# ============================================

_ANNUAL_RAISE = 0.03        # 3% annual raise
_INVESTMENT_RETURN = 0.07   # 7% average market return
_EMPLOYER_401K_MATCH = 0.04 # 4% employer 401(k) match

def compute_lifetime_impact(male_avg: int, female_avg: int, years: int = 30) -> dict:
    """
    Compute the 30-year compound career cost of the gender pay gap.

    Models:
    - Salary trajectories (both genders, 3% annual raises)
    - Lost take-home pay
    - Lost 401(k) employer match (4% of gap each year)
    - Lost investment growth (7% compounding on cumulative gap)

    Returns: {
        male_trajectory, female_trajectory, gap_trajectory,
        total_lost_salary, total_lost_retirement, total_compound_loss,
        year_labels
    }
    """
    male_salary = float(male_avg)
    female_salary = float(female_avg)

    male_trajectory = []
    female_trajectory = []
    gap_trajectory = []
    year_labels = []

    cumulative_lost_salary = 0.0
    cumulative_lost_401k = 0.0
    investment_pot = 0.0  # grows at 7% per year on cumulative gap

    for year in range(years + 1):
        if year > 0:
            male_salary *= (1 + _ANNUAL_RAISE)
            female_salary *= (1 + _ANNUAL_RAISE)

        annual_gap = male_salary - female_salary

        male_trajectory.append(int(male_salary))
        female_trajectory.append(int(female_salary))
        gap_trajectory.append(int(annual_gap))
        year_labels.append(f"Year {year}" if year > 0 else "Start")

        if year > 0:
            cumulative_lost_salary += annual_gap
            lost_match = annual_gap * _EMPLOYER_401K_MATCH
            cumulative_lost_401k += lost_match
            # Previous investment pot grows, plus this year's gap gets invested
            investment_pot = (investment_pot + annual_gap) * (1 + _INVESTMENT_RETURN)

    total_lost_salary = int(cumulative_lost_salary)
    total_lost_retirement = int(cumulative_lost_401k)
    total_lost_investment = int(investment_pot - cumulative_lost_salary)
    total_compound_loss = int(investment_pot + cumulative_lost_401k)

    return {
        "male_trajectory": male_trajectory,
        "female_trajectory": female_trajectory,
        "gap_trajectory": gap_trajectory,
        "year_labels": year_labels,
        "annual_gap_start": int(male_avg - female_avg),
        "annual_gap_year30": gap_trajectory[-1] if gap_trajectory else 0,
        "total_lost_salary": total_lost_salary,
        "total_lost_retirement": total_lost_retirement,
        "total_lost_investment": total_lost_investment,
        "total_compound_loss": total_compound_loss,
        "years": years,
    }
