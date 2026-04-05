import type { CSSProperties } from 'react';

const petals = Array.from({ length: 16 }, (_, index) => ({
  id: index,
  left: `${4 + (index * 6)}%`,
  duration: `${14 + (index % 5) * 3}s`,
  delay: `-${(index % 7) * 1.8}s`,
  drift: `${18 + (index % 4) * 10}px`,
  rotate: `${8 + (index % 6) * 9}deg`,
  scale: 0.72 + (index % 5) * 0.08,
  opacity: 0.28 + (index % 4) * 0.08,
  color: index % 3 === 0 ? '#fffdfd' : index % 3 === 1 ? '#ffd9ec' : '#ffbedf',
}));

export default function FallingPetals() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {petals.map((petal) => (
        <span
          key={petal.id}
          className="falling-petal"
          style={
            {
              left: petal.left,
              '--petal-duration': petal.duration,
              '--petal-delay': petal.delay,
              '--petal-drift': petal.drift,
              '--petal-rotate': petal.rotate,
              '--petal-scale': petal.scale,
              '--petal-opacity': petal.opacity,
              background: petal.color,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
