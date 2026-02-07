import { useEffect, useState } from "react";
import { getProducts } from "../api";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
      <h2>Produse</h2>
      <button onClick={load} style={btn}>Refresh</button>
      {error && <p style={{ color: "salmon" }}>{error}</p>}
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} — {p.category} — {p.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

const btn = { padding: "8px 12px", borderRadius: 8, border: "1px solid #555", background: "transparent", color: "white", cursor: "pointer" };
