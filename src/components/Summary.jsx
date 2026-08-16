import { formatCurrency, formatDate } from '../format.js'

const SPARK_W = 100;
const SPARK_H = 28;

// Running balance in date order — the shape of how the current figure was reached.
function balanceSeries(transactions) {
  const chronological = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  let running = 0;
  return chronological.map(t => {
    running += t.type === "income" ? t.amount : -t.amount;
    return { date: t.date, balance: running };
  });
}

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

  const series = balanceSeries(transactions);
  const hasTrend = series.length >= 2;

  let linePath = "";
  let areaPath = "";
  if (hasTrend) {
    const values = series.map(p => p.balance);
    // Scaled to the data's own range, not anchored to zero. Anchoring to zero
    // is more honest about absolute size but flattens the curve to a
    // featureless line whenever the balance is large relative to its swings —
    // and the shape is the only thing a sparkline this size can convey.
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;

    const points = series.map((p, i) => {
      const x = (i / (series.length - 1)) * SPARK_W;
      const y = SPARK_H - ((p.balance - min) / span) * SPARK_H;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });

    linePath = `M${points.join(" L")}`;
    areaPath = `${linePath} L${SPARK_W},${SPARK_H} L0,${SPARK_H} Z`;
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

      {hasTrend && (
        <div className="hero-trend">
          <svg
            className="spark"
            viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={`Running balance across ${series.length} entries, ending at ${formatCurrency(balance)}`}
          >
            <path className="spark-area" d={areaPath} />
            {/* non-scaling-stroke keeps the line an even weight despite the
                squashed preserveAspectRatio */}
            <path className="spark-line" d={linePath} vectorEffect="non-scaling-stroke" />
          </svg>

          <div className="spark-scale">
            <span>{formatDate(series[0].date)}</span>
            <span>{formatDate(series[series.length - 1].date)}</span>
          </div>
        </div>
      )}
    </section>
  );
}

export default Summary
