import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target;
      const isInteractive = target && target.closest('button, a, input, select, textarea, [role="button"], tr, .interactive-card');
      setIsHovered(!!isInteractive);
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-300"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className={`rounded-full transition-all duration-300 ease-out flex items-center justify-center ${
          isHovered
            ? 'w-10 h-10 border border-cyan-400/80 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-110'
            : 'w-6 h-6 border border-blue-500/40 bg-blue-500/5 shadow-[0_0_12px_rgba(59,130,246,0.25)] scale-100'
        }`}
      >
        <div
          className={`rounded-full transition-all duration-200 ${
            isHovered ? 'w-2 h-2 bg-cyan-400 shadow-[0_0_10px_#06b6d4]' : 'w-1.5 h-1.5 bg-blue-400'
          }`}
        />
      </div>
    </div>
  );
}

