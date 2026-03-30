import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query"
import {useAuthApi} from "../../users/hooks/useAuthApi"
import {
    fetchArticles,
    fetchArticleById,
    createArticle,
    updateArticleById,
    deleteArticleById,
} from "../api/knowledgeApi"

export function useArticles() {
    const {authFetch} = useAuthApi();
    return useQuery({
        queryKey: ["articles"],
        queryFn: () => fetchArticles(authFetch)
    })
}

export function useArticle(id) {
    const {authFetch} = useAuthApi();
    return useQuery({
        queryKey: ["articles", id],
        queryFn: () => fetchArticleById(authFetch),
        enabled: !!id,
    })
}

export function useCreateArticle() {
    const { authFetch } = useAuthApi();
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (article) => createArticle(article, authFetch),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["articles"] }),
    });
}

export function useUpdateArticle() {
    const { authFetch } = useAuthApi();
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, article }) => updateArticleById(id, article, authFetch),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["articles"] });
            queryClient.invalidateQueries({ queryKey: ["articles", id] });
        }    
    })
}

export function useDeleteArticle() {
    const { authFetch } = useAuthApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id) => deleteArticleById(id, authFetch),
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["articles"]})
    })
}