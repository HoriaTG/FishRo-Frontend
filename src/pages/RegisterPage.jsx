import { useState } from "react";
import { registerUser } from "../api";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMsg("");

    try {
      await registerUser({ username, email, password });
      setUsername(""); setEmail(""); setPassword("");
      setMsg("Cont creat. Acum te poți loga.");
      // opțional: redirect la login
      setTimeout(() => navigate("/login"), 600);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={styles.page}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} style={styles.card}>
        <input style={styles.input} placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input style={styles.input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={styles.input} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button style={styles.btn} type="submit">Create account</button>
        {msg && <p style={{ color: "lightgreen", margin: 0 }}>{msg}</p>}
        {error && <p style={styles.err}>{error}</p>}
      </form>
    </div>
  );
}

const styles = {
  page: { padding: 24, maxWidth: 420, margin: "0 auto" },
  card: { display: "grid", gap: 10, padding: 16, border: "1px solid #444", borderRadius: 10 },
  input: { padding: 10, borderRadius: 8, border: "1px solid #555", background: "transparent", color: "white" },
  btn: { padding: 10, borderRadius: 8, border: "1px solid #555", background: "transparent", color: "white", cursor: "pointer" },
  err: { color: "salmon", margin: 0 },
};
