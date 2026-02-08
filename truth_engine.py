"""
InnovateHer 2026 - The Equity Gap: Truth Engine
Snowflake-powered salary benchmark tool
"""

import os
from dotenv import load_dotenv
import snowflake.connector
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# ============================================
# SNOWFLAKE CONFIG - Loaded from .env file
# ============================================
SNOWFLAKE_CONFIG = {
    "user": os.getenv("SNOWFLAKE_USER"),
    "password": os.getenv("SNOWFLAKE_PASSWORD"),
    "account": os.getenv("SNOWFLAKE_ACCOUNT"),
    "warehouse": "COMPUTE_WH",
    "database": "HACKATHON_DB",
    "schema": "PUBLIC"
}


def get_snowflake_connection():
    return snowflake.connector.connect(**SNOWFLAKE_CONFIG)


def get_market_benchmark(role: str) -> dict:
    conn = None
    try:
        conn = get_snowflake_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT 
                AVG(ANNUAL_SALARY) as avg_salary,
                MIN(ANNUAL_SALARY) as min_salary,
                MAX(ANNUAL_SALARY) as max_salary,
                COUNT(*) as sample_size
            FROM SALARIES 
            WHERE UPPER(JOB_TITLE) = UPPER(%s)
        """
        
        cursor.execute(query, (role,))
        result = cursor.fetchone()
        
        if result and result[0] is not None:
            return {
                "success": True,
                "role": role,
                "average_salary": int(result[0]),
                "salary_range": {
                    "min": int(result[1]),
                    "max": int(result[2])
                },
                "sample_size": result[3]
            }
        else:
            return {
                "success": False,
                "error": f"No data found for role: {role}"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        if conn:
            conn.close()


# ============================================
# FLASK API ROUTES
# ============================================

@app.route("/api/benchmark", methods=["POST"])
def benchmark():
    data = request.get_json()
    
    if not data or "role" not in data:
        return jsonify({
            "success": False,
            "error": "Missing 'role' in request body"
        }), 400
    
    result = get_market_benchmark(data["role"])
    return jsonify(result)


@app.route("/api/gap-check", methods=["POST"])
def gap_check():
    data = request.get_json()
    
    if not data or "role" not in data or "current_salary" not in data:
        return jsonify({
            "success": False,
            "error": "Missing 'role' or 'current_salary' in request body"
        }), 400
    
    benchmark = get_market_benchmark(data["role"])
    
    if not benchmark["success"]:
        return jsonify(benchmark)
    
    current = data["current_salary"]
    market_avg = benchmark["average_salary"]
    gap = market_avg - current
    gap_percent = round((gap / market_avg) * 100, 1)
    
    return jsonify({
        "success": True,
        "role": data["role"],
        "your_salary": current,
        "market_average": market_avg,
        "gap_amount": gap,
        "gap_percent": gap_percent,
        "verdict": "UNDERPAID" if gap > 0 else "AT OR ABOVE MARKET"
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "running", "project": "The Equity Gap"})


if __name__ == "__main__":
    app.run(debug=True, port=8000)