import { useEffect, useState } from "react";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";
import { getToken, logout, getMe, getProducts, createProduct } from "./api";

export default function App() {
  const [token, setToken] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  const [me, setMe] = useState(null);
  const [meError, setMeError] = useState("");

  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState("");

  // form pentru produs (demo)
  const [pName, setPName] = useState("");
  const [pCategory, setPCategory] = useState("");
  const [pPrice, setPPrice] = useState("");

  useEffect(() => {
    setToken(getToken());
    loadProducts();
  }, []);

  async function loadProducts() {
    setProductsError("");
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setProductsError(err.message);
    }
  }

  function handleLogout() {
    logout();
    setToken(null);
    setMe(null);
    setMeError("");
    setResetKey((k) => k + 1);
  }

async function handleWhoAmI() {
  // dacă e deja afișat, îl ascundem
  if (me) {
    setMe(null);
    setMeError("");
    return;
  }

  // altfel îl încărcăm
  setMeError("");
  try {
    const data = await getMe();
    setMe(data);
  } catch (err) {
    setMe(null);
    setMeError(err.message);
  }
}


  async function handleCreateProduct(e) {
    e.preventDefault();
    setProductsError("");

    try {
      const created = await createProduct({
        name: pName,
        category: pCategory,
        price: Number(pPrice),
      });

      setPName("");
      setPCategory("");
      setPPrice("");

      // reîncărcăm lista
      await loadProducts();
    } catch (err) {
      setProductsError(err.message);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "Arial" }}>
      <h1>FishRo</h1>

      <div style={{ marginBottom: 16 }}>
        <b>Status:</b> {token ? "Logged in ✅" : "Not logged in ❌"}

        {token && (
          <>
            <button style={{ marginLeft: 12 }} onClick={handleLogout}>
              Logout
            </button>
            <button style={{ marginLeft: 12 }} onClick={handleWhoAmI}>
              Contul meu
            </button>
          </>
        )}
      </div>

      {me && (
        <p style={{ marginTop: 0 }}>
          <b>Current user:</b> {me.username} ({me.email})
        </p>
      )}
      {meError && <p style={{ color: "salmon" }}>{meError}</p>}

      <div style={{ display: "grid", gap: 16, maxWidth: 520 }}>
        <RegisterForm resetKey={resetKey} />
        <LoginForm
          resetKey={resetKey}
          onLogin={() => {
            setToken(getToken());
            setResetKey((k) => k + 1); // curăță mesajele după login
          }}
        />

        <div style={{ border: "1px solid #444", padding: 16, borderRadius: 8 }}>
          <h2>Products</h2>

          <button onClick={loadProducts}>Refresh products</button>

          {productsError && <p style={{ color: "salmon" }}>{productsError}</p>}

          <ul>
            {products.map((p) => (
              <li key={p.id}>
                {p.name} — {p.category} — {p.price}
              </li>
            ))}
          </ul>

          <h3>Create product (needs login)</h3>
          <form onSubmit={handleCreateProduct} style={{ display: "grid", gap: 8 }}>
            <input placeholder="Name" value={pName} onChange={(e) => setPName(e.target.value)} />
            <input placeholder="Category" value={pCategory} onChange={(e) => setPCategory(e.target.value)} />
            <input placeholder="Price" value={pPrice} onChange={(e) => setPPrice(e.target.value)} />
            <button type="submit">Create</button>
          </form>

          {!token && (
            <p style={{ color: "#bbb" }}>
              (Trebuie să fii logat ca să creezi produs – altfel primești 401)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
