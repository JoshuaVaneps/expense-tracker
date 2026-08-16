import { useState } from 'react'
import { CATEGORIES, categoryClass } from '../constants.js'
import { formatCurrency, formatDate } from '../format.js'

function TransactionList({ transactions, onDelete }) {
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  let filteredTransactions = transactions;
  if (filterType !== "all") {
    filteredTransactions = filteredTransactions.filter(t => t.type === filterType);
  }
  if (filterCategory !== "all") {
    filteredTransactions = filteredTransactions.filter(t => t.category === filterCategory);
  }

  const isFiltered = filterType !== "all" || filterCategory !== "all";

  // Magnitude bars are scaled to the largest row currently on screen, so they
  // rescale with the filters rather than staying keyed to a hidden row.
  const scale = filteredTransactions.reduce((max, t) => Math.max(max, t.amount), 0) || 1;

  const moneyCell = (t, side) => {
    if ((side === "in") !== (t.type === "income")) return null;

    return (
      <>
        <span
          className={`magnitude ${side === "in" ? "magnitude-credit" : "magnitude-debit"}`}
          style={{ width: `${(t.amount / scale) * 100}%` }}
        />
        <span className={`money-value figure ${side === "in" ? "income-amount" : "expense-amount"}`}>
          {formatCurrency(t.amount)}
        </span>
      </>
    );
  };

  return (
    <section className="card list-card">
      <div className="list-head">
        <h2 className="card-title">Transactions</h2>

        <div className="filters">
          <label className="sr-only" htmlFor="filter-type">Filter by type</label>
          <select id="filter-type" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <label className="sr-only" htmlFor="filter-category">Filter by category</label>
          <select id="filter-category" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <p className="empty-state">
          {isFiltered
            ? "No transactions match these filters. Widen them to see more."
            : "No transactions yet. Add one to start the ledger."}
        </p>
      ) : (
        <div className="table-scroll">
          <table className="ledger">
            <thead>
              <tr>
                <th className="col-date">Date</th>
                <th>Description</th>
                <th>Category</th>
                <th className="col-money">In</th>
                <th className="col-money">Out</th>
                <th className="col-action"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.id}>
                  <td className="col-date">{formatDate(t.date)}</td>
                  <td className="cell-description">{t.description}</td>
                  <td>
                    <span className="category-tag">
                      <span className={`category-dot ${categoryClass(t.category)}`} />
                      {t.category}
                    </span>
                  </td>
                  <td className="col-money">{moneyCell(t, "in")}</td>
                  <td className="col-money">{moneyCell(t, "out")}</td>
                  <td className="col-action">
                    <button
                      className="btn-remove"
                      aria-label={`Remove ${t.description}`}
                      onClick={() => {
                        if (window.confirm("Delete this transaction?")) onDelete(t.id);
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default TransactionList
