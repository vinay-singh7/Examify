import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './EditorialLanding.css';

const EditorialLanding = () => {
  const containerRef = useRef(null);
  const heroCanvasRef = useRef(null);
  const seasonCanvasRef = useRef(null);
  const railTrackRef = useRef(null);

  const [artifactPhase, setArtifactPhase] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  // Stagger per-word text helper
  // eslint-disable-next-line no-unused-vars
  const renderStaggerText = (text, baseClass = '', delayOffset = 0) => {
    return text.split(' ').map((word, i) => (
      <span
        key={i}
        className="word-span visible"
        style={{ transitionDelay: `${delayOffset + i * 38}ms`, marginRight: '0.28em' }}
      >
        <span className={baseClass}>{word}</span>
      </span>
    ));
  };

  // Canvas 1: Drifting tilled-soil strokes on sine waves
  useEffect(() => {
    const canvas = heroCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    const draw = () => {
      time += 0.015;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cols = 26;
      const rows = 18;
      const dx = canvas.width / cols;
      const dy = canvas.height / rows;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * dx + Math.sin(time + j * 0.4) * 8;
          const y = j * dy + Math.cos(time + i * 0.3) * 6;
          const alpha = 0.05 + 0.14 * Math.abs(Math.sin(time + i * 0.2 + j * 0.5));
          ctx.strokeStyle = `rgba(239, 73, 60, ${alpha})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 14, y + 5);
          ctx.stroke();
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Canvas 2: 22 stacked contour lines for Season band
  useEffect(() => {
    const canvas = seasonCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    const draw = () => {
      time += 0.012;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const lineCount = 22;
      const step = canvas.height / (lineCount + 2);

      for (let l = 0; l < lineCount; l++) {
        const isRed = l % 5 === 0;
        ctx.strokeStyle = isRed ? '#ef493c' : 'rgba(23, 23, 23, 0.18)';
        ctx.lineWidth = isRed ? 1.5 : 1;
        ctx.beginPath();

        for (let x = 0; x <= canvas.width; x += 15) {
          const y = (l + 1) * step +
            Math.sin(x * 0.005 + time + l * 0.3) * 18 +
            Math.cos(x * 0.002 - time * 0.5) * 8;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // One Scroll Handler writing CSS custom properties to :root
  useEffect(() => {
    const handleScroll = () => {
      const root = document.documentElement;
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // 1. Hero calculation (0 to 180vh)
      const heroMax = 1.8 * vh;
      const heroProgress = Math.min(1, Math.max(0, scrollY / heroMax));
      root.style.setProperty('--hero-type-y', `${-90 * heroProgress}px`);
      root.style.setProperty('--hero-type-scale', `${1 - 0.26 * heroProgress}`);
      root.style.setProperty('--hero-type-alpha', `${1 - heroProgress}`);

      // 2. Manifesto calculation (Stage starts around 280vh)
      const manifestoStart = 2.4 * vh;
      const manifestoLength = 1.8 * vh;
      const manifestoProgress = Math.min(1, Math.max(0, (scrollY - manifestoStart) / manifestoLength));
      root.style.setProperty('--manifesto-wipe', `${manifestoProgress * 100}%`);

      // 3. Rail calculation (Stage starts around 480vh)
      const railStart = 4.4 * vh;
      const railLength = 2.2 * vh;
      const railProgress = Math.min(1, Math.max(0, (scrollY - railStart) / railLength));
      if (railTrackRef.current) {
        const overflowWidth = Math.max(0, railTrackRef.current.scrollWidth - window.innerWidth + 120);
        railTrackRef.current.style.transform = `translateX(${-railProgress * overflowWidth}px)`;
        const meter = document.getElementById('rail-meter-bar');
        if (meter) meter.style.width = `${railProgress * 100}%`;
      }

      // 4. Artifact calculation (Stage starts around 740vh)
      const artStart = 7.0 * vh;
      const artLength = 3.0 * vh;
      const artProgress = Math.min(1, Math.max(0, (scrollY - artStart) / artLength));
      root.style.setProperty('--packet-alpha', `${Math.min(1, artProgress * 2)}`);
      root.style.setProperty('--packet-enter', `${38 - artProgress * 38}px`);
      root.style.setProperty('--packet-scale', `${0.78 + 0.22 * artProgress}`);
      root.style.setProperty('--packet-copy-x', `${-20 * artProgress}px`);
      root.style.setProperty('--packet-cut', `${Math.max(0, (artProgress - 0.75) / 0.25)}`);

      const phase = Math.min(3, Math.floor(artProgress * 4));
      setArtifactPhase(phase);

      // 5. Season Parallax calculation (Stage starts around 1080vh)
      const seasonStart = 10.4 * vh;
      const seasonLength = 2.2 * vh;
      const seasonProgress = Math.min(1, Math.max(0, (scrollY - seasonStart) / seasonLength));
      root.style.setProperty('--season-y', `${-4 + seasonProgress * 8}%`);
      root.style.setProperty('--season-scale', `${1.1 - 0.045 * seasonProgress}`);
      const ch = Math.min(2, Math.floor(seasonProgress * 3));
      setActiveChapter(ch);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cards = [
    { name: 'CALIFORNIA POPPY', mono: 'ESCHSCHOLZIA CALIFORNICA', price: '£3.80', lot: 'LOT-901' },
    { name: 'CHEROKEE PURPLE', mono: 'SOLANUM LYCOPERSICUM', price: '£4.20', lot: 'LOT-902' },
    { name: 'RAINBOW CHARD', mono: 'BETA VULGARIS V. CICLA', price: '£3.60', lot: 'LOT-903' },
    { name: 'SWEET PEA CUPANI', mono: 'LATHYRUS ODORATUS', price: '£4.50', lot: 'LOT-904' },
    { name: 'DANVERS HALF LONG', mono: 'DAUCUS CAROTA', price: '£3.40', lot: 'LOT-905' },
    { name: 'MAMMOTH RUSSIAN', mono: 'HELIANTHUS ANNUUS', price: '£4.00', lot: 'LOT-906' },
  ];

  const chapters = [
    { title: 'I. TILTH & DRAINAGE', body: 'Cold frames open at dawn. The loam breathes before the first direct sun strikes the cold glass.' },
    { title: 'II. COLD STRATIFICATION', body: 'Hard seed-coats fractured by forty days of damp refrigeration mimicking late frost.' },
    { title: 'III. DIRECT SEEDING', body: 'Drawn in shallow drills against a taut stringline, firmed down with the back of an ash rake.' }
  ];

  const faqs = [
    { q: 'WHAT IS THE VIABILITY TESTING FREQUENCY?', a: 'Every accession is hand-counted in sets of one hundred and incubated on unbleached blotter paper under synchronized twelve-hour diurnal cycles.' },
    { q: 'ARE YOUR VARIETIES NON-HYBRID AND TRUE-TO-TYPE?', a: 'Strictly open-pollinated heirlooms with genetic line documentation spanning multiple seasons without synthetic alteration.' },
    { q: 'HOW ARE PACKETS STORED PRIOR TO DISPATCH?', a: 'Stored in zero-humidity dark vaults at a continuous eight degrees Celsius until the date of wax-stamped envelope closure.' }
  ];

  return (
    <div className="landing-wrap" ref={containerRef}>
      {/* Quick Navigation to Quiz App */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        background: '#ef493c',
        color: '#fff',
        padding: '12px 20px',
        border: '1.5px solid #171717',
        fontFamily: 'Martian Mono, monospace',
        fontSize: '11px',
        letterSpacing: '0.14em',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span>EXAM PORTAL ACTIVE</span>
        <Link to="/quizzes" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 700 }}>
          ENTER EXAMS →
        </Link>
      </div>

      {/* STAGE 1: POSTER HERO */}
      <section className="stage-hero">
        <div className="sticky-hero">
          <canvas ref={heroCanvasRef} className="hero-canvas" />
          
          <div className="fallow-mono" style={{ color: 'var(--fallow-cream)', zIndex: 2 }}>
            CATALOGUE NO. 14 / HEIRLOOM SEED HOUSE
          </div>

          <div className="hero-content">
            <h2 className="fallow-display hero-subhead">AN INDEPENDENT REPOSITORY</h2>
            <h1 className="fallow-display hero-brand">FALLOW ROW</h1>
          </div>

          <div className="hero-footer-bar fallow-mono">
            <span>51° 42′ N, 0° 21′ W</span>
            <span>OPEN POLLINATED / UNTREATED SEED</span>
            <span>EDITION OF 2026</span>
          </div>
        </div>
      </section>

      {/* STAGE 2: CLIP-WIPE MANIFESTO */}
      <section className="stage-manifesto">
        <div className="sticky-manifesto">
          <div className="manifesto-box fallow-display">
            <div className="manifesto-base">
              A VARIETY MUST EARN ITS RIGHT TO PASS INTO THE PRINTED PACKET.
            </div>
            <div className="manifesto-fill">
              A VARIETY MUST EARN ITS RIGHT TO PASS INTO THE PRINTED PACKET.
            </div>
          </div>
        </div>
      </section>

      {/* STAGE 3: HORIZONTAL CARD RAIL */}
      <section className="stage-rail">
        <div className="sticky-rail">
          <div className="rail-top-bar">
            <div>
              <div className="fallow-mono" style={{ color: 'var(--fallow-red)', marginBottom: '6px' }}>SECTION III / CURATED STRAINS</div>
              <h2 className="fallow-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
                THE ACCESSION RAIL
              </h2>
            </div>
            <div className="fallow-mono">[ SCRUB HORIZONTALLY ON VERTICAL SCROLL ]</div>
          </div>

          <div className="rail-track-wrap">
            <div className="rail-track" ref={railTrackRef}>
              {cards.map((card, i) => (
                <div key={i} className="fallow-card">
                  <div className="fallow-mono" style={{ color: 'rgba(23, 23, 23, 0.56)' }}>{card.lot}</div>
                  <div className="card-canvas" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#ede8dc',
                    fontFamily: 'Martian Mono, monospace',
                    fontSize: '11px',
                    color: '#71695f'
                  }}>
                    [ PLATE #{i + 1} - EMBOSS ]
                  </div>
                  <div className="card-title-row">
                    <h3 className="fallow-display" style={{ fontSize: '20px' }}>{card.name}</h3>
                    <span className="card-price fallow-mono">{card.price}</span>
                  </div>
                  <div className="fallow-mono" style={{ fontSize: '9px', color: 'rgba(23, 23, 23, 0.6)' }}>
                    {card.mono}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rail-meter">
            <div id="rail-meter-bar" className="rail-meter-fill"></div>
          </div>
        </div>
      </section>

      {/* STAGE 4: THE PRINTED ARTIFACT */}
      <section className="stage-artifact">
        <div className="sticky-artifact">
          <div className="artifact-copy-col">
            <div className="fallow-mono" style={{ color: 'var(--fallow-red)', marginBottom: '8px' }}>
              STAGE IV / THE PROVENANCE
            </div>
            <h2 className="fallow-display" style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', marginBottom: '16px' }}>
              THE PRINTED PACKET
            </h2>
            <p style={{ lineHeight: '1.6', color: 'rgba(231, 226, 216, 0.72)', fontSize: '15px' }}>
              Each packet is letterpress stamped onto heavy off-white sulphite paper. Data points increment live as trials culminate and the packet seals.
            </p>

            <div className="artifact-cues">
              <div className={`artifact-cue-item ${artifactPhase >= 0 ? 'active' : ''}`}>
                <div className="fallow-mono">CUE 01 // LOT IDENTIFIER STAMPED</div>
              </div>
              <div className={`artifact-cue-item ${artifactPhase >= 1 ? 'active' : ''}`}>
                <div className="fallow-mono">CUE 02 // GERMINATION TRIAL VERIFIED</div>
              </div>
              <div className={`artifact-cue-item ${artifactPhase >= 2 ? 'active' : ''}`}>
                <div className="fallow-mono">CUE 03 // DIURNAL SOWING WINDOW RECORDED</div>
              </div>
              <div className={`artifact-cue-item ${artifactPhase >= 3 ? 'active' : ''}`}>
                <div className="fallow-mono" style={{ color: 'var(--fallow-red)' }}>
                  CUE 04 // PERFORATION SEVERED & DISPATCHED
                </div>
              </div>
            </div>
          </div>

          <div className="artifact-paper-col">
            <div className="packet-card">
              <div className="packet-perforation" />

              <div>
                <div className="fallow-mono" style={{ fontSize: '9.5px', marginBottom: '4px' }}>FALLOW ROW SEED MERCHANTS</div>
                <h3 className="fallow-display" style={{ fontSize: '24px' }}>CHEROKEE PURPLE</h3>
              </div>

              <div style={{
                height: '110px',
                border: '1px solid rgba(23, 23, 23, 0.16)',
                background: '#f2ece0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Martian Mono',
                fontSize: '10px',
                color: '#655e54'
              }}>
                [ SEED SPECIMEN EMBOSS ]
              </div>

              <div className="packet-rows fallow-mono">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>LOT NUMBER:</span>
                  <span className="packet-val-red">{artifactPhase >= 0 ? 'LOT-409/A' : '------'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GERMINATION:</span>
                  <span className="packet-val-red">{artifactPhase >= 1 ? '96% TESTED' : 'PENDING'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>SOW WINDOW:</span>
                  <span>{artifactPhase >= 2 ? 'MAR 15 – MAY 01' : 'PENDING'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STAGE 5: PARALLAX SEASON BAND */}
      <section className="stage-season">
        <div className="sticky-season">
          <canvas ref={seasonCanvasRef} className="season-canvas" />

          <div className="season-content">
            <div className="fallow-mono" style={{ color: 'var(--fallow-red)', marginBottom: '8px' }}>
              SECTION V / DIURNAL CYCLES
            </div>
            <h2 className="fallow-display" style={{ fontSize: 'clamp(32px, 5vw, 64px)' }}>
              THE DRIFTING CONTOUR
            </h2>

            <div className="season-chapters">
              {chapters.map((ch, i) => (
                <div
                  key={i}
                  className="season-chapter"
                  style={{ opacity: activeChapter === i ? 1 : 0.28 }}
                >
                  <div className="fallow-mono" style={{ color: activeChapter === i ? 'var(--fallow-red)' : 'inherit', marginBottom: '8px' }}>
                    {ch.title}
                  </div>
                  <p style={{ fontSize: '14.5px', lineHeight: '1.55' }}>{ch.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AFTER THE PINS: RULED PRICE TABLE */}
      <section className="fallow-table-section">
        <div className="fallow-mono" style={{ color: 'var(--fallow-red)' }}>INVENTORY LEDGER</div>
        <h2 className="fallow-display" style={{ fontSize: '42px', marginTop: '6px' }}>OFFICIAL PRICING</h2>

        <table className="fallow-table">
          <thead>
            <tr className="fallow-mono">
              <th>ACCESSION REF</th>
              <th>BOTANICAL SPECIFICATION</th>
              <th>HABIT</th>
              <th>PRICE</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((c, i) => (
              <tr key={i} className="fallow-mono">
                <td>{c.lot}</td>
                <td>{c.name} ({c.mono})</td>
                <td>HEIRLOOM STAND</td>
                <td style={{ color: 'var(--fallow-red)', fontWeight: 700 }}>{c.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* FAQ OF NATIVE DETAILS */}
      <section className="fallow-faq">
        <div className="fallow-mono" style={{ color: 'var(--fallow-red)', marginBottom: '8px' }}>QUERIES & DISPATCH</div>
        <h2 className="fallow-display" style={{ fontSize: '42px', marginBottom: '28px' }}>TECHNICAL INQUIRY</h2>

        {faqs.map((f, i) => (
          <div key={i} className="faq-row" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
            <div className="faq-summary">
              <span className="fallow-mono" style={{ fontSize: '13px', fontWeight: 700 }}>{f.q}</span>
              <span className="fallow-mono">{openFaq === i ? '[-]' : '[+]'}</span>
            </div>
            {openFaq === i && (
              <p className="faq-answer">{f.a}</p>
            )}
          </div>
        ))}
      </section>

      {/* DARK FOOTER */}
      <footer className="fallow-footer fallow-mono">
        <div>FALLOW ROW SEED HOUSE © 2026 // ALL RIGHTS RESERVED</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/quizzes" style={{ color: 'var(--fallow-red)', textDecoration: 'none' }}>
            ENTER EXAM SYSTEM
          </Link>
          <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>
            PORTAL SIGN IN
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default EditorialLanding;
