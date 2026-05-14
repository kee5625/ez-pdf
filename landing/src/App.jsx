import { Shield, Combine, Scissors, Download, MonitorDown, ExternalLink, Star } from "lucide-react";
import "./App.css";

const GITHUB_URL = "https://github.com/kee5625/ez-pdf";
// Update to direct .exe link after publishing GitHub release
const DOWNLOAD_URL = "https://github.com/kee5625/ez-pdf/releases/latest/download/ez-pdf-setup.exe";

const screenshots = [
  { src: "screenshots/home.png",        caption: "Clean home screen"               },
  { src: "screenshots/merge.png",       caption: "Merge multiple PDFs at once"     },
  { src: "screenshots/split-range.png", caption: "Split by page range"             },
  { src: "screenshots/split-pages.png", caption: "Pick individual pages to extract"},
];

const features = [
  {
    icon: <Shield size={28} />,
    title: "100% Offline",
    desc: "Your files never leave your machine. No cloud, no server, no tracking. Ever.",
  },
  {
    icon: <Combine size={28} />,
    title: "Merge PDFs",
    desc: "Combine any number of PDFs into one file. Pick files, hit merge, done.",
  },
  {
    icon: <Scissors size={28} />,
    title: "Split PDF",
    desc: "Extract pages by range or pick individual pages. Downloads as a zip.",
  },
];

export default function App() {
  return (
    <div className="page">

      {/* NAV */}
      <nav className="nav">
        <span className="nav-logo">⬡ EZ-PDF</span>
        <div className="nav-links">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="nav-link">
            <ExternalLink size={16} /> GitHub
          </a>
          <a href={DOWNLOAD_URL} className="btn-nav-dl">
            <MonitorDown size={15} /> Download
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <div className="badge">Free &amp; Open Source</div>
          <h1>PDF tools that<br /><span className="accent">stay offline</span></h1>
          <p className="hero-sub">
            Merge and split PDFs without uploading a single byte.
            No accounts. No subscriptions. No nonsense.
          </p>
          <div className="hero-ctas">
            <a href={DOWNLOAD_URL} className="btn-primary-lg">
              <MonitorDown size={18} /> Download for Windows
            </a>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn-ghost-lg">
              <ExternalLink size={16} /> View source
            </a>
          </div>
          <p className="hero-meta">Free forever · Windows 10/11 · v1.0.0</p>
        </div>
        <div className="hero-screenshot">
          {/* Place screenshots/home.png in landing/public/screenshots/ */}
          <img src="screenshots/home.png" alt="EZ-PDF home screen" className="hero-img" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <h2 className="section-title">Everything you need. Nothing you don't.</h2>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SCREENSHOTS */}
      <section className="screenshots">
        <h2 className="section-title">See it in action</h2>
        <p className="section-sub">Simple, focused, fast.</p>
        {/* Add your 4 screenshots to landing/public/screenshots/ named:
            home.png, merge.png, split-range.png, split-pages.png */}
        <div className="screenshots-grid">
          {screenshots.map((s) => (
            <div key={s.src} className="screenshot-card">
              <img src={s.src} alt={s.caption} className="screenshot-img" />
              <p className="screenshot-caption">{s.caption}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-box">
          <h2>Ready to ditch the online PDF tools?</h2>
          <p>One download. Works forever. No internet required after install.</p>
          <a href={DOWNLOAD_URL} className="btn-primary-lg">
            <Download size={18} /> Download EZ-PDF — It's Free
          </a>
          <p className="cta-meta">
            Windows 10/11 · ~30 MB ·{" "}
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="link">MIT License</a>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <span>⬡ EZ-PDF</span>
        <span>Built with Tauri · React · Python</span>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="link">
          <ExternalLink size={14} /> kee5625/ez-pdf
        </a>
      </footer>

    </div>
  );
}
