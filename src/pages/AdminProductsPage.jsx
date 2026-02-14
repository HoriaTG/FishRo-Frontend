import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, updateProduct, deleteProduct } from "../api";

export default function AdminProductsPage({ me }) {
  const navigate = useNavigate();
  const isAdmin = !!me && me.role === "admin";

  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
    tech_details: "",
    video_url: "",
  });
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!isAdmin) navigate("/", { replace: true });
  }, [isAdmin, navigate]);

  async function load({ keepMsg = true } = {}) {
    setErr("");
    if (!keepMsg) setMsg("");
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    if (!isAdmin) return;
    const t = setTimeout(() => load({ keepMsg: true }), 0);
    return () => clearTimeout(t);
  }, [isAdmin]);

  const selected = useMemo(
    () => products.find((p) => String(p.id) === String(selectedId)),
    [products, selectedId]
  );

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSave(e) {
    e.preventDefault();
    if (!selected) return;

    setErr("");
    setMsg("");

    // validare: tech_details trebuie să fie JSON valid dacă nu e gol
    if (form.tech_details?.trim()) {
      try {
        JSON.parse(form.tech_details);
      } catch {
        setErr('tech_details nu este JSON valid. Ex: [["Lungime","2.7 m"]]');
        return;
      }
    }

    const patch = {
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
      description: form.description?.trim() || null,
      tech_details: form.tech_details?.trim() || null,
      video_url: form.video_url?.trim() || null,
    };

    try {
      await updateProduct(selected.id, patch);

      // refresh list (NU resetăm msg aici)
      await load({ keepMsg: true });

      // mesaj de succes după refresh
      setMsg("Produsul a fost editat cu succes ✅");
    } catch (e2) {
      setErr(e2.message);
    }
  }

async function onDelete() {
  if (!selected) return;

  const ok = window.confirm(`Ștergi produsul: ${selected.code} - ${selected.name} ?`);
  if (!ok) return;

  setErr("");
  setMsg("");

  try {
    await deleteProduct(selected.id);

    // reset selecție + form
    setSelectedId("");
    setForm({
      name: "",
      category: "",
      price: "",
      quantity: "",
      description: "",
      tech_details: "",
      video_url: "",
    });

    await load({ keepMsg: true });
    setMsg("Produs șters cu succes ✅");
  } catch (e) {
    setErr(e.message);
  }
}


  if (!isAdmin) return null;

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h2>Admin - Editare produse</h2>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
        <div style={card}>
          <h3>Produse</h3>

          <select
            value={selectedId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedId(id);

              const p = products.find((x) => String(x.id) === String(id));
              if (!p) return;

              setForm({
                name: p.name ?? "",
                category: p.category ?? "",
                price: p.price ?? "",
                quantity: p.quantity ?? "",
                description: p.description ?? "",
                tech_details: p.tech_details ?? "",
                video_url: p.video_url ?? "",
              });

              setMsg("");
              setErr("");
            }}
            style={{ ...input, background: "#1e1e1e", color: "white" }}
          >
            <option value="">-- Alege un produs --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id} style={{ background: "#1e1e1e", color: "#fff" }}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => load({ keepMsg: false })}
            style={{ ...btn, marginTop: 12 }}
          >
            Refresh
          </button>

          {err && <p style={{ color: "salmon", marginTop: 10 }}>{err}</p>}
          {msg && <p style={{ color: "#4ade80", marginTop: 10 }}>{msg}</p>}
        </div>

        <div style={card}>
          <h3>Editare</h3>

          {!selected && <p style={{ opacity: 0.7 }}>Selectează un produs din stânga.</p>}

          {selected && (
            <form onSubmit={onSave}>
              <label style={label}>Name</label>
              <input name="name" value={form.name} onChange={onChange} style={input} />

              <label style={label}>Category</label>
              <input name="category" value={form.category} onChange={onChange} style={input} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <label style={label}>Price</label>
                  <input name="price" value={form.price} onChange={onChange} style={input} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <label style={label}>Quantity</label>
                  <input name="quantity" value={form.quantity} onChange={onChange} style={input} />
                </div>
              </div>

              <label style={label}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                style={{ ...input, height: 110, resize: "vertical" }}
              />

              <label style={label}>Tech details (JSON)</label>
              <textarea
                name="tech_details"
                value={form.tech_details}
                onChange={onChange}
                placeholder='Ex: [["Lungime","2.7 m"],["Material","Carbon"]]'
                style={{ ...input, height: 140, resize: "vertical", fontFamily: "monospace" }}
              />

              <label style={label}>Video URL (embed)</label>
              <input name="video_url" value={form.video_url} onChange={onChange} style={input} />

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button type="submit" style={{ ...btn, flex: 1 }}>
                  Save
                </button>

                <button
                  type="button"
                  onClick={onDelete}
                  style={{ ...btnDanger, flex: 1 }}
                >
                  Delete
                </button>
              </div>

              {/* err/msg sunt afișate în stânga, dar dacă le vrei și aici, poți păstra */}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const card = {
  background: "#1e1e1e",
  borderRadius: 14,
  padding: 14,
  boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
};

const label = {
  display: "block",
  marginTop: 10,
  marginBottom: 6,
  opacity: 0.85,
};

const input = {
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.04)",
  color: "white",
  outline: "none",
};

const btn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(100,108,255,0.18)",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
};

const btnDanger = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(239,68,68,0.18)",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
};
