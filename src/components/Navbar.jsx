import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ me, onLogout, onToggleAccount }) {
  const navigate = useNavigate();

  function handleLogout() {
    onLogout();
    navigate("/");
  }

  return (
    <div style={styles.nav}>
      <Link to="/" style={styles.brand}>FishRo</Link>

      <div style={styles.right}>
        {!me && (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}

        {me && (
          <>
            {me.role === "admin" && (
              <Link to="/admin/products/new" style={styles.button}>
                Adaugă produse
              </Link>
            )}

            {me?.role === "admin" && (
              <Link to="/admin/products" style={styles.button}>
                Actualizează produse
              </Link>
            )}

            <button style={styles.button} onClick={onToggleAccount}>
              Contul meu
            </button>

            <button style={styles.button} onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  nav: {
    width: "100%",                 // ✅ ocupă tot ecranul
    display: "flex",
    justifyContent: "space-between",// ✅ stânga vs dreapta
    alignItems: "center",
    padding: "12px 18px",
    borderBottom: "1px solid #333", // ✅ linia delimitatoare
    boxSizing: "border-box",        // ✅ padding-ul nu “mănâncă” din lățime
  },
  brand: {
    textDecoration: "none",
    color: "white",
    fontWeight: 700,
    fontSize: 18,
  },
  right: {
    marginLeft: "auto",            // ✅ împinge grupul la dreapta
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  link: {
    textDecoration: "none",
    color: "white",
    padding: "6px 10px",
    border: "1px solid #444",
    borderRadius: 6,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #444",
    background: "transparent",
    color: "white",
    cursor: "pointer",
  },
};
