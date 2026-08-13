import { formatCurrency } from '../format.js'

function Summary({ transactions }) {
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;
  const inTheBlack = balance >= 0;

  // How much of what came in has gone back out. Caps at 100% so the meter
  // never overflows its track when spending outruns income.
  const spentShare = totalIncome > 0
    ? Math.min(totalExpenses / totalIncome, 1)
    : (totalExpenses > 0 ? 1 : 0);

  let meterNote;
  if (totalIncome === 0 && totalExpenses === 0) {
    meterNote = "Nothing recorded yet";
  } else if (totalIncome === 0) {
    meterNote = "Spending recorded, no income yet";
  } else {
    const percent = Math.round((totalExpenses / totalIncome) * 100);
    meterNote = totalExpenses > totalIncome
      ? `Spending is ${percent}% of income`
      : `${percent}% of income spent`;
  }

  return (
    <section className="hero">
      <div className="hero-headline">
        <p className="eyebrow">Balance</p>
        <p className={`hero-figure figure${inTheBlack ? "" : " is-debit"}`}>
          {formatCurrency(balance)}
        </p>
        <p className="hero-state">{inTheBlack ? "in the black" : "in the red"}</p>
      </div>

      <div className="hero-flow">
        <div
          className="meter-track"
          role="progressbar"
          aria-label="Share of income spent"
          aria-valuenow={Math.round(spentShare * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="meter-fill" style={{ width: `${spentShare * 100}%` }} />
        </div>
        <p className="meter-note">{meterNote}</p>

        <dl className="hero-totals">
          <div className="hero-total">
            <dt>Income</dt>
            <dd className="figure income-amount">{formatCurrency(totalIncome)}</dd>
          </div>
          <div className="hero-total">
            <dt>Spent</dt>
            <dd className="figure expense-amount">{formatCurrency(totalExpenses)}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

export default Summary
