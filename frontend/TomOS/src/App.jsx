import { BrowserRouter, Routes, Route } from "react-router-dom";
import TaskPage from "./features/tasks/pages/TaskPage";
import Navbar from "./features/tasks/components/Navbar";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { AuthProvider } from "./features/users/context/AuthContext";
import LoginPage from "./features/users/pages/LoginPage";
import RegisterPage from "./features/users/pages/RegisterPage";
import ProtectedRoute from "./features/users/routes/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-gray-100">
            <Navbar />

            <main className="max-w-6xl mx-auto px-6 py-8">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/tasks" element={
                  <ProtectedRoute>
                    <TaskPage />
                  </ProtectedRoute>
                }
              />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;