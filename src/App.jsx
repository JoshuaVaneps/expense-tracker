import { useState } from 'react'
import Summary from './components/Summary.jsx'
import CategoryChart from './components/CategoryChart.jsx'
import TransactionForm from './components/TransactionForm.jsx'
import TransactionList from './components/TransactionList.jsx'
import { formatMonth } from './format.js'
import './App.css'

function App() {
  const [transactions, setTransactions] = useState([
    { id: 1, description: "Salary", amount: 5000, type: "income", category: "salary", date: "2025-01-01" },
    { id: 2, description: "Rent", amount: 1200, type: "expense", category: "housing", date: "2025-01-02" },
    { id: 3, description: "Groceries", amount: 150, type: "expense", category: "food", date: "2025-01-03" },
    { id: 4, description: "Freelance Work", amount: 800, type: "income", category: "salary", date: "2025-01-05" },
    { id: 5, description: "Electric Bill", amount: 95, type: "expense", category: "utilities", date: "2025-01-06" },
    { id: 6, description: "Dinner Out", amount: 65, type: "expense", category: "food", date: "2025-01-07" },
    { id: 7, description: "Gas", amount: 45, type: "expense", category: "transport", date: "2025-01-08" },
    { id: 8, description: "Netflix", amount: 15, type: "expense", category: "entertainment", date: "2025-01-10" },
  ]);

  // The period lives here rather than in a child because all three siblings
  // read it — the summary, the chart and the list all show the same window.
  const [period, setPeriod] = useState("all");

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
    };

    setTransactions([...transactions, newTransaction]);
    // A new entry is stamped with today. If an older month is on screen it
    // would land outside the window and look like the add silently failed.
    setPeriod("all");
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const months = [...new Set(transactions.map(t => t.date.slice(0, 7)))].sort().reverse();
  // Self-healing: deleting the last entry of the selected month would otherwise
  // leave the select pointing at a month that no longer exists.
  const activePeriod = months.includes(period) ? period : "all";

  const visible = activePeriod === "all"
    ? transactions
    : transactions.filter(t => t.date.startsWith(activePeriod));

  return (
    <div className="app">
      <header className="masthead">
        <h1 className="wordmark">Finance Tracker</h1>

        <div className="masthead-controls">
          <label className="sr-only" htmlFor="period">Period</label>
          <select id="period" value={activePeriod} onChange={(e) => setPeriod(e.target.value)}>
            <option value="all">All time</option>
            {months.map(m => (
              <option key={m} value={m}>{formatMonth(m)}</option>
            ))}
          </select>
          <p className="masthead-meta">
            {visible.length} {visible.length === 1 ? "entry" : "entries"}
          </p>
        </div>
      </header>

      <Summary transactions={visible} />

      <div className="workspace">
        <CategoryChart transactions={visible} />
        <TransactionForm onAdd={addTransaction} />
      </div>

      <TransactionList transactions={visible} onDelete={deleteTransaction} />
    </div>
  );
}

export default App
