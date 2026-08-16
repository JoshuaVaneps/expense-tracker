import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from 'recharts'
import { categoryClass } from '../constants.js'
import { formatCurrency } from '../format.js'

// Plain hex fallbacks. These are presentation attributes, which lose to any
// stylesheet rule, so the themed `.cat-*` classes in index.css always win —
// these only show for a category with no rule of its own.
const FALLBACK_FILL = "#5c6579";

function CategoryChart({ transactions }) {
  const totalsByCategory = {};
  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      totalsByCategory[t.category] = (totalsByCategory[t.category] || 0) + t.amount;
    });

  const data = Object.entries(totalsByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <section className="card chart-card">
      <h2 className="card-title">Spending by category</h2>
      {data.length === 0 ? (
        <p className="empty-state">No expenses to chart yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 28, right: 8, bottom: 8, left: 8 }}>
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ className: "chart-cursor" }}
              // Recharts writes the tooltip's colors as inline styles, which a
              // stylesheet rule cannot override — but an inline style can hold
              // a var(), so the token still drives it in both themes.
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--rule)",
                borderRadius: 8,
                fontSize: 13,
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
              }}
              labelStyle={{ color: "var(--ink-muted)" }}
              itemStyle={{ color: "var(--ink)" }}
              // The share is what rescues the small categories: at an 80:1
              // range the shortest bars carry no visual signal of their own.
              formatter={(value) => [
                `${formatCurrency(value)} · ${Math.round((value / total) * 100)}% of spending`,
                "Spent",
              ]}
            />
            <Bar dataKey="amount" fill={FALLBACK_FILL} radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map(entry => (
                <Cell key={entry.category} className={categoryClass(entry.category)} />
              ))}
              <LabelList dataKey="amount" position="top" formatter={formatCurrency} fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}

export default CategoryChart
