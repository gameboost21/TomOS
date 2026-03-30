/**
 * Knowledge base API functions.
 * All functions accept an `authFetch` wrapper for authenticated requests.
 */

export async function fetchArticles(authFetch) {
    const res = await authFetch("/api/knowledge");
    if (!res.ok) throw new Error("Failed to fetch articles");
    return res.json();
}

export async function fetchArticleById(id, authFetch) {
    const res = await authFetch(`api/knowledge/${id}`);
    if (!res.ok) throw new Error("Failed to fetch article");
    return res.json();
}

export async function createArticle(article, authFetch) {
    const res = await authFetch("/api/knowledge", {
        method: "POST",
        body: JSON.stringify(article)
    });
    if (!res.ok) throw new Error("Failed to create Article");
    return res.json()
}

export async function updateArticleById(id, article, authFetch) {
    const res = await authFetch(`/api/knowledge/${id}`, {
        method: "PUT",
        body: JSON.stringify(article)
    })
    if (!res.ok) throw new Error("Failed to update article")
    return res.json()
}

export async function deleteArticleById(id, authFetch) {
    const res = await authFetch(`/api/knowledge/${id}`, {
        method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete article")
    return res.json()
}

export async function fetchCategories(authFetch) {
    const res = await authFetch("/api/knowledge/categories")
    if (!res.ok) throw new Error("Failed to fetch categories")
    return res.json()
}