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
import { colorForCategory } from '../constants.js'
import { formatCurrency } from '../format.js'

const AXIS_INK = "#5c6579";
const CURSOR_FILL = "#f1f3f8";

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
              axisLine={{ stroke: "#e3e7ef" }}
              tick={{ fill: AXIS_INK, fontSize: 12 }}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: CURSOR_FILL }}
              formatter={(value) => [formatCurrency(value), "Spent"]}
              contentStyle={{
                border: "1px solid #e3e7ef",
                borderRadius: 8,
                fontSize: 13,
                boxShadow: "0 4px 16px rgba(16, 26, 43, 0.08)",
              }}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map(entry => (
                <Cell key={entry.category} fill={colorForCategory(entry.category)} />
              ))}
              <LabelList
                dataKey="amount"
                position="top"
                formatter={formatCurrency}
                fill={AXIS_INK}
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}

export default CategoryChart
