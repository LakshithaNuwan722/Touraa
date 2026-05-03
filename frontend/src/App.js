import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "components/ui/sonner";
import "App.css";

// Pages
import HomePage from "pages/HomePage";
import CarsPage from "pages/CarsPage";
import CarDetailPage from "pages/CarDetailPage";
import PackagesPage from "pages/PackagesPage";
import ContactPage from "pages/ContactPage";
import AuthPage from "pages/AuthPage";
import DashboardPage from "pages/DashboardPage";
import AdminPage from "pages/AdminPage";
import GalleryPage from "pages/GalleryPage";

// Components
import { Navbar } from "components/Navbar";
import { Footer } from "components/Footer";
import { AuthProvider } from "context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cars" element={<CarsPage />} />
              <Route path="/cars/:id" element={<CarDetailPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin/*" element={<AdminPage />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" richColors />
        </div>
        <div className="grain-overlay" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
