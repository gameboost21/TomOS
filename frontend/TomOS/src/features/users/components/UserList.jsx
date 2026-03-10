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

const ROLE_STYLES = {
    admin: "bg-red-100 text-red-700 border-red-200",
    moderator: "bg-blue-100 text-blue-700 border-blue-200",
    super_user: "bg-purple-100 text-purple-700 border-purple-200",
    viewer: "bg-gray-100 text-gray-600 border-gray-200",
}

const ROLES = ["viewer", "super_user", "moderator", "admin"]

function UserList({ users, onUpdateRole, onDelete }) {
    if (!users.length) return null

    const handleDeleteClick = (user) => {
        if (window.confirm(`Delete User "${user.username}"? This cannot be undone`)) {
            onDelete(user)
        }
    }

    return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="grid grid-cols-12 gap-4 px-4 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
        <span className="col-span-3">Username</span>
        <span className="col-span-4">Email</span>
        <span className="col-span-2">Current Role</span>
        <span className="col-span-2">Change Role</span>
        <span className="col-span-1"></span>
      </div>

      {users.map((user) => (
        <div
          key={user.id}
          className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Username */}
          <div className="col-span-3">
            <span className="font-medium text-gray-900">{user.username}</span>
          </div>

          {/* Email */}
          <div className="col-span-4 text-sm text-gray-500 truncate">
            {user.email}
          </div>

          {/* Role badge */}
          <div className="col-span-2">
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${
                ROLE_STYLES[user.role] ?? ROLE_STYLES.viewer
              }`}
            >
              {user.role}
            </span>
          </div>

          {/* Role selector */}
          <div className="col-span-2">
            <select
              value={user.role}
              onChange={(e) => onUpdateRole(user, e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Delete */}
          <div className="col-span-1 flex justify-end">
            <button
              onClick={() => handleDeleteClick(user)}
              title="Delete user"
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

    

export default UserList