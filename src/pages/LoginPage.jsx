import { useState } from "react";
import { loginUser, saveToken } from "../api";
import { useNavigate } from "react-router-dom";

export default function LoginPage({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser({ email, password });
      saveToken(data.access_token);
      setEmail("");
      setPassword("");
      await onLoggedIn();       // încarcă /auth/me
      navigate("/");            // du-te pe home
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={styles.page}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={styles.card}>
        <input style={styles.input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={styles.input} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button style={styles.btn} type="submit">Login</button>
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
