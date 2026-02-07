# Capital One Career Break Simulator - Setup Guide

## InnovateHer 2026 | Finance Forward Track

---

## 🚀 Quick Start (3 Steps)

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Your API Key
Open `banking_service.py` and replace line 17:
```python
API_KEY = "YOUR_API_KEY_HERE"  # ← Put your Nessie API key here
```

Get your API key at: http://api.reimaginebanking.com

### 3. Run the Server
```bash
python banking_service.py
```

Server will start at `http://localhost:5000`

---

## 📡 API Endpoints

### 1. Full Nessie Simulation
**POST** `/api/simulate`

Creates a real Nessie account and simulates withdrawals.

**Request:**
```json
{
  "months": 6
}
```

**Response:**
```json
{
  "success": true,
  "account_id": "67890abcdef12345",
  "customer_id": "12345abcdef67890",
  "simulation": {
    "months_simulated": 6,
    "monthly_expenses": 3000,
    "balances": [25000, 22000, 19000, 16000, 13000, 10000, 7000],
    "initial_balance": 25000,
    "final_balance": 7000,
    "total_spent": 18000,
    "depletion_percentage": 72.0,
    "months_until_depleted": 8,
    "warning": true
  }
}
```

### 2. Quick Calculation (No API Needed)
**POST** `/api/calculate-impact`

Fast calculation without creating Nessie accounts. Perfect for frontend prototyping.

**Request:**
```json
{
  "months": 6,
  "salary": 75000
}
```

**Response:**
```json
{
  "months": 6,
  "lost_income": 37500.0,
  "expenses_during_break": 18000.0,
  "total_financial_impact": 55500.0,
  "investment_opportunity_cost": 630.0,
  "savings_depletion": {
    "initial": 25000,
    "final": 7000,
    "percentage_used": 72.0
  }
}
```

### 3. Health Check
**GET** `/api/health`

**Response:**
```json
{
  "status": "healthy",
  "service": "Capital One Career Break Simulator",
  "api_configured": true
}
```

---

## 🧪 Testing with cURL

### Test the simulation:
```bash
curl -X POST http://localhost:5000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"months": 6}'
```

### Test quick calculation:
```bash
curl -X POST http://localhost:5000/api/calculate-impact \
  -H "Content-Type: application/json" \
  -d '{"months": 6, "salary": 75000}'
```

### Health check:
```bash
curl http://localhost:5000/api/health
```

---

## 💡 Frontend Integration Example

```javascript
// Example: Call from your React/Vue/vanilla JS frontend

async function simulateCareerBreak(months) {
  const response = await fetch('http://localhost:5000/api/simulate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ months: months })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Use data.simulation.balances to create a chart
    console.log('Final balance:', data.simulation.final_balance);
    console.log('Depletion:', data.simulation.depletion_percentage + '%');
  }
}

// Quick calculation without waiting for API
async function quickCalculation(months, salary) {
  const response = await fetch('http://localhost:5000/api/calculate-impact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      months: months,
      salary: salary 
    })
  });
  
  const data = await response.json();
  return data;
}
```

---

## 🎯 Demo Scenarios

### Scenario 1: 6-Month Maternity Leave
```json
{"months": 6}
```
Result: $7,000 remaining (72% depleted)

### Scenario 2: 3-Month Job Search
```json
{"months": 3}
```
Result: $16,000 remaining (36% depleted)

### Scenario 3: 12-Month Sabbatical
```json
{"months": 12}
```
Result: Account depleted (would need $36,000)

---

## ⚠️ Troubleshooting

### "Failed to create customer"
- Check your API key is correct
- Verify you're connected to the internet
- Try a different API key from reimaginebanking.com

### CORS errors from frontend
- Make sure Flask is running on `0.0.0.0` (it does by default)
- If needed, add Flask-CORS:
  ```bash
  pip install flask-cors
  ```
  Then add to banking_service.py:
  ```python
  from flask_cors import CORS
  CORS(app)
  ```

### Server won't start
- Check if port 5000 is already in use
- Try changing the port in the last line: `app.run(..., port=5001)`

---

## 📊 What This Demonstrates

✅ Capital One Nessie API integration  
✅ Real-world banking simulation  
✅ Financial impact visualization  
✅ RESTful API design  
✅ Error handling and fallbacks  

---

## 🏆 Judging Alignment

| Criterion | How We Address It |
|-----------|-------------------|
| **Practical Deployment** | Simple Flask server, minimal dependencies |
| **Feasible MVP** | Working endpoints, no complex setup |
| **Technical Complexity** | Nessie API + calculation fallback |
| **Finance Forward** | Shows wage gap impact via career breaks |

---

## 📝 Next Steps for Demo

1. **Frontend**: Connect to `/api/simulate` to get balance data
2. **Visualization**: Chart the `balances` array (shows decline over time)
3. **UX**: Display `warning: true` when balance drops below $5,000
4. **Comparison**: Use `/api/calculate-impact` to show opportunity cost

---

**Need help?** Check the code comments in `banking_service.py`

Good luck at InnovateHer! 🚀
