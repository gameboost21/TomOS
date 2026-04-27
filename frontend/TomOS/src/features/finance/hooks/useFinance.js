import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthApi from "../../users/hooks/useAuthApi";
import {
    fetchTransactions,
    fetchCategories,
    updateTransactionCategory,
    importCsv,
    seedCategories
} from "../api/financeApi";

export function useTransactions(filters = {}) {
    const { authFetch } = useAuthApi();

    return useQuery({
        queryKey: ["transactions", filters],
        queryFn: () => fetchTransactions(authFetch),
    });
}

export function useCategories() {
    const { authFetch } = useAuthApi();
    return useQuery({
        queryKey: ["finance-categories"],
        queryFn: () => fetchCategories(authFetch)
    })
}

export function useUpdateCategory() {
    const { authFetch } = useAuthApi();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, categoryId }) => updateTransactionCategory(id, categoryId, authFetch),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
    });
}

export function useBulkUpdateCategory() {
    const { authFetch } = useAuthApi();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ ids, categoryId }) => {
            //ship all updates parallel
            await Promise.all(
                ids.map((id) => updateTransactionCategory(id, categoryId, authFetch))
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
    });
}

export function useImportCsv() {
    const { authFetch } = useAuthApi();
    const queryClient = useQueryClient();
    return useMutation ({
        mutationFn: (file) => importCsv(file, authFetch),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
    });
}

export function useSeedCategories() {
    const authFetch = useAuthApi();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => seedCategories(authFetch),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["finance-categories"] });
        },
    });
}