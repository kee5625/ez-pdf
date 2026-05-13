export default function Home({ onSelect }) {
  return (
    <div className="container">
      <div className="header">
        <div className="logo">⬡</div>
        <h1>EZ-pdf</h1>
        <p className="subtitle">Fully Offline PDF Editor</p>
      </div>

      <div className="home-grid">
        <button className="home-card" onClick={() => onSelect("merge")}>
          <span className="home-card-icon">⊕</span>
          <span className="home-card-title">Merge PDFs</span>
          <span className="home-card-desc">Combine multiple PDFs into one file</span>
        </button>

        <button className="home-card" onClick={() => onSelect("split")}>
          <span className="home-card-icon">✂</span>
          <span className="home-card-title">Split PDF</span>
          <span className="home-card-desc">Extract specific pages from a PDF</span>
        </button>
      </div>
    </div>
  );
}
