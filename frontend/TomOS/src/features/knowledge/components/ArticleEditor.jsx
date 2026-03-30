import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const EMPTY_FORM = {title: "", body: "", category_id: null, tags: [] };

function ArticleEditor({ article, onSave, onCancel, isSaving = false }) {
    const [form, setForm] = useState(EMPTY_FORM)
    const [preview, setPreview] = useState(false)
    const [vaildationError, setValidationError] = useState("")

    useEffect(() => {
        if (article) {
            setForm({
                title: article.title ?? "",
                body: article.body ?? "",
                category_id: article.category_id ?? null,
                tags: article.tags?.map((t) => t.id) ?? [],
            })
        } else {
            setForm(EMPTY_FORM)
        }
    }, [article]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value}))
    };

    const handleSubmit = () => {
        if (!form.title.trim()) {
            setValidationError("Title ist required!");
            return
        }

        if (!form.body.trim()) {
            setValidationError("Body cannot be empty")
            return
        }
        setValidationError("")
        onSave(form)
    }
    
    return (
    <div className="article-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="editor-tabs">
          <button
            className={`editor-tab ${!preview ? "active" : ""}`}
            onClick={() => setPreview(false)}
          >
            Write
          </button>
          <button
            className={`editor-tab ${preview ? "active" : ""}`}
            onClick={() => setPreview(true)}
          >
            Preview
          </button>
        </div>
 
        <div className="editor-actions">
          <button
            className="action-btn cancel-btn"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="action-btn save-btn"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : article ? "Update" : "Publish"}
          </button>
        </div>
      </div>
 
      {/* Validation error — distinct from server errors shown by KnowledgePage */}
      {validationError && (
        <div className="editor-error">{validationError}</div>
      )}
 
      {/* Title */}
      <input
        className="editor-title-input"
        type="text"
        placeholder="Article title…"
        value={form.title}
        onChange={(e) => handleChange("title", e.target.value)}
      />
 
      {/* Write / Preview */}
      {preview ? (
        <div className="article-body editor-preview">
          {form.body.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.body}</ReactMarkdown>
          ) : (
            <p className="preview-empty">Nothing to preview yet.</p>
          )}
        </div>
      ) : (
        <textarea
          className="editor-textarea"
          placeholder={`Write in Markdown…\n\n# Heading\n\nSome **bold** and *italic* text.\n\n\`\`\`python\nprint("Hello!")\n\`\`\``}
          value={form.body}
          onChange={(e) => handleChange("body", e.target.value)}
          spellCheck={false}
        />
      )}
 
      {!preview && (
        <div className="editor-hint">
          Markdown supported · **bold** · *italic* · # Heading · ```code``` · - list
        </div>
      )}
    </div>
  );

}