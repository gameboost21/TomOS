import { BrowserRouter, Routes, Route } from "react-router-dom";
import TaskPage from "./pages/TaskPage";
import Navbar from "./components/Navbar";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>

        <div className="min-h-screen bg-gray-100">
          <Navbar />

          <main className="max-w-6xl mx-auto px-6 py-8">
            <Routes>
              <Route path="/" element={<div>Home</div>} />
              <Route path="/tasks" element={<TaskPage />} />
            </Routes>
          </main>
        </div>

      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;