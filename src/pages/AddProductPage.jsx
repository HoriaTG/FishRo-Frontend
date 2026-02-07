import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../api";

export default function AddProductPage({ me }) {
  const navigate = useNavigate();

  // ✅ HOOKS sus, mereu
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const isAdmin = !!me && me.role === "admin";

  // ✅ Redirect dacă nu e admin
  useEffect(() => {
    if (!isAdmin) {
      navigate("/", { replace: true });
    }
  }, [isAdmin, navigate]);

  // ✅ până se face redirect, nu randăm nimic
  if (!isAdmin) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMsg("");

    try {
      await createProduct({ name, category, price: Number(price) });
      setName("");
      setCategory("");
      setPrice("");
      setMsg("Produs adăugat ✅");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: "0 auto" }}>
      <h2>Adaugă produs</h2>

      <form onSubmit={handleSubmit} style={card}>
        <input style={input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input style={input} placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input style={input} placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <button style={btn} type="submit">Add</button>

        {msg && <p style={{ color: "lightgreen", margin: 0 }}>{msg}</p>}
        {error && <p style={{ color: "salmon", margin: 0 }}>{error}</p>}
      </form>

      <button onClick={() => navigate("/")} style={{ ...btn, marginTop: 12 }}>
        Înapoi la produse
      </button>
    </div>
  );
}

const card = { display: "grid", gap: 10, padding: 16, border: "1px solid #444", borderRadius: 10 };
const input = { padding: 10, borderRadius: 8, border: "1px solid #555", background: "transparent", color: "white" };
const btn = { padding: 10, borderRadius: 8, border: "1px solid #555", background: "transparent", color: "white", cursor: "pointer" };
