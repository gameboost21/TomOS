import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../users/hooks/useAuth"

/* Claude tells me to not use useNavigate here, find out why #*/

function Navbar() {

    const {isAuthenticated, user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout();
        navigate("/login")
    }

    return(
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <h1 className="text-xl font-semibold tracking-tight">
                            Tomos
                        </h1>
                        {/* Navigation Items - Only show when authenticated*/}
                        {isAuthenticated &&(
                            <div className="flex gap-6">
                                <Link className="text-gray-600 hover:text-black transition" to="/tasks">
                                    Tasks
                                </Link>

                                <Link className="text-gray-600 hover:text-black transition" to="/finance">
                                    Finance
                                </Link>

                                <Link className="text-gray-600 hover:text-black transition" to="/knowledge">
                                    Knowledge
                                </Link>
                                {/* Only render Admin link for admin-role users */}
                                {user?.role === "admin" && (
                                    <Link className="text-red-600 hover:text-red-800 font-medium transition" to="/admin">
                                        Admin
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                {/* Right side - Login/Logout or User info */}
                <div>
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                Welcome, {user?.username}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <Link
                                to="/login"
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Register                        
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar
