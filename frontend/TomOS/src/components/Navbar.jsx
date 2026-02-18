import { Link } from "react-router-dom"

function Navbar() {
    return(
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

                <h1 className="text-xl font-semibold tracking-tight">
                    Tomos
                </h1>

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
                </div>
            </div>
        </nav>
    )
}

export default Navbar
