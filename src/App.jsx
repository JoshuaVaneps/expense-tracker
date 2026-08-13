import { useState } from 'react'
import Summary from './components/Summary.jsx'
import CategoryChart from './components/CategoryChart.jsx'
import TransactionForm from './components/TransactionForm.jsx'
import TransactionList from './components/TransactionList.jsx'
import './App.css'

function App() {
  const [transactions, setTransactions] = useState([
    { id: 1, description: "Salary", amount: 5000, type: "income", category: "salary", date: "2025-01-01" },
    { id: 2, description: "Rent", amount: 1200, type: "expense", category: "housing", date: "2025-01-02" },
    { id: 3, description: "Groceries", amount: 150, type: "expense", category: "food", date: "2025-01-03" },
    { id: 4, description: "Freelance Work", amount: 800, type: "expense", category: "salary", date: "2025-01-05" },
    { id: 5, description: "Electric Bill", amount: 95, type: "expense", category: "utilities", date: "2025-01-06" },
    { id: 6, description: "Dinner Out", amount: 65, type: "expense", category: "food", date: "2025-01-07" },
    { id: 7, description: "Gas", amount: 45, type: "expense", category: "transport", date: "2025-01-08" },
    { id: 8, description: "Netflix", amount: 15, type: "expense", category: "entertainment", date: "2025-01-10" },
  ]);

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
    };

    setTransactions([...transactions, newTransaction]);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <div className="app">
      <header className="masthead">
        <h1 className="wordmark">Finance Tracker</h1>
        <p className="masthead-meta">
          {transactions.length} {transactions.length === 1 ? "entry" : "entries"}
        </p>
      </header>

      <Summary transactions={transactions} />

      <div className="workspace">
        <CategoryChart transactions={transactions} />
        <TransactionForm onAdd={addTransaction} />
      </div>

      <TransactionList transactions={transactions} onDelete={deleteTransaction} />
    </div>
  );
}

export default App
