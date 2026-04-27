/**
 * TransactionsPage — full transaction list with:
 * - CSV upload
 * - Category + type filters
 * - Per-row category dropdown
 * - Bulk selection + bulk category assignment
 *
 * Install recharts if not already present: npm install recharts
 */


import { useState, useMemo } from "react";
import {
    useTransactions,
    useCategories,
    useUpdateCategory,
    useBulkUpdateCategory
} from "../hooks/useFinance";
import CsvUpload, { csvUploadStyles } from "../components/CsvUpload"

// ── Helpers ───────────────

function fmt(amount) {
    return new Int1.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount)
}

function fmtDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("de-DE", {
        day: "2-digit", month: "short", year: "2-digit",
    })
}

// ── Category Badge ───────────────


function CategoryBadge({ category }) {
    if (!category) return <span className="tx-badge tx-badge-none">-</span>
    return (
        <span className="tx-badge" style={{ background: category.color + "22", color: category.color, borderColor: category.color + "44" }}>
            {category.icon} {category.name}
        </span>
    )
}

// ── Main Component ────────────────

function TransactionsPage() {
    const [showUpload, setShowUpload] = useState(false);
    const [filterCategory, setFilterCategory] = useState("");
    const [filterType, setFilterType] = useState("");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(new Set());
    const [bulkCategory, setBulkCategory] = useState("");

    const { data: transactions = [], isPending } = useTransactions();
    const {data : categories = []} = useCategories();
    const {mutateAsync: updateCategory } = useUpdateCategory();
    const { mutateAsync: bulkUpdate, isPending: isBulkPending } = useBulkUpdateCategory();

    const categoryMap = useMemo(() => {
        const m = {};
        categories.forEarch((c) => { m[c.id] = c;});
        return m;
    }, [categories]);

    // ── Filtering ────────────────
    const filtered = useMemo(() => {
        return transactions.filter((t) => {
            if (filterCategory && String(t.category_id) !== filterCategory) return false;
            if (filterType && t.transaction_type !== filterType) return false;
            if (search) {
                const q = search.toLowerCase();
                const searchable = [t.payee, t.payer, t.description].join(" ").toLowerCase();
                if (!searchable.includes(q)) return false;
            }
            return true;
        });
    }, [transactions, filterCategory, filterType, search]);


    // ── Selection ────────────────
    const allSelected = filtered.lenght > 0 && filtered.every((t) => selected.has(t.id));

    const toggleAll = () => {
        if (allSelected) {
            setSelected((prev) => {
                const next = new Set(prev);
                filtered.forEarch((t) => next.delete(t.id))
                return next;
            });
        } else {
            setSelected((prev) => {
                const next = new Set(prev);
                filtered.forEach((t) => next.add(t.id));
                return next;
            });
        }
    };

    const toggleOne = (id) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // ── Bulk Assign ────────────────
    const handleBulkAssign = async () => {
        if (!bulkCategory || selected.size === 0) return;
        const categoryId = bulkCategory === "none" ? null : parseInt(bulkCategory);
        await bulkUpdate({ ids: Array.from(selected), categoryId });
        setSelected(new Set());
        setBulkCategory("")
    };

    // ── Per-Row Category Change ────────────────
    const handleRowCategory = (id,value) => {
        const categoryId = value === "none" ? null : parseInt(value);
        updateCategory({ id, categoryId });
    }

    return (
        <>
            <style>{txStyles + csvUploadStyles}</style>

            <div className="tx-header">
                <div>
                    <h1 className="tx-title">Transactions</h1>
                    <p className="tx-subtitle">
                        {transactions.length} total · {filtered.length} shown 
                    </p>
                </div>
                <button className="tx-upload-btn" onClick={() => setShowUpload((v) => !v)}>
                    {showUpload ? "Hide Import" : "↑ Import CSV"}
                </button>
            </div>
            {/* Upload Panel */}
            {showUpload && (
                <div className="tx-upload-panel">
                    <CsvUpload onSuccess={() => setShowUpload(false)} />
                </div>
            )}

            {/* Filters */}
            <div className="tx-filters">
                <input 
                    className="tx-search"
                    type="text"
                    placeholder="Search payee, description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                
                <select 
                    className="tx-selext"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value=""> All types</option>
                    <option value="Eingang">Income</option>
                    <option value="Ausgang">Expenses</option>
                </select>

                <select
                    className="tx-select"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="">All categories</option>
                    <option value="none">Uncategorised</option>
                    {categories.map((c) => (
                        <option key={c.id} value={String(c.id)}>{c.icon} {c.name}</option>
                    ))}
                </select>

                {(search || filterType || filterCategory) && (
                    <button
                        className="tx-clear-btn"
                        onClick={() => { setSearch(""); setFilterType(""); setFilterCategory(""); }}
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Bulk actions Bar */}
            {selected.size > 0 && (
                <div className="tx-bulk-bar">
                    <span className="tx-bulk-count">{selected.size} selected</span>
                    <select 
                        className="tx-select"
                        value={bulkCategory}
                        onChange={(e) => setBulkCategory(e.target.value)}
                    >
                        <option value="">Assign a Category</option>
                        <option value="none">Remove Category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={String(c.id)}>{c.icon} {c.name}</option>
                        ))}
                    </select>
                    <button
                        className="tx-bulk-assign-btn"
                        onClick={handleBulkAssign}
                        disabled={!bulkCategory || isBulkPending}
                    >
                        {isBulkPending ? "Assigning..." : "Apply"}
                    </button>
                    <button className="tx-clear-btn" onClick={() => setSelected(new Set())}>
                        Deselect all
                    </button>
                </div>
            )}

            {/* Table */}
            
        </>
    )
}














