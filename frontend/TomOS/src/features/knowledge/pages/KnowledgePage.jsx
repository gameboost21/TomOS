import { useState } from "react";
import ArticleList from "../components/ArticleList";
import ArticleView from "../components/ArticleView";
import ArticleEditor from "../components/ArticleEditor"
import {
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
  useArticles,
} from "../hooks/useKnowledge"

/**
 * KnowledgePage — three-panel layout:
 *   [Sidebar: category tree + article list] [Main: view or editor]
 */


function KnowledgePage() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [mode, setMode] = useState("view"); // "view" | "create" | "edit"

  const { data: articles = [], isPending, isError, error } = useArticles();
  const { mutateAsync: createArticle, isPending: isCreating } = useCreateArticle();
  const { mutateAsync: updateArticle, isPending: isUpdating } = useUpdateArticle();
  const isSaving = isCreating || isUpdating;
  const { mutateAsync: deleteArticle } = useDeleteArticle();

  const handleSelect = (article) => {
    setSelectedArticle(article);
    setMode("view")
  }

  const handleNew = () => {
    setSelectedArticle(null);
    setMode("create")
  }

  const handleEdit = () => {
    setMode("edit")
  }

  const handleDelete = async () => {
    if (!selectedArticle) return;
    await deleteArticle(selectedArticle.id);
    setSelectedArticle(null)
    setMode("view")
  }

  const handleSave = async (payload) => {
    if (mode === "create") {
      const created = await createArticle(payload);
      setSelectedArticle(created)
    } else if (mode === "edit") {
      const updated = await updateArticle({ id: selectedArticle.id, article: payload });
      setSelectedArticle(updated);
    }
    setMode("view")
  }

  const handleCancel = () => {
    setMode("view")
  };

    // Render loading/error inside the layout so ArticleList always mounts
  const mainContent = () => {
    if (isPending) {
      return (
        <div className="knowledge-loading">
          <div className="loading-dots">
            <span /><span /><span />
          </div>
        </div>
      );
    }
    if (isError) {
      return (
        <div className="knowledge-error">
          Failed to load knowledge base: {error.message}
        </div>
      );
    }
    if (mode === "view") {
      return (
        <ArticleView
          article={selectedArticle}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      );
    }
    return (
      <ArticleEditor
        article={mode === "edit" ? selectedArticle : null}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
      />
    );
  };

  return(
    <>
      {/* Inject Styles */}
      <style>{knowledgeStyles}</style>

      <div className="knowledge-layout">
        {/* Sidebar */}
        <ArticleList 
          articles={articles}
          selectedId={selectedArticle?.id}
          onSelect={handleSelect}
          onNew={handleNew}
        />

        {/* Main Pane */}
        <main className="knowledge-main">
          {mainContent()}
        </main>
      </div>
    </>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const knowledgeStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
 
  :root {
    --sidebar-bg: #141414;
    --sidebar-border: #2a2a2a;
    --sidebar-text: #999;
    --sidebar-text-active: #f0f0f0;
    --sidebar-hover: #1e1e1e;
    --sidebar-active: #252525;
    --accent: #c9a96e;
    --accent-dim: rgba(201,169,110,0.15);
    --main-bg: #faf9f7;
    --main-text: #1a1a1a;
    --main-border: #e8e5e0;
    --muted: #8a8a8a;
    --tag-bg: #f0ece5;
    --tag-text: #6b5f4e;
    --mono: 'JetBrains Mono', monospace;
    --serif: 'Lora', Georgia, serif;
    --sans: 'DM Sans', sans-serif;
  }
 
  .knowledge-layout {
    display: flex;
    height: calc(100vh - 65px);
    margin: -2rem -1.5rem;
    font-family: var(--sans);
    overflow: hidden;
  }
 
  /* ── Sidebar ── */
  .knowledge-sidebar {
    width: 260px;
    min-width: 260px;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--sidebar-border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
 
  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1rem 1rem;
    border-bottom: 1px solid var(--sidebar-border);
  }
 
  .sidebar-title {
    font-family: var(--mono);
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
  }
 
  .new-btn {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    background: var(--accent-dim);
    border: 1px solid rgba(201,169,110,0.3);
    color: var(--accent);
    font-family: var(--mono);
    font-size: 0.65rem;
    letter-spacing: 0.05em;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .new-btn:hover {
    background: rgba(201,169,110,0.25);
  }
 
  .sidebar-search {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--sidebar-border);
    color: var(--sidebar-text);
  }
  .sidebar-search input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: var(--sidebar-text-active);
    font-family: var(--sans);
    font-size: 0.82rem;
  }
  .sidebar-search input::placeholder { color: #555; }
 
  .category-tree {
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--sidebar-border);
  }
 
  .tree-label {
    font-family: var(--mono);
    font-size: 0.6rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #444;
    padding: 0 1rem 0.4rem;
  }
 
  .category-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 1rem;
    background: none;
    border: none;
    color: var(--sidebar-text);
    font-family: var(--sans);
    font-size: 0.82rem;
    cursor: pointer;
    text-align: left;
    transition: all 0.12s;
  }
  .category-item:hover { background: var(--sidebar-hover); color: var(--sidebar-text-active); }
  .category-item.active { background: var(--sidebar-active); color: var(--sidebar-text-active); }
 
  .category-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #444;
    flex-shrink: 0;
  }
  .category-item.active .category-dot { background: var(--accent); }
 
  .count {
    margin-left: auto;
    font-family: var(--mono);
    font-size: 0.65rem;
    color: #444;
  }
 
  .article-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem 0;
  }
  .article-list::-webkit-scrollbar { width: 3px; }
  .article-list::-webkit-scrollbar-thumb { background: #2a2a2a; }
 
  .empty-list {
    padding: 2rem 1rem;
    text-align: center;
    color: #444;
    font-size: 0.8rem;
  }
 
  .article-item {
    width: 100%;
    display: block;
    padding: 0.65rem 1rem;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    border-left: 2px solid transparent;
    transition: all 0.12s;
  }
  .article-item:hover { background: var(--sidebar-hover); }
  .article-item.active {
    background: var(--sidebar-active);
    border-left-color: var(--accent);
  }
 
  .article-item-title {
    font-family: var(--sans);
    font-size: 0.85rem;
    color: var(--sidebar-text-active);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.2rem;
  }
  .article-item.active .article-item-title { color: #fff; }
 
  .article-item-meta {
    font-family: var(--mono);
    font-size: 0.62rem;
    color: #555;
  }
 
  /* ── Main pane ── */
  .knowledge-main {
    flex: 1;
    background: var(--main-bg);
    overflow-y: auto;
  }
  .knowledge-main::-webkit-scrollbar { width: 4px; }
  .knowledge-main::-webkit-scrollbar-thumb { background: var(--main-border); }
 
  /* ── Article empty state ── */
  .article-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #bbb;
    gap: 1rem;
    font-size: 0.9rem;
    font-family: var(--sans);
  }
  .empty-icon { opacity: 0.3; }
 
  /* ── Article view ── */
  .article-view {
    max-width: 720px;
    margin: 0 auto;
    padding: 3rem 2.5rem 5rem;
  }
 
  .article-header { margin-bottom: 0; }
 
  .article-header-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
 
  .article-category {
    font-family: var(--mono);
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accent-dim);
    padding: 0.2rem 0.6rem;
    border-radius: 3px;
  }
 
  .article-date {
    font-family: var(--mono);
    font-size: 0.68rem;
    color: var(--muted);
  }
 
  .article-title {
    font-family: var(--serif);
    font-size: 2rem;
    font-weight: 600;
    color: var(--main-text);
    line-height: 1.3;
    margin: 0 0 1rem;
  }
 
  .article-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-bottom: 1rem;
  }
 
  .tag {
    font-family: var(--mono);
    font-size: 0.65rem;
    background: var(--tag-bg);
    color: var(--tag-text);
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
  }
 
  .article-actions {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
 
  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-family: var(--mono);
    font-size: 0.68rem;
    letter-spacing: 0.03em;
    padding: 0.35rem 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid;
    transition: all 0.15s;
  }
 
  .edit-btn {
    background: #fff;
    border-color: var(--main-border);
    color: var(--main-text);
  }
  .edit-btn:hover { border-color: #bbb; background: #f5f5f5; }
 
  .delete-btn {
    background: #fff;
    border-color: #f5c6c6;
    color: #c0392b;
  }
  .delete-btn:hover { background: #fdf0f0; }
 
  .article-divider {
    border: none;
    border-top: 1px solid var(--main-border);
    margin: 0 0 2rem;
  }
 
  /* ── Markdown body ── */
  .article-body {
    font-family: var(--serif);
    font-size: 1.05rem;
    line-height: 1.85;
    color: #2c2c2c;
  }
 
  .article-body h1, .article-body h2, .article-body h3,
  .article-body h4, .article-body h5, .article-body h6 {
    font-family: var(--serif);
    color: var(--main-text);
    margin: 2rem 0 0.75rem;
    line-height: 1.3;
  }
  .article-body h1 { font-size: 1.6rem; }
  .article-body h2 { font-size: 1.3rem; border-bottom: 1px solid var(--main-border); padding-bottom: 0.4rem; }
  .article-body h3 { font-size: 1.1rem; }
 
  .article-body p { margin: 0 0 1.2rem; }
 
  .article-body a { color: #8b6914; text-decoration: underline; text-underline-offset: 3px; }
  .article-body a:hover { color: var(--accent); }
 
  .article-body code {
    font-family: var(--mono);
    font-size: 0.85em;
    background: #f0ece5;
    padding: 0.15em 0.4em;
    border-radius: 3px;
    color: #5c3d2e;
  }
 
  .article-body pre {
    background: #1a1a1a;
    border-radius: 6px;
    padding: 1.25rem 1.5rem;
    overflow-x: auto;
    margin: 1.5rem 0;
  }
  .article-body pre code {
    background: none;
    color: #d4c5a9;
    font-size: 0.85rem;
    padding: 0;
  }
 
  .article-body blockquote {
    border-left: 3px solid var(--accent);
    margin: 1.5rem 0;
    padding: 0.5rem 1.25rem;
    background: var(--accent-dim);
    border-radius: 0 4px 4px 0;
  }
  .article-body blockquote p { margin: 0; font-style: italic; color: #5c4a2a; }
 
  .article-body ul, .article-body ol {
    padding-left: 1.5rem;
    margin: 0 0 1.2rem;
  }
  .article-body li { margin-bottom: 0.35rem; }
 
  .article-body table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    font-family: var(--sans);
    font-size: 0.9rem;
  }
  .article-body th {
    background: #f0ece5;
    font-weight: 500;
    padding: 0.6rem 1rem;
    text-align: left;
    border-bottom: 2px solid var(--main-border);
  }
  .article-body td {
    padding: 0.6rem 1rem;
    border-bottom: 1px solid var(--main-border);
  }
 
  .article-body hr {
    border: none;
    border-top: 1px solid var(--main-border);
    margin: 2rem 0;
  }
 
  /* ── Editor ── */
  .article-editor {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
 
  .editor-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.5rem;
    border-bottom: 1px solid var(--main-border);
    background: #fff;
    position: sticky;
    top: 0;
    z-index: 10;
  }
 
  .editor-tabs {
    display: flex;
    gap: 0;
    background: #f0ece5;
    border-radius: 5px;
    padding: 2px;
  }
 
  .editor-tab {
    font-family: var(--mono);
    font-size: 0.7rem;
    letter-spacing: 0.05em;
    padding: 0.3rem 0.75rem;
    border: none;
    background: none;
    color: var(--muted);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .editor-tab.active {
    background: #fff;
    color: var(--main-text);
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
 
  .editor-actions { display: flex; gap: 0.5rem; }
 
  .cancel-btn {
    background: #fff;
    border-color: var(--main-border);
    color: var(--muted);
  }
  .cancel-btn:hover { color: var(--main-text); border-color: #bbb; }
 
  .save-btn {
    background: var(--main-text);
    border-color: var(--main-text);
    color: #fff;
  }
  .save-btn:hover { background: #333; }
  .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
 
  .editor-error {
    background: #fdf0f0;
    border-bottom: 1px solid #f5c6c6;
    color: #c0392b;
    font-family: var(--mono);
    font-size: 0.75rem;
    padding: 0.6rem 1.5rem;
  }
 
  .editor-title-input {
    font-family: var(--serif);
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--main-text);
    border: none;
    outline: none;
    padding: 1.5rem 2.5rem 0.75rem;
    background: var(--main-bg);
    width: 100%;
    box-sizing: border-box;
  }
  .editor-title-input::placeholder { color: #ccc; }
 
  .editor-textarea {
    flex: 1;
    min-height: 500px;
    font-family: var(--mono);
    font-size: 0.9rem;
    line-height: 1.75;
    color: var(--main-text);
    background: var(--main-bg);
    border: none;
    outline: none;
    padding: 1rem 2.5rem 1.5rem;
    resize: none;
    width: 100%;
    box-sizing: border-box;
  }
 
  .editor-preview {
    padding: 0.5rem 2.5rem 3rem;
    min-height: 400px;
  }
 
  .preview-empty {
    color: #bbb;
    font-family: var(--sans);
    font-style: italic;
    font-size: 0.9rem;
  }
 
  .editor-hint {
    padding: 0.5rem 2.5rem;
    font-family: var(--mono);
    font-size: 0.65rem;
    color: #bbb;
    background: var(--main-bg);
    border-top: 1px solid var(--main-border);
  }
 
  /* ── Loading / Error ── */
  .knowledge-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60vh;
  }
 
  .loading-dots {
    display: flex;
    gap: 6px;
  }
  .loading-dots span {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--accent, #c9a96e);
    animation: bounce 1.2s infinite;
  }
  .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
 
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-8px); opacity: 1; }
  }
 
  .knowledge-error {
    padding: 2rem;
    color: #c0392b;
    font-family: var(--mono);
    font-size: 0.85rem;
  }
`;

export default KnowledgePage;