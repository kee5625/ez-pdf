import { Shield, Combine, Scissors, Download, MonitorDown, ExternalLink } from "lucide-react";
import "./App.css";

const GITHUB_URL = "https://github.com/kee5625/ez-pdf";
const DOWNLOAD_URL = "https://github.com/kee5625/ez-pdf/releases/download/v1.0.0/PDF.Merger_0.1.0_x64-setup.exe";

const screenshots = [
  { src: "/home.png",        caption: "Home screen"                     },
  { src: "/merge.png",       caption: "Merge multiple PDFs"             },
  { src: "/split-range.png", caption: "Split by page range"             },
  { src: "/split-pages.png", caption: "Select individual pages"         },
];

const features = [
  {
    icon: <Shield size={28} />,
    title: "Fully Offline",
    desc: "Your files stay on your machine. Nothing is uploaded anywhere, ever.",
  },
  {
    icon: <Combine size={28} />,
    title: "Merge PDFs",
    desc: "Select multiple PDFs and combine them into a single file in seconds.",
  },
  {
    icon: <Scissors size={28} />,
    title: "Split PDF",
    desc: "Pull out specific pages using a range or by selecting them individually.",
  },
];

export default function App() {
  return (
    <div className="page">

      <nav className="nav">
        <span className="nav-logo">⬡ EZ-PDF</span>
        <div className="nav-links">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="nav-link">
            <ExternalLink size={15} /> GitHub
          </a>
          <a href={DOWNLOAD_URL} className="btn-nav-dl">
            <MonitorDown size={15} /> Download
          </a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-text">
          <h1>PDF tools that<br /><span className="accent">work offline</span></h1>
          <p className="hero-sub">
            Merge and split PDFs without uploading anything.
            No account required. No subscription. Just install and use it.
          </p>
          <div className="hero-ctas">
            <a href={DOWNLOAD_URL} className="btn-primary-lg">
              <MonitorDown size={18} /> Download for Windows
            </a>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn-ghost-lg">
              <ExternalLink size={15} /> View source
            </a>
          </div>
          <p className="hero-meta">Free forever · Windows 10/11 · v1.0.0</p>
        </div>
        <div className="hero-screenshot">
          <img src="/home.png" alt="EZ-PDF home screen" className="hero-img" />
        </div>
      </section>

      <section className="features">
        <h2 className="section-title">Built to do two things well</h2>
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

      <section className="screenshots">
        <h2 className="section-title">What it looks like</h2>
        <p className="section-sub">Simple & Lightweight.</p>
        <div className="screenshots-grid">
          {screenshots.map((s) => (
            <div key={s.src} className="screenshot-card">
              <img src={s.src} alt={s.caption} className="screenshot-img" />
              <p className="screenshot-caption">{s.caption}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-box">
          <h2>Give it a try</h2>
          <a href={DOWNLOAD_URL} className="btn-primary-lg">
            <Download size={18} /> Download EZ-PDF
          </a>
          <p className="cta-meta">
            Windows 10/11 · ~20 MB ·{" "}
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="link">MIT License</a>
          </p>
        </div>
      </section>

      <footer className="footer">
        <span>EZ-PDF</span>
        <span>Built by Karthik Rachamolla</span>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="link">
          <ExternalLink size={14} /> kee5625/ez-pdf
        </a>
      </footer>

    </div>
  );
}
