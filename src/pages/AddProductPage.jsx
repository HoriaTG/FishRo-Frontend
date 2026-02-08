import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../api";

export default function AddProductPage({ me }) {
  const navigate = useNavigate();

  // ✅ HOOKS sus, mereu
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(1);

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

    const cleanCode = code.trim();
    const cleanName = name.trim();
    const cleanCategory = category.trim();

    if (!cleanCode) return setError("Codul este obligatoriu.");
    if (!/^\d+$/.test(cleanCode)) return setError("Codul trebuie să conțină doar cifre.");
    if (!cleanName) return setError("Numele este obligatoriu.");
    if (!cleanCategory) return setError("Categoria este obligatorie.");

    const p = Number(price);
    if (!Number.isFinite(p) || p <= 0) return setError("Preț invalid.");

    const q = Number(quantity);
    if (!Number.isFinite(q) || q < 1) return setError("Cantitate invalidă (minim 1).");

    try {
      await createProduct({
        code: cleanCode,
        name: cleanName,
        category: cleanCategory,
        price: p,
        quantity: q,
      });

      setCode("");
      setName("");
      setCategory("");
      setPrice("");
      setQuantity(1);
      setMsg("Produs adăugat / stoc actualizat ✅");
    } catch (err) {
      setError(err.message || "Eroare la adăugare produs.");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: "0 auto" }}>
      <h2>Adaugă produs</h2>

      <form onSubmit={handleSubmit} style={card}>
        <input
          style={input}
          placeholder="Cod produs (numeric)"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} // doar cifre
        />

        <input
          style={input}
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          style={input}
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          style={input}
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          style={input}
          type="number"
          min={1}
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value || "1", 10))}
        />

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
