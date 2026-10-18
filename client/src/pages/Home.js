import React, { useEffect, useRef, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './EditorialLanding.css';

const Home = () => {
  const { user } = useContext(AuthContext);
  const containerRef = useRef(null);
  const heroCanvasRef = useRef(null);
  const seasonCanvasRef = useRef(null);
  const railTrackRef = useRef(null);

  const [artifactPhase, setArtifactPhase] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  // Canvas 1: Drifted academic exam particle waves on dark loam ground
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
      const cols = 28;
      const rows = 18;
      const dx = canvas.width / cols;
      const dy = canvas.height / rows;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * dx + Math.sin(time + j * 0.4) * 8;
          const y = j * dy + Math.cos(time + i * 0.3) * 6;
          const alpha = 0.05 + 0.16 * Math.abs(Math.sin(time + i * 0.2 + j * 0.5));
          ctx.strokeStyle = `rgba(239, 73, 60, ${alpha})`;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 16, y + 4);
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

  // Canvas 2: 22 stacked sine-contour lines for Season/Cohort band
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

  const examCards = [
    {
      name: 'FULL-STACK JAVASCRIPT',
      code: 'EXAM-JS-2026',
      time: '45 MINS',
      questions: '30 MCQs',
      subject: 'WEB DEVELOPMENT',
      image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=700&q=80'
    },
    {
      name: 'ALGORITHMS & DATA STRUCTURES',
      code: 'EXAM-DSA-901',
      time: '60 MINS',
      questions: '25 ITEMS',
      subject: 'COMPUTER SCIENCE',
      image: 'https://images.unsplash.com/photo-1516116211227-bbc0429f4b32?auto=format&fit=crop&w=700&q=80'
    },
    {
      name: 'DATABASE INTERNALS & SQL',
      code: 'EXAM-DB-402',
      time: '40 MINS',
      questions: '20 MCQs',
      subject: 'DATA SYSTEMS',
      image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=700&q=80'
    },
    {
      name: 'COMPUTER ARCHITECTURE',
      code: 'EXAM-CS-103',
      time: '50 MINS',
      questions: '35 ITEMS',
      subject: 'HARDWARE & SYSTEMS',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=700&q=80'
    },
    {
      name: 'REACT LIFECYCLE & STATE',
      code: 'EXAM-FE-505',
      time: '30 MINS',
      questions: '20 MCQs',
      subject: 'FRONTEND ENGINEERING',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=700&q=80'
    },
    {
      name: 'NETWORK SECURITY & PROCTORING',
      code: 'EXAM-SEC-808',
      time: '45 MINS',
      questions: '25 ITEMS',
      subject: 'CYBERSECURITY',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=700&q=80'
    },
  ];

  const chapters = [
    { title: 'I. PROCTORED INTEGRITY', body: 'Biometric active browser tracking, fullscreen enforcement, and automated tab-switch tripwires ensure strict academic standards.' },
    { title: 'II. SERVER-SIDE EVALUATION', body: 'Immediate server-side score aggregation with custom negative marking ratios and randomized question sequences.' },
    { title: 'III. AUDITABLE GRADEBOOKS', body: 'Cryptographically timestamped digital result certificates, CSV exports, class percentiles, and instant feedback.' }
  ];

  const faqs = [
    { q: 'HOW DOES REAL-TIME PROCTORING MONITOR CHEATING ATTEMPTS?', a: 'Our engine monitors window focus and DOM visibility changes. Three tab switches trigger instant automatic submission and append audit warnings.' },
    { q: 'CAN INSTRUCTORS GENERATE QUESTIONS WITH AI AUTOMATION?', a: 'Yes. Our integrated AI Question Generator crafts topic-specific single-choice, multiple-correct, and numerical items with rationales.' },
    { q: 'HOW ARE NEGATIVE MARKING PENALTIES CALCULATED?', a: 'Negative marks are configured per question or globally. Inaccurate options decrement points down to zero minimum floor without corrupting exam integrity.' }
  ];

  return (
    <div className="landing-wrap" ref={containerRef}>
      {/* Floating Action Button */}
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
        <span>ONLINE TESTING ACTIVE</span>
        <Link to={user ? "/quizzes" : "/register"} style={{ color: '#fff', textDecoration: 'underline', fontWeight: 700 }}>
          {user ? "TAKE EXAM →" : "REGISTER NOW →"}
        </Link>
      </div>

      {/* STAGE 1: POSTER HERO */}
      <section className="stage-hero">
        <div className="sticky-hero">
          <canvas ref={heroCanvasRef} className="hero-canvas" />
          
          <div className="fallow-mono" style={{ color: 'var(--fallow-cream)', zIndex: 2 }}>
            EXAM PLATFORM / PROCTORED TESTING SYSTEM 2026
          </div>

          <div className="hero-content">
            <h2 className="fallow-display hero-subhead">THE PRECISION ASSESSMENT HOUSE</h2>
            <h1 className="fallow-display hero-brand">EXAMIFY PRO</h1>

            <div style={{
              display: 'flex',
              gap: '16px',
              marginTop: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    style={{
                      background: '#ef493c',
                      color: '#fff',
                      padding: '14px 34px',
                      fontFamily: 'Martian Mono, monospace',
                      fontSize: '12px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      textDecoration: 'none',
                      border: '1.5px solid #171717',
                      boxShadow: '0 8px 24px rgba(239, 73, 60, 0.4)'
                    }}
                  >
                    Open My Dashboard →
                  </Link>
                  <Link
                    to="/quizzes"
                    style={{
                      background: 'transparent',
                      color: '#e7e2d8',
                      padding: '14px 28px',
                      fontFamily: 'Martian Mono, monospace',
                      fontSize: '12px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      border: '1.5px solid rgba(231, 226, 216, 0.4)'
                    }}
                  >
                    Browse Active Quizzes
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    style={{
                      background: '#ef493c',
                      color: '#fff',
                      padding: '14px 32px',
                      fontFamily: 'Martian Mono, monospace',
                      fontSize: '12px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      textDecoration: 'none',
                      border: '1.5px solid #171717',
                      boxShadow: '0 8px 24px rgba(239, 73, 60, 0.4)'
                    }}
                  >
                    Create Account (Register) →
                  </Link>
                  <Link
                    to="/login"
                    style={{
                      background: 'transparent',
                      color: '#e7e2d8',
                      padding: '14px 28px',
                      fontFamily: 'Martian Mono, monospace',
                      fontSize: '12px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      border: '1.5px solid rgba(231, 226, 216, 0.4)'
                    }}
                  >
                    Sign In to Project
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hero-footer-bar fallow-mono">
            <span>280SVH STAGE MOTION</span>
            <span>TIMED & ANTI-CHEAT VERIFIED</span>
            <span>SYSTEM READY</span>
          </div>
        </div>
      </section>

      {/* STAGE 2: CLIP-WIPE MANIFESTO */}
      <section className="stage-manifesto">
        <div className="sticky-manifesto">
          <div className="manifesto-box fallow-display">
            <div className="manifesto-base">
              AN EXAMINATION MUST PROVE ITS INTEGRITY FROM THE FIRST MINUTE TO THE FINAL SCORE.
            </div>
            <div className="manifesto-fill">
              AN EXAMINATION MUST PROVE ITS INTEGRITY FROM THE FIRST MINUTE TO THE FINAL SCORE.
            </div>
          </div>
        </div>
      </section>

      {/* STAGE 3: HORIZONTAL CARD RAIL */}
      <section className="stage-rail">
        <div className="sticky-rail">
          <div className="rail-top-bar">
            <div>
              <div className="fallow-mono" style={{ color: 'var(--fallow-red)', marginBottom: '6px' }}>SECTION III / STANDARDIZED MODULES</div>
              <h2 className="fallow-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
                THE EXAMINATION RAIL
              </h2>
            </div>
            <div className="fallow-mono">[ SCRUB HORIZONTALLY ON VERTICAL SCROLL ]</div>
          </div>

          <div className="rail-track-wrap">
            <div className="rail-track" ref={railTrackRef}>
              {examCards.map((card, i) => (
                <div key={i} className="fallow-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="fallow-mono" style={{ color: 'rgba(23, 23, 23, 0.6)', fontSize: '10px' }}>{card.code}</span>
                    <span className="fallow-mono" style={{ color: 'var(--fallow-red)', fontSize: '10px', fontWeight: 700 }}>{card.time}</span>
                  </div>

                  <div className="card-canvas-media">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="card-media-img"
                      loading="lazy"
                    />
                    <div className="card-media-badge fallow-mono">
                      <span>{card.subject}</span>
                    </div>
                  </div>

                  <div className="card-title-row">
                    <h3 className="fallow-display" style={{ fontSize: '20px', lineHeight: 1.1 }}>{card.name}</h3>
                  </div>

                  <div className="fallow-mono" style={{ fontSize: '10.5px', color: 'rgba(23, 23, 23, 0.65)', borderTop: '1px solid rgba(23, 23, 23, 0.14)', paddingTop: '10px' }}>
                    {card.questions} • TIMED AUTO-SUBMISSION
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
              STAGE IV / THE AUDIT TRAIL
            </div>
            <h2 className="fallow-display" style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', marginBottom: '16px' }}>
              THE PRINTED TRANSCRIPT
            </h2>
            <p style={{ lineHeight: '1.6', color: 'rgba(231, 226, 216, 0.72)', fontSize: '15px' }}>
              Upon test submission, candidate records are sealed into an immutable transcript with negative marking deductions, proctor logs, and grade verification.
            </p>

            <div className="artifact-cues">
              <div className={`artifact-cue-item ${artifactPhase >= 0 ? 'active' : ''}`}>
                <div className="fallow-mono">CUE 01 // CANDIDATE ID & SESSION SEALED</div>
              </div>
              <div className={`artifact-cue-item ${artifactPhase >= 1 ? 'active' : ''}`}>
                <div className="fallow-mono">CUE 02 // ACCURACY EVALUATION COMPLETE</div>
              </div>
              <div className={`artifact-cue-item ${artifactPhase >= 2 ? 'active' : ''}`}>
                <div className="fallow-mono">CUE 03 // ZERO SECURITY FLAGS VERIFIED</div>
              </div>
              <div className={`artifact-cue-item ${artifactPhase >= 3 ? 'active' : ''}`}>
                <div className="fallow-mono" style={{ color: 'var(--fallow-red)' }}>
                  CUE 04 // TRANSCRIPT STAMPED & CERTIFIED
                </div>
              </div>
            </div>
          </div>

          <div className="artifact-paper-col">
            <div className="packet-card">
              <div className="packet-perforation" />

              <div>
                <div className="fallow-mono" style={{ fontSize: '9.5px', marginBottom: '4px' }}>EXAMIFY PROCTORING SYSTEM</div>
                <h3 className="fallow-display" style={{ fontSize: '24px' }}>CERTIFIED GRADE REPORT</h3>
              </div>

              <div style={{
                height: '110px',
                border: '1px solid rgba(23, 23, 23, 0.16)',
                background: '#f2ece0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Martian Mono',
                fontSize: '11px',
                color: '#655e54',
                gap: '4px'
              }}>
                <span>[ CANDIDATE SCORECARD ]</span>
                <span style={{ color: 'var(--fallow-red)', fontWeight: 700 }}>GRADE A+ // 94.5%</span>
              </div>

              <div className="packet-rows fallow-mono">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>AUDIT REF:</span>
                  <span className="packet-val-red">{artifactPhase >= 0 ? 'EXAM-REF/2026' : '------'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>PROCTOR STATUS:</span>
                  <span className="packet-val-red">{artifactPhase >= 1 ? '0 FLAGS // VERIFIED' : 'PENDING'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>EVALUATION:</span>
                  <span>{artifactPhase >= 2 ? 'SERVER AUTHENTICATED' : 'CALCULATING'}</span>
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
              SECTION V / EXAMINATION ARCHITECTURE
            </div>
            <h2 className="fallow-display" style={{ fontSize: 'clamp(32px, 5vw, 64px)' }}>
              THE CORE PROTOCOLS
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

      {/* BENCHMARK LEDGER */}
      <section className="fallow-table-section">
        <div className="fallow-mono" style={{ color: 'var(--fallow-red)' }}>ASSESSMENT DIRECTORY</div>
        <h2 className="fallow-display" style={{ fontSize: '42px', marginTop: '6px' }}>SYSTEM SPECIFICATIONS</h2>

        <table className="fallow-table">
          <thead>
            <tr className="fallow-mono">
              <th>MODULE CODE</th>
              <th>EXAMINATION SPECIFICATION</th>
              <th>MODE</th>
              <th>SECURITY LEVEL</th>
            </tr>
          </thead>
          <tbody>
            {examCards.map((c, i) => (
              <tr key={i} className="fallow-mono">
                <td>{c.code}</td>
                <td>{c.name}</td>
                <td>TIMED AUTOMATION</td>
                <td style={{ color: 'var(--fallow-red)', fontWeight: 700 }}>LEVEL 3 PROCTOR</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* FAQ */}
      <section className="fallow-faq">
        <div className="fallow-mono" style={{ color: 'var(--fallow-red)', marginBottom: '8px' }}>QUESTIONS & PROTOCOLS</div>
        <h2 className="fallow-display" style={{ fontSize: '42px', marginBottom: '28px' }}>EXAMINATION INQUIRY</h2>

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

      {/* FOOTER */}
      <footer className="fallow-footer fallow-mono">
        <div>EXAMIFY PROCTORING & EXAM PLATFORM © 2026 // ALL RIGHTS RESERVED</div>
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

export default Home;
