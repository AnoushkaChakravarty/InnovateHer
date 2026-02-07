# API Configuration Examples

## Nessie API Key Setup

1. Go to: http://api.reimaginebanking.com
2. Sign up for a free account
3. Get your API key from the dashboard
4. Replace in `banking_service.py` line 17:

```python
API_KEY = "your_actual_api_key_here"
```

---

## Example API Responses

### Successful Simulation Response
```json
{
  "success": true,
  "account_id": "67890abcdef12345",
  "customer_id": "12345abcdef67890",
  "simulation": {
    "months_simulated": 6,
    "monthly_expenses": 3000,
    "balances": [
      25000,  // Month 0 (start)
      22000,  // Month 1
      19000,  // Month 2
      16000,  // Month 3
      13000,  // Month 4
      10000,  // Month 5
      7000    // Month 6
    ],
    "initial_balance": 25000,
    "final_balance": 7000,
    "total_spent": 18000,
    "depletion_percentage": 72.0,
    "months_until_depleted": 8,
    "warning": true  // Balance below $5,000 threshold
  }
}
```

### Error Response (Invalid Input)
```json
{
  "error": "Months must be between 1 and 24"
}
```

### Error Response (API Issue)
```json
{
  "error": "Failed to create customer: API key invalid"
}
```

---

## Frontend Chart Integration

### Using Chart.js

```javascript
// After getting simulation data
const simulationData = await fetch('/api/simulate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ months: 6 })
}).then(r => r.json());

// Create a declining balance chart
const ctx = document.getElementById('balanceChart');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: Array.from(
      {length: simulationData.simulation.balances.length}, 
      (_, i) => `Month ${i}`
    ),
    datasets: [{
      label: 'Savings Balance',
      data: simulationData.simulation.balances,
      borderColor: simulationData.simulation.warning ? '#ef4444' : '#10b981',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: true
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '$' + value.toLocaleString()
        }
      }
    }
  }
});
```

### Using React + Recharts

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

function CareerBreakChart({ balances }) {
  const data = balances.map((balance, index) => ({
    month: `Month ${index}`,
    balance: balance
  }));

  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
      <Line 
        type="monotone" 
        dataKey="balance" 
        stroke="#ef4444" 
        strokeWidth={2} 
      />
    </LineChart>
  );
}
```

---

## Customization Options

### Change Initial Balance
In `banking_service.py`, line 20:
```python
INITIAL_BALANCE = 25000  # Change to desired amount
```

### Change Monthly Expenses
In `banking_service.py`, line 21:
```python
MONTHLY_EXPENSES = 3000  # Adjust based on your scenario
```

### Change Warning Threshold
In `banking_service.py`, line 195:
```python
"warning": final_balance < 5000  # Change 5000 to desired threshold
```

---

## Demo Data for Presentation

| Scenario | Months | Final Balance | Depletion % |
|----------|--------|---------------|-------------|
| Short Break | 3 | $16,000 | 36% |
| Maternity Leave | 6 | $7,000 | 72% |
| Extended Leave | 9 | -$2,000 | 108% (depleted) |
| Sabbatical | 12 | -$11,000 | 144% (depleted) |

---

## Capital One Prize Alignment

✅ **Requirement**: "Best use of Capital One Nessie API"
   - Creates real customer accounts
   - Processes actual withdrawal transactions
   - Uses sandbox banking infrastructure

✅ **Finance Forward Track**: "Empower women financially"
   - Visualizes career break financial impact
   - Helps evaluate job offer benefits (PTO, maternity leave)
   - Shows compound effect of wage gaps

✅ **MVP Ready**
   - Works out of the box
   - Clear API documentation
   - Easy frontend integration
   - Error handling included

---

## Presentation Talking Points

1. **The Problem**: Women disproportionately take career breaks for caregiving, but don't understand the financial impact

2. **The Solution**: Real-time simulation using actual banking APIs to show how savings erode during unpaid leave

3. **The Tech**: Capital One Nessie API creates realistic scenarios new grads can understand

4. **The Impact**: Helps women negotiate better benefits (paid parental leave, sabbatical policies) by quantifying the cost of unpaid breaks

---

## Tips for Judges Demo

1. Start with `/api/health` to show it's live
2. Run `/api/calculate-impact` for instant results
3. Then run `/api/simulate` to show real Nessie integration
4. Display the declining balance chart
5. Explain how this helps with job offer analysis

**Money Shot**: "A 6-month maternity leave without pay depletes 72% of a new grad's emergency fund"
