"""
InnovateHer 2026 - Finance Forward Track
Capital One "Reality Check" Engine - Career Break Simulator

This Flask API simulates the financial drain of a career break using
the Capital One Nessie sandbox API to help new grads understand the
real cost of employment gaps.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# ============================================================================
# CONFIGURATION (Hardcoded for Hackathon)
# ============================================================================
NESSIE_BASE_URL = "http://api.nessieisreal.com"
API_KEY = "5421e9092cc50c4b87d4951b20dd6628" # Replace with your actual Nessie API key

# Simulation constants
INITIAL_BALANCE = 25000  # Starting savings for new grad
MONTHLY_EXPENSES = 3000  # Rent, food, insurance during break


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def create_victim_account():
    """
    Creates a test customer and checking account in the Nessie sandbox.
    
    Returns:
        dict: Contains 'customer_id' and 'account_id' if successful
        None: If creation fails
    """
    try:
        # Step 1: Create a customer
        customer_payload = {
            "first_name": "Sarah",
            "last_name": "NewGrad",
            "address": {
                "street_number": "123",
                "street_name": "Career Lane",
                "city": "West Lafayette",
                "state": "IN",
                "zip": "47906"
            }
        }
        
        customer_response = requests.post(
            f"{NESSIE_BASE_URL}/customers?key={API_KEY}",
            json=customer_payload,
            verify=False,  # Hackathon exception
            timeout = 15
        )
        
        if customer_response.status_code != 201:
            print(f"Customer creation failed: {customer_response.text}")
            return None
            
        customer_data = customer_response.json()
        customer_id = customer_data.get('objectCreated', {}).get('_id')
        
        if not customer_id:
            print("No customer ID returned")
            return None
        
        # Step 2: Create a checking account for the customer
        account_payload = {
            "type": "Checking",
            "nickname": "Career Break Safety Net",
            "rewards": 0,
            "balance": INITIAL_BALANCE
        }
        
        account_response = requests.post(
            f"{NESSIE_BASE_URL}/customers/{customer_id}/accounts?key={API_KEY}",
            json=account_payload,
            verify=False,
            timeout = 15
        )
        
        if account_response.status_code != 201:
            print(f"Account creation failed: {account_response.text}")
            return None
            
        account_data = account_response.json()
        account_id = account_data.get('objectCreated', {}).get('_id')
        
        return {
            'customer_id': customer_id,
            'account_id': account_id,
            'initial_balance': INITIAL_BALANCE
        }
        
    except Exception as e:
        print(f"Error creating account: {str(e)}")
        return None


def simulate_drain(account_id, months):
    """
    Simulates monthly withdrawals during a career break.
    
    Args:
        account_id (str): The Nessie account ID to drain
        months (int): Number of months in the career break
        
    Returns:
        list: Array of balance snapshots after each month
    """
    balance_timeline = []
    
    try:
        for month in range(1, months + 1):
            # Create withdrawal transaction
            withdrawal_payload = {
                "medium": "balance",
                "transaction_date": datetime.now().strftime("%Y-%m-%d"),
                "status": "completed",
                "description": f"Month {month} living expenses",
                "amount": MONTHLY_EXPENSES
            }
            
            withdrawal_response = requests.post(
                f"{NESSIE_BASE_URL}/accounts/{account_id}/withdrawals?key={API_KEY}",
                json=withdrawal_payload,
                verify=False,
                timeout = 15
            )
            
            if withdrawal_response.status_code not in [201, 202]:
                print(f"Withdrawal failed for month {month}: {withdrawal_response.text}")
                # Still add a calculated balance even if API call fails
                if balance_timeline:
                    last_balance = balance_timeline[-1]['balance']
                else:
                    last_balance = INITIAL_BALANCE
                    
                new_balance = max(0, last_balance - MONTHLY_EXPENSES)
                balance_timeline.append({
                    'month': month,
                    'balance': new_balance,
                    'withdrawal': MONTHLY_EXPENSES,
                    'status': 'calculated'
                })
                continue
            
            # Small delay to avoid rate limiting
            time.sleep(1.0)
            
            # Fetch updated account balance
            account_response = requests.get(
                f"{NESSIE_BASE_URL}/accounts/{account_id}?key={API_KEY}",
                verify=False,
                timeout = 15
            )
            
            if account_response.status_code == 200:
                account_data = account_response.json()
                current_balance = account_data.get('balance', 0)
                
                balance_timeline.append({
                    'month': month,
                    'balance': current_balance,
                    'withdrawal': MONTHLY_EXPENSES,
                    'status': 'confirmed'
                })
            else:
                # Fallback calculation
                if balance_timeline:
                    last_balance = balance_timeline[-1]['balance']
                else:
                    last_balance = INITIAL_BALANCE
                    
                new_balance = max(0, last_balance - MONTHLY_EXPENSES)
                balance_timeline.append({
                    'month': month,
                    'balance': new_balance,
                    'withdrawal': MONTHLY_EXPENSES,
                    'status': 'estimated'
                })
        
        return balance_timeline
        
    except Exception as e:
        print(f"Error during simulation: {str(e)}")
        return balance_timeline


# ============================================================================
# FLASK ROUTES
# ============================================================================

@app.route('/api/simulate', methods=['POST'])
def run_simulation():
    """
    Main endpoint for the career break simulation.
    
    Expected JSON body:
    {
        "months": 6
    }
    
    Returns:
        JSON with balance timeline and summary statistics
    """
    try:
        data = request.get_json()
        
        if not data or 'months' not in data:
            return jsonify({
                'error': 'Missing required field: months'
            }), 400
        
        months = int(data['months'])
        
        if months < 1 or months > 24:
            return jsonify({
                'error': 'Months must be between 1 and 24'
            }), 400
        
        # Step 1: Create the test account
        account_info = create_victim_account()
        
        if not account_info:
            return jsonify({
                'error': 'Failed to create Nessie account'
            }), 500
        
        # Step 2: Run the drain simulation
        balance_timeline = simulate_drain(account_info['account_id'], months)
        
        """""
        # Step 3: Calculate summary statistics
        final_balance = balance_timeline[-1]['balance'] if balance_timeline else INITIAL_BALANCE
        total_spent = months * MONTHLY_EXPENSES
        money_lost = INITIAL_BALANCE - final_balance
        
        return jsonify({
            'success': True,
            'simulation': {
                'account_id': account_info['account_id'],
                'customer_id': account_info['customer_id'],
                'months_simulated': months,
                'initial_balance': INITIAL_BALANCE,
                'final_balance': final_balance,
                'total_expenses': total_spent,
                'money_remaining': final_balance,
                'percentage_depleted': round((money_lost / INITIAL_BALANCE) * 100, 1)
            },
            'timeline': balance_timeline,
            'warning': 'This demonstrates why negotiating salary NOW matters - every dollar counts during career transitions.'
        }), 200
        """""
        # Step 3: Calculate summary statistics
        final_balance = balance_timeline[-1]['balance'] if balance_timeline else INITIAL_BALANCE
        total_spent = months * MONTHLY_EXPENSES
        money_lost = INITIAL_BALANCE - final_balance
        percentage_depleted = round((money_lost / INITIAL_BALANCE) * 100, 1)

        warning_msg = "This demonstrates why negotiating salary NOW matters - every dollar counts during career transitions."

        return jsonify({
            "success": True,
            "simulation": {
                "account_id": account_info["account_id"],
                "customer_id": account_info["customer_id"],
                "months_simulated": months,
                "initial_balance": INITIAL_BALANCE,
                "final_balance": final_balance,

                # ✅ fields the test script expects
                "total_spent": total_spent,
                "depletion_percentage": percentage_depleted,
                "warning": warning_msg,

                # ✅ keep your original field names too (harmless)
                "total_expenses": total_spent,
                "money_remaining": final_balance,
                "percentage_depleted": percentage_depleted
            },
            "timeline": balance_timeline
        }), 200

        
    except ValueError:
        return jsonify({
            'error': 'Invalid months value - must be a number'
        }), 400
    except Exception as e:
        return jsonify({
            'error': f'Simulation failed: {str(e)}'
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Career Break Simulator',
        'api': 'Capital One Nessie'
    }), 200

@app.route('/api/calculate-impact', methods=['POST'])
def calculate_impact():
    """
    Quick calculation endpoint without creating actual Nessie accounts.
    Useful for frontend prototyping.
    
    Expected JSON: { "months": 6, "salary": 75000 }
    """
    try:
        data = request.get_json()
        months = int(data.get('months', 6))
        salary = float(data.get('salary', 75000))
        
        # Simple calculations
        lost_income = (salary / 12) * months
        expenses_paid = MONTHLY_EXPENSES * months
        total_impact = lost_income + expenses_paid
        
        # Opportunity cost (assuming 7% annual return if invested)
        annual_return = 0.07
        opportunity_cost = expenses_paid * (annual_return * (months / 12))
        
        return jsonify({
            "months": months,
            "lost_income": round(lost_income, 2),
            "expenses_during_break": round(expenses_paid, 2),
            "total_financial_impact": round(total_impact, 2),
            "investment_opportunity_cost": round(opportunity_cost, 2),
            "savings_depletion": {
                "initial": INITIAL_BALANCE,
                "final": max(0, INITIAL_BALANCE - expenses_paid),
                "percentage_used": round((expenses_paid / INITIAL_BALANCE) * 100, 2)
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/', methods=['GET'])
def home():
    """API documentation"""
    return jsonify({
        'service': 'InnovateHer Finance Forward - Career Break Simulator',
        'endpoints': {
            '/api/simulate': {
                'method': 'POST',
                'body': {'months': 'integer (1-24)'},
                'description': 'Simulates financial drain during career break'
            },
            '/api/health': {
                'method': 'GET',
                'description': 'Service health check'
            }
        },
        'sponsor': 'Capital One Nessie API',
        'hackathon': 'InnovateHer 2026 @ Purdue'
    }), 200


# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == '__main__':
    print("=" * 60)
    print("InnovateHer 2026 - Career Break Simulator")
    print("=" * 60)
    print(f"Initial Balance: ${INITIAL_BALANCE:,}")
    print(f"Monthly Expenses: ${MONTHLY_EXPENSES:,}")
    print(f"API Endpoint: http://localhost:5000/api/simulate")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=8000)
