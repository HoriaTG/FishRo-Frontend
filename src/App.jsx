import { useEffect, useState } from "react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/products")
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch(() =>
        setError("Nu pot încărca produsele. Verifică backend-ul sau CORS.")
      );
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "Arial" }}>
      <h1>FishRo – Produse</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {products.length === 0 && !error ? (
        <p>Nu există produse încă.</p>
      ) : (
        <ul>
          {products.map((p) => (
            <li key={p.id}>
              <b>{p.name}</b> — {p.category} — {p.price} RON
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
