/**
 *  Finance API - transactions, categories and CSV Import
 */

export async function fetchTransactions(authFetch, { categoryId, transactionType, limit = 500, offset = 0 } = {}) {
    const params = new URLSearchParams();
    if (categoryId != null) params.set("category_id", categoryId);
    if (transactionType != null) params.set("transaction_type", transactionType)
    params.set("limit", limit);
    params.set("offset", offset);
    
    const res = await authFetch(`/api/finance/transactions?${params}`);
    if (!res.ok) throw new Error("Failed to fetch Transactions");
    return res.json();
}

export async function updateTransactionCategory(id, categoryId, authFetch) {
    const res = await authFetch(`/api/finance/transactions/${id}/category`, {
        method: "PUT",
        body: JSON.stringify({ category_id: categoryId}),
    });
    if (!res.ok) throw new Error("Failed to update Category")
    return res.json()
}

export async function fetchCategories(authFetch) {
    const res = await authFetch("/api/finance/categories")
    if (!res.ok) throw new Error("Failed to fetch Categories")
    return res.json()
}

export async function importCsv(file, authFetch) {
    const formData = new FormData();
    formData.append("file", file)

    //authFetch automatically sets Content-Type for json, per default
    //for usage with multipart for browser to set the boundary autmatically

    const token = localStorage.getItem("token")
    const res = await fetch("/api/finance/import",{
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? "Import Failed");
    }
    return res.json()
}

export async function seedCategories(authFetch) {
    const res = await authFetch("/api/finance/categories/seed", {method: "POST"});
    if (!res.ok) throw new Error("Failed to seed categories!");
}