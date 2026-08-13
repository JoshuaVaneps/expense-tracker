import { useState } from 'react'
import { CATEGORIES } from '../constants.js'

function TransactionForm({ onAdd }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("food");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    onAdd({ description, amount: Number(amount), type, category });

    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("food");
  };

  return (
    <section className="card form-card">
      <h2 className="card-title">Add transaction</h2>

      <form className="entry-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="entry-description">Description</label>
          <input
            id="entry-description"
            type="text"
            placeholder="Rent, groceries, paycheck"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="entry-amount">Amount</label>
          <input
            id="entry-amount"
            className="figure"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="field-pair">
          <div className="field">
            <label htmlFor="entry-type">Type</label>
            <select id="entry-type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="entry-category">Category</label>
            <select id="entry-category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary">Add transaction</button>
      </form>
    </section>
  );
}

export default TransactionForm
