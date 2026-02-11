import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../api";
import "./ProductPage.css";

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState(""); // "slide-left" | "slide-right"
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 }); // procente


  // (temporar) descriere/tech/video în frontend
  const extra = useMemo(() => {
    const byCode = {
      "000000": {
        description:
          "Undiță telescopică potrivită pentru pescuit recreațional. Construcție ușoară, control bun, ideală pentru ieșiri rapide la apă.",
        tech: [
          ["Lungime", "2.7 m"],
          ["Material", "Carbon compozit"],
          ["Acțiune", "Medium"],
          ["Greutate", "220 g"],
        ],
        video: "https://www.youtube.com/embed/5Oe6b7d7K2M",
      },
      "000001": {
        description:
          "Cârlig clasic pentru monturi simple. Vârf ascuțit, rezistență bună, recomandat pentru pești de talie mică-medie.",
        tech: [
          ["Mărime", "Nr. 6"],
          ["Material", "Oțel carbon"],
          ["Tip vârf", "Barbed"],
          ["Culoare", "Nickel"],
        ],
        video: "https://www.youtube.com/embed/5Oe6b7d7K2M",
      },
      "000002": {
        description:
          "Mulineta spinning pentru lansări line și recuperare constantă. Potrivită pentru începători și intermediar.",
        tech: [
          ["Raport recuperare", "5.2:1"],
          ["Rulmenți", "5+1"],
          ["Capacitate fir", "0.25mm / 180m"],
          ["Greutate", "290 g"],
        ],
        video: "https://www.youtube.com/embed/5Oe6b7d7K2M",
      },
      "000003": {
        description:
          "Scaun pliabil confortabil pentru pescuit/camping. Se pliază ușor și ocupă puțin spațiu la transport.",
        tech: [
          ["Material", "Textil + cadru metalic"],
          ["Greutate max", "120 kg"],
          ["Greutate scaun", "3.2 kg"],
          ["Suport pahar", "Da"],
        ],
        video: "https://www.youtube.com/embed/5Oe6b7d7K2M",
      },
      "000004": {
        description:
          "Cort tip dome pentru 2 persoane. Montaj rapid, ventilație bună, ideal pentru ieșiri scurte la pescuit.",
        tech: [
          ["Capacitate", "2 persoane"],
          ["Sezon", "3 sezoane"],
          ["Impermeabilitate", "2000 mm"],
          ["Greutate", "2.4 kg"],
        ],
        video: "https://www.youtube.com/embed/5Oe6b7d7K2M",
      },
    };

    return byCode;
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError("");
        const data = await getProductById(id);
        if (cancelled) return;

        setProduct(data);

        // build candidate image urls
        const base = `/images/products/${data.code}.jpg`;
        const candidates = [base];
        for (let i = 1; i <= 6; i++) {
          candidates.push(`/images/products/${data.code}_${i}.jpg`);
        }

        const checks = await Promise.all(candidates.map(loadImage));
        const existing = candidates.filter((_, i) => checks[i]);

        // fallback dacă nu există nimic
        const safe = existing.length ? existing : ["/images/products/placeholder.jpg"];

        setImages(safe);
        setIdx(0);
      } catch (e) {
        if (!cancelled) setError(e.message || "Eroare");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function prev() {
    if (!images.length) return;
    if (idx <= 0) return;
    setZoomed(false);
    setAnim("slide-right");
    setIdx((v) => v - 1);
  }

  function next() {
    if (!images.length) return;
    if (idx >= images.length - 1) return;
    setZoomed(false);
    setAnim("slide-left");
    setIdx((v) => v + 1);
  }



function setOriginFromEvent(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  // clamp 0..100
  const cx = Math.max(0, Math.min(100, x));
  const cy = Math.max(0, Math.min(100, y));

  setOrigin({ x: cx, y: cy });
}

function handleImageClick(e) {
  // click pe imagine -> toggle zoom
  // când intri în zoom: setezi origin fix unde ai dat click
  setOriginFromEvent(e);
  setZoomed((z) => !z);
}

function handleImageMove(e) {
  if (!zoomed) return;
  setOriginFromEvent(e);
}







  useEffect(() => {
    if (!anim) return;
    const t = setTimeout(() => setAnim(""), 220);
    return () => clearTimeout(t);
  }, [anim]);

  if (error) return <div className="product-wrap"><p className="err">{error}</p></div>;
  if (!product) return <div className="product-wrap"><p>Loading...</p></div>;

  const meta = extra[product.code] || {
    description: "Descriere indisponibilă momentan.",
    tech: [["-", "-"]],
    video: "https://www.youtube.com/embed/5Oe6b7d7K2M",
  };

  const atStart = idx === 0;
  const atEnd = idx === images.length - 1;

  return (
    <div className="product-wrap">
      <div className="top-grid">
        {/* LEFT: Galerie */}
        <div className="card">
          <div className="gallery">
            <div className="imgStage">
                <img
                key={images[idx]}
                className={`mainImg ${anim} ${zoomed ? "zoomed" : ""}`}
                src={images[idx]}
                alt={product.name}
                style={zoomed ? { transformOrigin: `${origin.x}% ${origin.y}%` } : undefined}
                onClick={handleImageClick}
                onMouseMove={handleImageMove}
                />



              <button
                className={`navArrow left ${atStart ? "disabled" : ""}`}
                onClick={prev}
                disabled={atStart}
                aria-label="Prev image"
              >
                ‹
              </button>

              <button
                className={`navArrow right ${atEnd ? "disabled" : ""}`}
                onClick={next}
                disabled={atEnd}
                aria-label="Next image"
              >
                ›
              </button>
            </div>

            <div className="dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setZoomed(false); setIdx(i); }}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Card produs */}
        <div className="card">
          <h1 className="title">{product.name}</h1>

          <div className="priceRow">
            <div className="price">{product.price} lei</div>
                <div
                className={`stock ${product.quantity === 0 ? "out" : product.quantity <= 3 ? "low" : "ok"}`}
                data-tooltip={product.quantity > 0 ? `${product.quantity} produse rămase` : undefined}
                >
                {product.quantity === 0
                    ? "Stoc epuizat"
                    : product.quantity <= 3
                    ? "Stoc limitat"
                    : "În stoc"}
                </div>

          </div>

          <div className="muted">Cod produs: {product.code}</div>

          <button className="addBtn" disabled={product.quantity === 0}>
            Adaugă în coș
          </button>

        </div>
      </div>

      {/* Descriere */}
      <div className="card below">
        <h2>Descriere</h2>
        <p className="desc">{meta.description}</p>
      </div>

      {/* Tabel tehnic */}
      <div className="card below">
        <h2>Detalii tehnice</h2>
        <table className="techTable">
          <tbody>
            {meta.tech.map(([k, v]) => (
              <tr key={k}>
                <td className="k">{k}</td>
                <td className="v">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Video */}
      <div className="card below">
        <h2>Video</h2>
        <div className="videoWrap">
          <iframe
            src={meta.video}
            title="Product video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
