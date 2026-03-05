/**
 * Presentational list of users.
 *
 * Expected props:
 * - `users`: Array of user objects with `id`, `username`, `email`, and `role`.
 * - `onUpdateRole`: Function(userId, newRole) to call when a role is changed.
 * - `onDelete`: Function(userId) to call when deleting a user.
 *
 * Note: This component assumes `onUpdateRole` and `onDelete` are provided by the
 * parent. If they are omitted, the corresponding UI controls will throw.
 */
function UserList({ users, onUpdateRole, onDelete }) {
    if (!users.length) return null

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Users</h2>
            {users.map((user) => (
                <div 
                    key={user.id}
                    className="p-4 bg-white rounded-lg shadow-sm border"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <strong>{user.username}</strong>
                            <div className="text-sm text-gray-600">{user.email}</div>
                            <div className="text-sm">
                                Role:
                                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                    user.role === 'admin' ? 'bg-red-100 text-red-700' :
                                    user.role === 'moderator' ? 'bg-blue-100 text-blue-700' :
                                    user.role === 'super_user' ? 'bg-purple-100 text-purple-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {user.role}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={user.role}
                                onChange={(e) => onUpdateRole(user.id, e.target.value)}
                                className="text-sm border rounded px-2 py-1"
                            >
                                <option value="viewer">Viewer</option>
                                <option value="super_user">Super User</option>
                                <option value="moderator">Moderator</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button
                                onClick={() => onDelete(user.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

    

export default UserList