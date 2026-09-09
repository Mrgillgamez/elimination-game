import './Confetti.css';

const COLORS = ['#f5c542', '#4dff88', '#ff4d4d', '#42c5f5', '#f542e0', '#ffffff'];
const PIECE_COUNT = 40;

// Pure CSS confetti burst — no external libraries, generated fresh each time this mounts.
function Confetti() {
  const pieces = Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 2.5 + Math.random() * 1.5,
    color: COLORS[i % COLORS.length],
    rotate: Math.random() * 360,
  }));

  return (
    <div className="confetti-wrap" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default Confetti;