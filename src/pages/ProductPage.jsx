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

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError("");
        const data = await getProductById(id);
        if (cancelled) return;

        setProduct(data);

        const base = `/images/products/${data.code}.jpg`;
        const candidates = [base];
        for (let i = 1; i <= 6; i++) {
          candidates.push(`/images/products/${data.code}_${i}.jpg`);
        }

        const checks = await Promise.all(candidates.map(loadImage));
        const existing = candidates.filter((_, i) => checks[i]);
        const safe = existing.length ? existing : ["/images/products/placeholder.jpg"];

        setImages(safe);
        setIdx(0);
        setZoomed(false);
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

    const cx = Math.max(0, Math.min(100, x));
    const cy = Math.max(0, Math.min(100, y));

    setOrigin({ x: cx, y: cy });
  }

  function handleImageClick(e) {
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

  // ✅ Tech details din backend (JSON string)
  const tech = useMemo(() => {
    if (!product?.tech_details) return [];
    try {
      const parsed = JSON.parse(product.tech_details);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [product?.tech_details]);

  if (error)
    return (
      <div className="product-wrap">
        <p className="err">{error}</p>
      </div>
    );

  if (!product)
    return (
      <div className="product-wrap">
        <p>Loading...</p>
      </div>
    );

  const atStart = idx === 0;
  const atEnd = idx === images.length - 1;

  const descriptionText = product.description || "Descriere indisponibilă momentan.";
  const videoUrl = product.video_url || "https://www.youtube.com/embed/5Oe6b7d7K2M";
  const techRows = tech.length ? tech : [["-", "-"]];

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
                  className={`dot ${i === idx ? "active" : ""}`}
                  onClick={() => {
                    setZoomed(false);
                    setIdx(i);
                  }}
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
              className={`stock ${
                product.quantity === 0 ? "out" : product.quantity <= 3 ? "low" : "ok"
              }`}
              data-tooltip={product.quantity > 0 ? `${product.quantity} produse rămase` : undefined}
            >
              {product.quantity === 0
                ? "Stoc epuizat"
                : product.quantity <= 3
                ? "Stoc limitat"
                : "În stoc"}
            </div>
          </div>

          <button className="addBtn" disabled={product.quantity === 0}>
            Adaugă în coș
          </button>
        </div>
      </div>

      {/* Descriere */}
      <div className="card below">
        <h2>Descriere</h2>
        <p className="desc">{descriptionText}</p>
      </div>

      {/* Tabel tehnic */}
      <div className="card below">
        <h2>Detalii tehnice</h2>
        <table className="techTable">
          <tbody>
            {techRows.map(([k, v], i) => (
              <tr key={`${k}-${i}`}>
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
            src={videoUrl}
            title="Product video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
