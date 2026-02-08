import { useEffect, useState } from "react";
import { getProducts } from "../api";
import "./HomePage.css";

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

  // ✅ badge helpers
  const getStockClass = (qty) => {
    if (qty === 0) return "stock-out";
    if (qty <= 3) return "stock-low";
    return "stock-ok";
  };

  const getStockText = (qty) => {
    if (qty === 0) return "Stoc epuizat";
    if (qty <= 3) return "Stoc limitat";
    return "În stoc";
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setError("");
      try {
        const data = await getProducts();
        if (!cancelled) setProducts(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h2>Produse</h2>

      <button onClick={load} style={btn}>
        Refresh
      </button>

      {error && <p style={{ color: "salmon" }}>{error}</p>}

      <div className="products-grid">
        {products.map((p) => (
          <div key={p.id} className="product-card">
            <span className={`stock-badge ${getStockClass(p.quantity)}`}>
              {getStockText(p.quantity)}
            </span>

            <img
              src={`/images/products/${p.code}.jpg`}
              alt={p.name}
              onError={(e) => {
                e.currentTarget.src = "/images/products/placeholder.jpg";
              }}
            />

            <h3>{p.name}</h3>

            <p className="product-price">{p.price} lei</p>

            <p className="product-stock">Stoc: {p.quantity}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const btn = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #555",
  background: "transparent",
  color: "white",
  cursor: "pointer",
};
