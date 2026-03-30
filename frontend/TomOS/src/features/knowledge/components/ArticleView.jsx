/**
 * ArticleView — renders a single article's markdown body.
 *
 * Requires `react-markdown` and `remark-gfm`:
 *   npm install react-markdown remark-gfm
 *
 * Props:
 * - article: Article object
 * - onEdit: () => void
 * - onDelete: () => void
 */

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useAuth } from "../../users/hooks/useAuth"

function ArticleView({article, onEdit, onDelete}) {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    if (!article) {
        return (
            <div className="article-empty">
                <div className="empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </svg>
                </div>
                <p>Select an article to start reading</p>
            </div>
        );
    }

    return (
        <article className="article-view">
            {/* Article Header */}
            <header className="article-header">
                <div className="article-header-meta">
                    {article.category_name && (
                        <span className="article-category">{article.category_name}</span>
                    )}
                    <span className="article-date">
                        Updated{" "}
                        {new Date(article.updated_at).toLocaleDateString("de-DE", {
                            day: "numeric", month: "long", year: "numeric",
                        })}
                    </span>
                </div>

                <h1 className="article-title">{article.title}</h1>

                {article.tags?.length > 0 && (
                    <div className="article-tags">
                        {article.tags.map((tags) => (
                            <span key={tags.id} className="tag">{tags.name}</span>
                        ))}
                    </div>
                )}

                {/* Actions - always show edit, only admins can delete */}
                <div className="article-actions">
                    <button className="action-btn edit-btn" onClick={onEdit}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                    </button>
                    {isAdmin && (
                        <button
                            className="action-btn delete-btn"
                            onClick={() => {
                                if (window.confirm(`Delete "${article.title}"?`)) onDelete();
                            }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                            <   path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                            </svg>
                            Delete
                        </button>
                    )}
                </div>
            </header>

            {/* Divider */}
            <hr className="article-divider"/>

            {/* Markdown Body */}
            <div>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {article.body}
                </ReactMarkdown>
            </div>
        </article>
    );

}

export default ArticleView