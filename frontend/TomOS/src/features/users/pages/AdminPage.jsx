import { useUsers } from "../hooks/useUsers"
import { useDeleteUsers } from "../hooks/useDelete"
import { useUpdateUser } from "../hooks/useUpdate"
import UserList from "../components/UserList"


/**
 * Admin management page.
 *
 * Displays the users list and exposes role update & delete actions.
 */
function AdminPage() {

    const {data: users, isPending, isError, error} = useUsers()
    const {mutateAsync: updateUser} = useUpdateUser()
    const {mutateAsync: deleteUser} = useDeleteUsers()

    const handleUpdate = async (user, value) => {
        try {
            await updateUser({
                id: user.id,
                updatedUser: {
                    user_role: value
                }
            })
        } catch(err) {
            console.error("Failed to updateu user:", err)
        }
    }

    const handleDelete = async (user) => {
        try {
            await deleteUser({id: user.id})
        } catch (err) {
            console.error("Error deleting user:", err)
        }
    }
    
    if (isPending) {
        return <div>Loading ....</div>
    }

    if (isError) {
        return <div>Error: {error.message}</div>
    }
    
    return(
        <div>
            <UserList 
                users={users}
                onUpdateRole={handleUpdate}
                onDelete={handleDelete}
            />
        </div>
    )
}

export default AdminPage