/**
 * FinanceDashboard — spending overview with three charts.
 * Uses recharts
 */

import { useMemo } from "react";
import {
    Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from "recharts"

import { useTransactions } from "../hooks/useFinance";
import { useCategories } from "../hooks/useFinance";
import { Link } from "react-router-dom";

// ── Helpers ───────────────

function fmt(amount) {
    return new Int1.NumberFormat("de-DE", {style: "currency", currency: "EUR" }).format(amount);
}

function monthKey(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() +1).padStart(2, "0")}`;
}

function monthLabel(key) {
    const [year, month] = key.split("-");
    return new Date(year, month - 1).toLocaleDateString("de-DE", { month: "short", year: "2-digit" });
}

// ── Stat Card ───────────────

function StatCard({ label, value, sub, accent}) {
    return (
        <div className="fin-stat-card" style={{ "--accent": accent }}>
            <div className="fin-stat-label">{label}</div>
            <div className="fin-stat-value">{value}</div>
            {sub && <div className="fint-stat-sub">{sub}</div>}
        </div>
    );
}

// ── Main Component ───────────────

// ── SVG Donut Chart ───────────────
//Used to avoid deprecated cell function in recharts

function DonutChart({ data }) {
    const total = data.reduce((s,d) => s + d.value, 0);
    const SIZE = 220;
    const CX = SIZE / 2;
    const CY = SIZE / 2;
    const R_OUTER = 90;
    const R_INNER = 58;
    const GAP_DEG = 2; // gap between segments


    // Convert slices into SVG arc path
    let cumulative = 0;
    const slices = data.map((d) => {
        const startAngle = (cumulative / total) * 360;
        cumulative += d.value;
        const endAngle = (cumulative / total) * 360;
        return { ...d, startAngle, endAngle }
    });

    function polarToCartesian(cx, cy, r, angleDeg) {
        const rad = ((angleDeg - 90) * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    }

    function arcPath(startDeg, endDeg, rOuter, rInner) {
        const gapRad = GAP_DEG / 2;
        const s = startDeg + gapRad;
        const e = endDeg - gapRad;
        if (e <= s) return "";

        const o1 = polarToCartesian(CX, CY, rOuter, s)
        const o2 = polarToCartesian(CX, CY, rOuter, e)
        const i1 = polarToCartesian(CX, CY, rInner, e)
        const i2 = polarToCartesian(CX, CY, rInner, s)
        const large = e - s > 180 ? 1 : 0;

        return [
            `M ${o1.x} ${o1.y}`,
            `A ${rOuter} ${rOuter} 0 ${large} 1 ${o2.x} ${o2.y}`,
            `L ${i1.x} ${i1.y}`,
            `A ${rInner} ${rInner} 0 ${large} 0 ${i2.x} ${i2.y}`,
            "Z",
        ].join(" ");
    }

    const top3 = data.slice(0,5)

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ flexShrink: 0 }}>
                {slices.map((slice, i) => (
                    <path
                        key={i}
                        d={arcPath(slice.startAngle, slice.endAngle, R_OUTER, R_INNER)}
                        fill={slice.color}
                        opacity={0.9}
                    >
                        <title>{`${slice.name}: ${fmt(slice.value)}`}</title>
                    </path>
                ))}
                {/* Centre Label */}
                <text x={CX} y={CY - 8} textAnchor="middle" fontSize="11" fill="#9ca3af" fontFamily="JetBrains Mono, monospace">Total</text>
                <text x={CX} y={CY - 12} textAnchor="middle" fontSize="14" fill="#1a1a1a" fontFamily="DM Serif Display, serif" fontWeight="bold">
                    {fmt(data.reduce((s,d) => s + d.value, 0))}
                </text>
            </svg>

            {/* Legends */}
            <div style={{ flex: 1, minWidth: 140 }}>
                {top3.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", fontSize: "0.78rem" }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0, display: "inline-block" }} />
                        <span style={{ color: "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
                        <span style={{ color: "#6b7280", fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem", flexShrink: 0 }}>{fmt(d.value)}</span>
                    </div>
                ))}
                {data.length > 5 && (
                    <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                        +{data.length -5} more categories
                    </div>
                )}
            </div>
        </div>
    )
}

function FinanceDashboard() {
    const { data: transactions = [], isPending } = useTransactions();
    const { data: categories = [] } = useCategories();

    const categoryMap = useMemo(() => {
        const m = {};
        categories.forEach((c) => { m[c.id] = c; });
        return m;
    }, [categories]);

    // ── Derived Stats ───────────────
    const stats = useMemo(() => {
        const income = transactions
            .filter((t) => t.transaction_type === "Eingang")
            .reduce((s,t) => s + parseFloat(t.amount), 0);
        const expenses = transactions
            .filter((t) => t.transaction_type === "Ausgang")
            .reduce((s,t) => s + Math.abs(parseFloat(t.amount)), 0);
        return { income, expenses, balance: income - expenses, count: transactions.length };
    }, [transactions]);

    // ── Pie Chart: spending by category ───────────────
    const categoryData = useMemo(() => {
        const map = {};
        transactions
            .filter((t) => t.transaction_type === "Ausgang")
            .forEach((t) => {
                const cat = t.category_id ? categoryMap[t.category_id] : null;
                const key = cat ? cat.name : "Uncategorised";
                const color = cat ? cat.color : "#a1a1aa";
                if (!map[key]) map[key] = { name: key, value: 0, color };
                map[key].value += Math.abs(parseFloat(t.amount));
            });
        return Object.values(map).sort((a,b) => b.value - a.value);
    }, [transactions, categoryMap])

     // ── Bar Chart: income vs expenses per month ───────────────
    const monthlyData = useMemo(() => {
        const map = {};
        transactions.forEach((t) => {
            const key = monthKey(t.payment_date);
            if (!map[key]) map[key] = { month: monthLabel(key), income: 0, expenses: 0};
            if (t.transaction_type === "Eingang") map[key].income += parseFloat(t.amount)
                else map[key].expenses += Math.abs(parseFloat(t.amount));
        });
        return Object.entries(map)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, v]) => v);
    }, [transactions]);

    // ── Line Chart: running balance ───────────────
    const balanceData = useMemo(() => {
        const sorted = [...transactions].sort(
            (a,b) => new Date(a.payment_date) - new Date(b.payment_date)
        );
        let running = 0;
        const byDay = {};
        sorted.forEach((t) => {
            running += parseFloat(t.amount);
            byDay[t.payment_date] = running;
        });
        return Object.entries(byDay).map(([date, balance]) => ({
            date: new Date(date).toLocaleDateString("de-DE", { day: "numeric", month: "short" }),
            balance: parseFloat(balance.toFixed(2)),
        }));
    }, [transactions])

    if (isPending) {
        return <div className="fin-loading">Finance data is loading...</div>;
    }

    return (
        <>
            <style>{dashStyles}</style>

            <div className="fin-dash">
                {/* Header */}
                <div className="fin-dash-header">
                    <div>
                        <h1 className="fin-title">Finance</h1>
                        <p className="fin-subtitle">DKB Account Activity overview</p>
                    </div>
                    <div className="fin-header-actions">
                        <Link to="/finance/transactions" className="fin-link-btn">
                            All transactions →
                        </Link>
                    </div>
                </div>
                {/* Stat cards */}
                <div className="fin-stats">
                    <StatCard label="Total Income" value={fmt(stats.income)} accent="#16a34a" />
                    <StatCard label="Total Expenses" value={fmt(stats.expenses)} accent="#dc2626"/>
                    <StatCard
                        label="Net Balance"
                        value={fmt(stats.balance)}
                        sub={`${stats.count} transactions`}
                        accent={stats.balance >= 0 ? "#2563eb" : "#f59e0b"}
                    />
                </div>

                {/* Charts grid */}
                <div className="fin-charts">
                    {/* Donut - expenses by category */}
                    <div className="fin-chart-card fin-chart-wide">
                        <div className="fin-chart-title">Spending by Category</div>
                        {categoryData.length === 0 ? (
                            <div className="fin-chart-empty">No expenses yet</div>
                        ): (
                            <DonutChart data={categoryData}/>
                        )}
                    </div>
                    
                    {/* Bar - Income vs Expenses */}
                    <div className="fin-chart-card fin-chart-full">
                        <div className="fin-chart-title">Income vs Expenses by Month</div>
                        {monthlyData.lenght === 0 ? (
                            <div className="fin-chart-empty">No monthly data yet</div>
                        ) : (
                            <ResponsiveContainer>
                                <BarChart>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tick={{ fontSize:12 }} />
                                    <YAxis tickFormatter={(v) => `€${v}`} tick={{ fontSize:12 }} />
                                    <Tooltip formatter={(v) => fmt(v)} />
                                    <Legend />
                                    <Bar dataKey="income" name="Income" fill="#16a34a" radius={[4, 4, 0, 0]}/>
                                    <Bar dataKey="expenses" name="Expenses" fill="#dc2626" radius={[4, 4, 0, 0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    {/* Line - balance trend */}
                    <div className="fin-chart-card find-chart-full">
                        <div className="fin-chart-title">Balance Trend</div>
                        {balanceData.length === 0 ? (
                            <div className="fin-chart-emtpy">No balance data yet</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={balanceData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                                    <YAxis tickFormatter={(v) => `€${v}`} tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(v) => fmt(v)} />
                                    <Line 
                                        type="monotone"
                                        dataKey="balance"
                                        name="Balance"
                                        stroke="#2563eb"
                                        dot={false}
                                        activeDot={{ r:4 }}
                                    />    
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

// ── Styles ────────────────────────────────────────────────────────────────────
 
const dashStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
 
  :root {
    --fin-bg: #f6f5f3;
    --fin-card: #ffffff;
    --fin-border: #e8e5e0;
    --fin-text: #1a1a1a;
    --fin-muted: #8a8a8a;
    --fin-mono: 'JetBrains Mono', monospace;
    --fin-serif: 'DM Serif Display', Georgia, serif;
    --fin-sans: 'DM Sans', sans-serif;
  }
 
  .fin-dash {
    font-family: var(--fin-sans);
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 0 4rem;
  }
 
  .fin-dash-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 2rem;
  }
 
  .fin-title {
    font-family: var(--fin-serif);
    font-size: 2.2rem;
    color: var(--fin-text);
    margin: 0 0 0.25rem;
  }
 
  .fin-subtitle {
    font-size: 0.85rem;
    color: var(--fin-muted);
    margin: 0;
  }
 
  .fin-link-btn {
    font-family: var(--fin-mono);
    font-size: 0.72rem;
    letter-spacing: 0.05em;
    color: #2563eb;
    text-decoration: none;
    border: 1px solid #bfdbfe;
    padding: 0.4rem 0.9rem;
    border-radius: 5px;
    background: #eff6ff;
    transition: all 0.15s;
  }
  .fin-link-btn:hover { background: #dbeafe; }
 
  /* Stat cards */
  .fin-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.75rem;
  }
 
  .fin-stat-card {
    background: var(--fin-card);
    border: 1px solid var(--fin-border);
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    border-top: 3px solid var(--accent, #6b7280);
    transition: box-shadow 0.15s;
  }
  .fin-stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
 
  .fin-stat-label {
    font-family: var(--fin-mono);
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--fin-muted);
    margin-bottom: 0.5rem;
  }
 
  .fin-stat-value {
    font-family: var(--fin-serif);
    font-size: 1.75rem;
    color: var(--fin-text);
    line-height: 1.1;
  }
 
  .fin-stat-sub {
    font-size: 0.75rem;
    color: var(--fin-muted);
    margin-top: 0.3rem;
    font-family: var(--fin-mono);
  }
 
  /* Charts */
  .fin-charts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
 
  .fin-chart-card {
    background: var(--fin-card);
    border: 1px solid var(--fin-border);
    border-radius: 12px;
    padding: 1.5rem;
  }
 
  .fin-chart-wide { grid-column: span 1; }
  .fin-chart-full { grid-column: span 2; }
 
  .fin-chart-title {
    font-family: var(--fin-mono);
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--fin-muted);
    margin-bottom: 1.25rem;
  }
 
  .fin-chart-empty {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--fin-muted);
    font-size: 0.85rem;
  }
 
  .fin-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50vh;
    color: var(--fin-muted, #8a8a8a);
    font-family: 'DM Sans', sans-serif;
  }
`;
 
export default FinanceDashboard;

