import React, { useState, useEffect } from 'react';

const QUOTES = [
  { text: "Le corps accomplit ce que l'esprit croit possible.", author: "Napoleon Hill" },
  { text: "Chaque entraînement est un pas de plus vers la meilleure version de toi.", author: "Inconnu" },
  { text: "La douleur est temporaire. La fierté est pour toujours.", author: "Muhammad Ali" },
  { text: "Ce n'est pas une question de talent, c'est une question de travail.", author: "Roger Federer" },
  { text: "Ton corps peut tout faire. C'est ton esprit qu'il faut convaincre.", author: "Inconnu" },
];

const AuthLeft = () => {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex(i => (i + 1) % QUOTES.length);
        setFading(false);
      }, 600);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (i) => {
    if (i === index) return;
    setFading(true);
    setTimeout(() => { setIndex(i); setFading(false); }, 600);
  };

  return (
    <div className="auth-left">
      {/* Decorative SVG grid */}
      <svg className="auth-grid" viewBox="0 0 420 100vh" preserveAspectRatio="none">
        {[60,120,180,240,300,360].map(x => (
          <line key={x} x1={x} y1="0" x2={x} y2="100%" />
        ))}
        {[80,160,240,320,400,480,560,640,720,800].map(y => (
          <line key={y} x1="0" y1={y} x2="100%" y2={y} />
        ))}
      </svg>

      {/* Top: Logo */}
      <div>
        <div className="auth-logo">Gym<span>Sport</span></div>
        <div className="auth-tagline">Smart Gym Management</div>
      </div>

      {/* Middle: Quote */}
      <div className="auth-quote-wrap">
        <div style={{ width: 32, height: 2, background: '#333', marginBottom: 24 }} />
        <div className={`auth-quote-text ${fading ? 'fade' : ''}`}>
          "{QUOTES[index].text}"
        </div>
        <div className={`auth-quote-author ${fading ? 'fade' : ''}`}>
          — {QUOTES[index].author}
        </div>
        <div className="auth-quote-dots">
          {QUOTES.map((_, i) => (
            <button
              key={i}
              className={`auth-quote-dot ${i === index ? 'active' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>

      {/* Bottom: Copyright */}
      <div className="auth-copyright">© 2026 GymSport</div>
    </div>
  );
};

export default AuthLeft;