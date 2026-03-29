import { useNavigate } from 'react-router-dom';
import React, { useEffect, useRef } from 'react';
import '../App.css';

function LandingPage() {
  const navigate = useNavigate();
  const revealRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 100);
        }
      });
    }, { threshold: 0.1 });
    revealRefs.current.forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const goToGame = () => navigate('/game');
  const scrollToHow = () => {
    document.getElementById('how').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing">

      {/* NAVBAR */}
      <nav className="navbar">
        <span className="logo-text">Kizuna</span>
        <button className="nav-btn" onClick={goToGame}>Play Now</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
        <div className="orb orb3"></div>

        <img src="/kizuna-logo.png" alt="Kizuna Logo" className="hero-logo" />

        <span className="hero-tag">Daily brain puzzle</span>
        <h1 className="hero-title">
          <span className="line1">Connect.</span>
          <span className="line2">Think. Win.</span>
        </h1>
        <p className="hero-sub">
          Kizuna is a path-connecting puzzle that trains your brain's
          pattern recognition, spatial reasoning, and focused attention.
        </p>
        <div className="hero-cta">
          <button className="landing-btn-primary" onClick={goToGame}>
            Play Today's Puzzle
          </button>
          <button className="landing-btn-secondary" onClick={scrollToHow}>
            How to play
          </button>
        </div>
      </section>

      {/* HOW TO PLAY */}
      <section className="section" id="how">
        <div ref={addRef} className="reveal section-header">
          <p className="section-label">How to play</p>
          <h2 className="section-title">Simple rules,<br/>deep thinking</h2>
          <p className="section-sub">Master Kizuna in 4 steps.</p>
        </div>
        <div className="steps-grid">
          {[
            { num: '01', icon: '🔢', title: 'Find the numbers', desc: 'Numbers appear on the grid as colored dots. Your path must visit them in order — 1, then 2, then 3...' },
            { num: '02', icon: '〰️', title: 'Draw the path', desc: 'Click on number 1 and drag through every cell. Move horizontally or vertically only — no diagonals.' },
            { num: '03', icon: '🧩', title: 'Fill every cell', desc: 'Every single cell must be covered. The puzzle is only solved when no cell is left empty.' },
            { num: '04', icon: '⚡', title: 'Beat the clock', desc: 'One new puzzle every day. The faster you solve it, the sharper your brain gets.' },
          ].map((step, i) => (
            <div ref={addRef} className="reveal step-card" key={i}>
              <div className="step-num">{step.num}</div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Play CTA after How to play */}
        <div ref={addRef} className="reveal" style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button className="landing-btn-primary" onClick={goToGame}>
            I get it — let me play!
          </button>
        </div>
      </section>

      {/* BRAIN SKILLS */}
      <section className="section">
        <div ref={addRef} className="reveal section-header">
          <p className="section-label">Brain training</p>
          <h2 className="section-title">What Kizuna<br/>trains in you</h2>
          <p className="section-sub">Every puzzle silently exercises multiple cognitive abilities at once.</p>
        </div>
        <div className="skills-grid">
          {[
            { color: '#FF3CAC', title: 'Spatial Reasoning', desc: 'You mentally map paths in 2D space — the same skill architects and engineers rely on.' },
            { color: '#2B86C5', title: 'Pattern Recognition', desc: 'Your brain learns to spot valid paths quickly — a skill that improves across all areas of life.' },
            { color: '#00F5A0', title: 'Working Memory', desc: 'You hold multiple paths in mind simultaneously — strengthening short-term memory capacity.' },
            { color: '#F9A826', title: 'Focused Attention', desc: 'Kizuna demands deep focus — training your brain to block out distractions and stay present.' },
            { color: '#FF3CAC', title: 'Planning Ahead', desc: 'You must think several moves ahead — developing executive function and strategic thinking.' },
            { color: '#784BA0', title: 'Problem Solving', desc: 'When stuck, you backtrack and try new routes — building cognitive flexibility and resilience.' },
          ].map((skill, i) => (
            <div ref={addRef} className="reveal skill-pill" key={i}>
              <div className="skill-dot" style={{ background: skill.color }}></div>
              <h4>{skill.title}</h4>
              <p>{skill.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PSYCHOLOGICAL INSIGHTS */}
      <section className="section">
        <div ref={addRef} className="reveal section-header">
          <p className="section-label">Psychology</p>
          <h2 className="section-title">Why your brain<br/>loves this game</h2>
          <p className="section-sub">Real science behind why puzzle games feel so satisfying.</p>
        </div>
        <div className="psych-cards">
          <div ref={addRef} className="reveal psych-card pink">
            <span className="psych-tag pink-tag">Flow State</span>
            <h3>The perfect challenge</h3>
            <p>Psychologist Mihaly Csikszentmihalyi found that humans feel happiest in a "flow state" — when a task is challenging enough to engage you fully, but not so hard it causes frustration. Kizuna sits right in that sweet spot every day.</p>
          </div>
          <div ref={addRef} className="reveal psych-card blue">
            <span className="psych-tag blue-tag">Dopamine Loop</span>
            <h3>The click of completion</h3>
            <p>Each time you pass through a number, your brain releases a small hit of dopamine — the reward chemical. Filling the final cell triggers a larger release. This is the same neurological loop behind all satisfying completions.</p>
          </div>
          <div ref={addRef} className="reveal psych-card amber">
            <span className="psych-tag amber-tag">Neuroplasticity</span>
            <h3>Your brain actually changes</h3>
            <p>Regular spatial puzzle practice physically changes neural pathways. The hippocampus — your brain's navigation and memory center — grows denser connections with consistent training. Kizuna isn't just fun. It's exercise for your neurons.</p>
          </div>
        </div>

        {/* Play CTA after Psychology */}
        <div ref={addRef} className="reveal" style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button className="landing-btn-primary" onClick={goToGame}>
            Train my brain now
          </button>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cta-section">
        <div ref={addRef} className="reveal">
          <span className="hero-tag">One puzzle. Every day.</span>
          <h2 className="hero-title">
            <span className="line1">Ready to</span>
            <span className="line2">connect?</span>
          </h2>
          <p className="hero-sub" style={{ margin: '0 auto 2.5rem' }}>
            Join thousands of players sharpening their minds one path at a time.
          </p>
          <button
            className="landing-btn-primary"
            style={{ fontSize: '1.1rem', padding: '1rem 2.8rem' }}
            onClick={goToGame}
          >
            Play Kizuna — It's Free
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <span className="logo-text" style={{ fontSize: '1.1rem' }}>Kizuna</span>
        <span>© 2026 Kizuna. Train your mind daily.</span>
      </footer>

    </div>
  );
}

export default LandingPage;