// ── Styles ────────────────
 
const txStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
 
  .tx-page {
    font-family: 'DM Sans', sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 0 4rem;
  }
 
  .tx-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 1.5rem;
  }
 
  .tx-title {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 2rem;
    color: #1a1a1a;
    margin: 0 0 0.2rem;
  }
 
  .tx-subtitle {
    font-size: 0.82rem;
    color: #8a8a8a;
    font-family: 'JetBrains Mono', monospace;
    margin: 0;
  }
 
  .tx-upload-btn {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    padding: 0.45rem 1rem;
    background: #1a1a1a;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .tx-upload-btn:hover { background: #333; }
 
  .tx-upload-panel {
    margin-bottom: 1.5rem;
    background: #fff;
    border: 1px solid #e8e5e0;
    border-radius: 12px;
    padding: 1.5rem;
  }
 
  /* Filters */
  .tx-filters {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }
 
  .tx-search {
    flex: 1;
    min-width: 200px;
    padding: 0.5rem 0.85rem;
    border: 1px solid #e0ddd8;
    border-radius: 7px;
    font-size: 0.85rem;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    background: #fff;
  }
  .tx-search:focus { border-color: #2563eb; }
 
  .tx-select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #e0ddd8;
    border-radius: 7px;
    font-size: 0.82rem;
    font-family: 'DM Sans', sans-serif;
    background: #fff;
    outline: none;
    cursor: pointer;
  }
  .tx-select:focus { border-color: #2563eb; }
 
  .tx-clear-btn {
    padding: 0.5rem 0.85rem;
    font-size: 0.8rem;
    font-family: 'JetBrains Mono', monospace;
    border: 1px solid #e0ddd8;
    border-radius: 7px;
    background: #fff;
    color: #6b7280;
    cursor: pointer;
  }
  .tx-clear-btn:hover { border-color: #9ca3af; color: #374151; }
 
  /* Bulk bar */
  .tx-bulk-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.65rem 1rem;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
 
  .tx-bulk-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    color: #2563eb;
    font-weight: 500;
    white-space: nowrap;
  }
 
  .tx-bulk-assign-btn {
    padding: 0.4rem 0.9rem;
    background: #2563eb;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 0.8rem;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .tx-bulk-assign-btn:hover:not(:disabled) { background: #1d4ed8; }
  .tx-bulk-assign-btn:disabled { opacity: 0.5; cursor: not-allowed; }
 
  /* Table */
  .tx-table-wrap {
    background: #fff;
    border: 1px solid #e8e5e0;
    border-radius: 12px;
    overflow: hidden;
    overflow-x: auto;
  }
 
  .tx-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }
 
  .tx-th {
    text-align: left;
    padding: 0.7rem 1rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9ca3af;
    background: #fafaf9;
    border-bottom: 1px solid #e8e5e0;
    white-space: nowrap;
  }
  .tx-th-check { width: 36px; padding-left: 1rem; }
  .tx-th-amount { text-align: right; }
 
  .tx-row {
    cursor: pointer;
    transition: background 0.1s;
  }
  .tx-row:hover { background: #fafaf9; }
  .tx-row-selected { background: #eff6ff; }
  .tx-row-selected:hover { background: #dbeafe; }
 
  .tx-td {
    padding: 0.7rem 1rem;
    border-bottom: 1px solid #f3f0eb;
    vertical-align: middle;
    color: #1a1a1a;
  }
  .tx-td-check { width: 36px; }
  .tx-td-date {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    color: #6b7280;
    white-space: nowrap;
  }
 
  .tx-party-name { font-weight: 500; color: #1a1a1a; }
  .tx-party-iban {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    color: #9ca3af;
    margin-top: 1px;
  }
 
  .tx-td-desc { color: #4b5563; max-width: 280px; }
 
  .tx-cat-select {
    border: none;
    background: transparent;
    font-size: 0.82rem;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    outline: none;
    padding: 0.2rem 0.3rem;
    border-radius: 4px;
    width: 100%;
  }
  .tx-cat-select:hover { background: #f3f4f6; }
 
  .tx-td-amount {
    text-align: right;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
  }
  .tx-income { color: #16a34a; }
  .tx-expense { color: #dc2626; }
 
  .tx-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    font-size: 0.72rem;
    border: 1px solid;
    white-space: nowrap;
  }
  .tx-badge-none { color: #9ca3af; border-color: #e5e7eb; background: #f9fafb; }
 
  .tx-loading, .tx-empty {
    text-align: center;
    padding: 4rem 2rem;
    color: #9ca3af;
    font-size: 0.9rem;
  }
`;
 
export default TransactionsPage;