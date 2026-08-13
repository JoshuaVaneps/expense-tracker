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
import { CATEGORIES } from '../constants.js'

// One validated hue per category, indexed by position in CATEGORIES so a
// category keeps its color no matter how the bars are sorted.
const CATEGORY_COLORS = [
  "#2a78d6", // food
  "#eb6834", // housing
  "#1baf7a", // utilities
  "#eda100", // transport
  "#e87ba4", // entertainment
  "#008300", // salary
  "#4a3aa7", // other
];
const FALLBACK_COLOR = "#898781";
const AXIS_INK = "#898781";
const CURSOR_FILL = "#f0efec";

const colorFor = (category) => CATEGORY_COLORS[CATEGORIES.indexOf(category)] || FALLBACK_COLOR;

const formatCurrency = (value) => `$${value.toFixed(2)}`;

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
    <div className="category-chart">
      <h2>Spending by Category</h2>
      {data.length === 0 ? (
        <p className="chart-empty">No expenses to chart yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 24, right: 8, bottom: 8, left: 8 }}>
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={{ stroke: "#c3c2b7" }}
              tick={{ fill: AXIS_INK, fontSize: 12 }}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: CURSOR_FILL }}
              formatter={(value) => [formatCurrency(value), "Spent"]}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map(entry => (
                <Cell key={entry.category} fill={colorFor(entry.category)} />
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
    </div>
  );
}

export default CategoryChart
