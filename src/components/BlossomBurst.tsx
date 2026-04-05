'use client';

import type { CSSProperties } from 'react';

interface Props {
  burstKey: number;
}

const petals = Array.from({ length: 18 }, (_, index) => {
  const angle = (360 / 18) * index;
  const distance = 90 + (index % 6) * 16;
  const drift = index % 2 === 0 ? 24 : -24;
  const delay = (index % 6) * 0.04;
  const scale = 0.84 + (index % 4) * 0.12;

  return {
    id: index,
    angle,
    distance,
    drift,
    delay,
    scale,
    color: index % 3 === 0 ? '#fff8fd' : index % 3 === 1 ? '#ffd9ec' : '#ffb7da',
  };
});

export default function BlossomBurst({ burstKey }: Props) {
  if (burstKey === 0) {
    return null;
  }

  return (
    <div key={burstKey} className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      <div className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2">
        {petals.map((petal) => (
          <span
            key={`${burstKey}-${petal.id}`}
            className="absolute left-0 top-0 block blossom-petal"
            style={
              {
                '--blossom-angle': `${petal.angle}deg`,
                '--blossom-distance': `${petal.distance}px`,
                '--blossom-drift': `${petal.drift}px`,
                '--blossom-delay': `${petal.delay}s`,
                '--blossom-scale': petal.scale,
                background: petal.color,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="blossom-glow absolute left-1/2 top-[56%] h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full" />
    </div>
  );
}
