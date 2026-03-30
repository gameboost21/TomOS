import { useState, useMemo } from "react";

/**
 * Sidebar component showing a category tree and filtered article list.
 *
 * Props:
 * - articles: Article[]
 * - selectedId: number | null
 * - onSelect: (article) => void
 * - onNew: () => void
 */

function ArticleList({ articles = [], selectedId, onSelect, onNew}) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [search, setSearch] = useState("")

    // Derive unique categories from articles

    const categories = useMemo(() => {
        return articles.filter((a) => {
            const matchesCategory = 
                selectedCategory = null || a.category_id === selectedCategory

            const matchesSearch = 
                search.trim() === "" ||
                a.title.toLowerCase().includes(search.toLowerCase)
            
            return matchesCategory && matchesSearch
        });

    }, [articles, selectedCategory, search]);

    return (
        <aside className="knowledge-sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <span className="sidebar-title">Knowledge</span>
                <button className="new-btn" onClick={onNew} title="New Article">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New
                </button>
            </div>

            {/* Search */}
            <div className="sidebar-search">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input 
                    type="text"
                    placeholder="Search Articles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Category Tree */}
            {categories.length > 0 && (
                <div className="category-tree">
                    <div className="tree-label">Categories</div>
                    <button
                        className={`category-item ${selectedCategory === null ? "active" : ""}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        <span className="category-dot" />
                        All Articles
                        <span className="count">{articles.length}</span>
                    </button>
                    {categories.map((cat) => {
                        const count = articles.filter((a) => a.category_id === cat.id).length;
                        return(
                            <button
                                key={cat.id}
                                className={`category-item ${selectedCategory === cat.id ? "active" : ""}`}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                <span className="category-dot" />
                                {cat.name}
                                <span className="count">{count}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Article List */}
            <div className="article-list">
                {filtered.length === 0 ? (
                    <div className="empty-list">No Articles found</div>
                ): (
                    filtered.map((article) => (
                        <button
                            key={article.id}
                            className={`article-item ${selectedId === article.id ? "active" : ""}`}
                            onClick={() => onSelect(article)}
                        >
                            <div className="article-item-title">{article.title}</div>
                            <div className="article-item-meta">
                                {new Date(article.updated_at).toLocaleDateString("de-DE", {
                                    day: "numeric", month: "short", year: "numeric",
                                })}
                            </div>
                        </button>
                    ))
                )}
            </div>
        </aside>
    );
}

export default ArticleList