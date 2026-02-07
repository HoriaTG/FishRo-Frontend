import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AddProductPage from "./pages/AddProductPage";
import { clearToken, getMe, getToken } from "./api";

export default function App() {
  const [me, setMe] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);

  async function refreshMe() {
    try {
      const user = await getMe();
      setMe(user);
    } catch {
      setMe(null);
    }
  }

useEffect(() => {
  let cancelled = false;

  (async () => {
    const token = getToken();
    if (!token) return;

    try {
      const user = await getMe();      // <- asta face fetch /auth/me
      if (!cancelled) setMe(user);
    } catch {
      // token invalid/expirat => îl curățăm
      if (!cancelled) {
        clearToken();
        setMe(null);
        setAccountOpen(false);
      }
    }
  })();

  return () => {
    cancelled = true;
  };
}, []);

  function handleLogout() {
    clearToken();
    setMe(null);
    setAccountOpen(false);
  }

  function toggleAccount() {
    setAccountOpen((v) => !v);
  }

  return (
    <div>
      <Navbar me={me} onLogout={handleLogout} onToggleAccount={toggleAccount} />

      {me && accountOpen && (
        <div style={{ padding: 12, borderBottom: "1px solid #333" }}>
          <b>{me.username}</b> — {me.email} — <i>{me.role}</i>
        </div>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage onLoggedIn={refreshMe} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/products/new" element={<AddProductPage me={me} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
