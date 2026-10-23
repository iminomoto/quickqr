"use client";

const PARTICLE_COUNT = 30;

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function generateParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: seededRandom(i * 7 + 1) * 100,
    y: seededRandom(i * 13 + 3) * 100,
    size: 1 + seededRandom(i * 17 + 5) * 1.5,
    opacity: 0.15 + seededRandom(i * 23 + 7) * 0.35,
    duration: 4 + seededRandom(i * 29 + 11) * 6,
    delay: seededRandom(i * 31 + 13) * -8,
    driftX: -20 + seededRandom(i * 37 + 17) * 50,
    driftY: -15 + seededRandom(i * 41 + 19) * 30,
  }));
}

const particles = generateParticles();

export function Particles() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: `rgba(255,255,255,${p.opacity})`,
            animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            ['--drift-x' as string]: `${p.driftX}px`,
            ['--drift-y' as string]: `${p.driftY}px`,
          }}
        />
      ))}
    </div>
  );
}
