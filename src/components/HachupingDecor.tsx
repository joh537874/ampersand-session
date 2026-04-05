import Image from 'next/image';
import hachuping from '@/app/hachuping.webp';
import type { CSSProperties } from 'react';

const floatingSprites = [
  { top: '12%', left: '6%', size: 94, duration: '9s', delay: '-1.8s', rotate: '-8deg' },
  { top: '20%', right: '8%', size: 84, duration: '11s', delay: '-4.2s', rotate: '7deg' },
  { top: '44%', left: '4%', size: 72, duration: '10s', delay: '-2.4s', rotate: '-6deg' },
  { top: '52%', right: '5%', size: 98, duration: '12s', delay: '-5.6s', rotate: '9deg' },
  { top: '74%', left: '10%', size: 80, duration: '10.5s', delay: '-3.4s', rotate: '-5deg' },
  { top: '78%', right: '12%', size: 88, duration: '9.8s', delay: '-6.2s', rotate: '6deg' },
];

export default function HachupingDecor() {
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[2] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.24),transparent_64%)]" />
        <Image
          src={hachuping}
          alt=""
          priority
          className="hachuping-watermark absolute left-1/2 top-1/2 h-auto w-[min(92vw,1080px)] -translate-x-1/2 -translate-y-1/2 object-contain opacity-20"
        />
      </div>

      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[14] overflow-hidden">
        {floatingSprites.map((sprite, index) => (
          <div
            key={index}
            className="hachuping-float absolute"
            style={
              {
                top: sprite.top,
                left: sprite.left,
                right: sprite.right,
                animationDuration: sprite.duration,
                animationDelay: sprite.delay,
                '--float-rotate': sprite.rotate,
              } as CSSProperties
            }
          >
            <Image
              src={hachuping}
              alt=""
              className="h-auto w-full object-contain drop-shadow-[0_18px_24px_rgba(244,142,188,0.24)]"
              style={{ width: `${sprite.size}px` }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
