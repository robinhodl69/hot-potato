/**
 * CoreVisual - Animated Core Visualization with Neon Glow
 * Features dynamic size, multi-layer glow, and heat-responsive animations
 */
interface CoreVisualProps {
  heat: number; // 0 (Safe) to 1+ (Meltdown)
  isExploded?: boolean; // Core is dead, waiting for spawn
}

export default function CoreVisual({ heat, isExploded = false }: CoreVisualProps) {
  // Dynamic state based on heat level
  const isMelting = heat >= 0.8;
  const isOverheating = heat >= 1.0;

  // Color transitions - More intense red
  const primaryColor = isMelting ? '#ff2200' : '#00ffff';
  const secondaryColor = isMelting ? '#ff4422' : '#2dd4bf';
  const glowColor = isMelting
    ? 'rgba(255, 50, 0, 0.9)'
    : 'rgba(0, 255, 255, 0.5)';

  // Animation speed inversely proportional to danger
  const pulseSpeed = Math.max(1.5 - heat * 1.2, 0.3);
  const rotateSpeed = Math.max(20 - heat * 15, 3);

  // Exploded state - Core visible but exploding with particles
  if (isExploded) {
    const explosionColor = '#ff2200';
    const explosionGlow = 'rgba(255, 50, 0, 0.9)';

    return (
      <div className="w-full h-full flex items-center justify-center relative animate-explosion-shake">

        {/* Explosion flash burst */}
        <div
          className="absolute rounded-full"
          style={{
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(255,100,0,0.4) 0%, rgba(255,50,0,0.15) 30%, transparent 60%)',
            animation: 'explosion-pulse 0.3s ease-in-out infinite',
          }}
        />

        {/* Outer Ring - Breaking apart */}
        <div
          className="absolute w-72 h-72 rounded-full border-2"
          style={{
            borderColor: explosionColor,
            borderStyle: 'dashed',
            boxShadow: `0 0 60px ${explosionGlow}`,
            animation: 'spin 2s linear infinite, flicker 0.1s ease-in-out infinite',
            opacity: 0.7,
          }}
        />

        {/* Middle Ring - Unstable */}
        <div
          className="absolute w-56 h-56 rounded-full border-2"
          style={{
            borderColor: '#ff4422',
            boxShadow: `0 0 50px ${explosionGlow}, inset 0 0 40px ${explosionGlow}`,
            animation: 'spin 1.5s linear infinite reverse, flicker 0.15s ease-in-out infinite',
            opacity: 0.6,
          }}
        />

        {/* Hexagon Frame - Flickering */}
        <div
          className="absolute w-48 h-48"
          style={{
            background: `linear-gradient(135deg, ${explosionColor}cc, transparent 60%)`,
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            animation: 'spin 2.5s linear infinite, flicker 0.1s ease-in-out infinite',
          }}
        />

        {/* Inner Core - Overloading */}
        <div
          className="absolute w-40 h-40 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${explosionColor} 0%, #ff4422 50%, ${explosionColor}99 100%)`,
            boxShadow: `
              0 0 60px ${explosionGlow},
              0 0 120px ${explosionGlow},
              0 0 180px ${explosionGlow},
              inset 0 0 60px ${explosionColor}
            `,
            animation: 'explosion-core-pulse 0.2s ease-in-out infinite',
          }}
        />

        {/* Center - Bright overload */}
        <div
          className="absolute w-20 h-20 rounded-full"
          style={{
            background: `radial-gradient(circle, white 0%, ${explosionColor} 30%, #ff8800 100%)`,
            boxShadow: `0 0 50px ${explosionColor}, 0 0 80px ${explosionColor}`,
            animation: 'flicker 0.08s ease-in-out infinite',
          }}
        />

        {/* Explosion particles flying outward */}
        {[...Array(16)].map((_, i) => {
          const angle = (i * 22.5) * (Math.PI / 180);
          const distance = 100 + (i % 3) * 30;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${6 + (i % 4) * 3}px`,
                height: `${6 + (i % 4) * 3}px`,
                background: i % 2 === 0 ? '#ff4400' : '#ff8800',
                boxShadow: '0 0 8px rgba(255,100,0,0.9)',
                animation: `particle-fly-${i % 4} ${0.8 + (i % 3) * 0.3}s ease-out infinite`,
                animationDelay: `${(i % 4) * 0.1}s`,
              }}
            />
          );
        })}

        {/* Ember particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`ember-${i}`}
            className="absolute w-1 h-1 rounded-full bg-orange-400"
            style={{
              animation: `ember-float-${i % 4} ${1.5 + (i % 3) * 0.5}s ease-out infinite`,
              opacity: 0.9,
            }}
          />
        ))}

        {/* Explosion keyframes */}
        <style>{`
          @keyframes explosion-shake {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            10% { transform: translate(-4px, 2px) rotate(-1deg); }
            20% { transform: translate(4px, -3px) rotate(1deg); }
            30% { transform: translate(-3px, 4px) rotate(-0.5deg); }
            40% { transform: translate(3px, -2px) rotate(0.5deg); }
            50% { transform: translate(-2px, 3px) rotate(-1deg); }
            60% { transform: translate(4px, -4px) rotate(1deg); }
            70% { transform: translate(-4px, 2px) rotate(-0.5deg); }
            80% { transform: translate(2px, -3px) rotate(0.5deg); }
            90% { transform: translate(-3px, 4px) rotate(-1deg); }
          }
          .animate-explosion-shake { animation: explosion-shake 0.15s ease-in-out infinite; }
          
          @keyframes explosion-pulse {
            0%, 100% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.1); opacity: 0.6; }
          }
          
          @keyframes explosion-core-pulse {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.15); opacity: 1; }
          }
          
          @keyframes flicker {
            0%, 100% { opacity: 0.9; }
            25% { opacity: 0.7; }
            50% { opacity: 1; }
            75% { opacity: 0.6; }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes particle-fly-0 {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(120px, -80px) scale(0.3); opacity: 0; }
          }
          @keyframes particle-fly-1 {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(-100px, -100px) scale(0.2); opacity: 0; }
          }
          @keyframes particle-fly-2 {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(110px, 90px) scale(0.4); opacity: 0; }
          }
          @keyframes particle-fly-3 {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(-90px, 110px) scale(0.3); opacity: 0; }
          }
          
          @keyframes ember-float-0 {
            0% { transform: translate(0, 0); opacity: 1; }
            100% { transform: translate(40px, -120px); opacity: 0; }
          }
          @keyframes ember-float-1 {
            0% { transform: translate(0, 0); opacity: 1; }
            100% { transform: translate(-50px, -100px); opacity: 0; }
          }
          @keyframes ember-float-2 {
            0% { transform: translate(0, 0); opacity: 1; }
            100% { transform: translate(30px, -130px); opacity: 0; }
          }
          @keyframes ember-float-3 {
            0% { transform: translate(0, 0); opacity: 1; }
            100% { transform: translate(-40px, -110px); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }


  return (
    <div className={`w-full h-full flex items-center justify-center relative ${isOverheating ? 'animate-shake' : ''}`}>

      {/* Outer Glow Ring - Largest */}
      <div
        className="absolute rounded-full animate-pulse"
        style={{
          width: '340px',
          height: '340px',
          background: `radial-gradient(circle, transparent 30%, ${glowColor} 100%)`,
          opacity: 0.6,
          animationDuration: `${pulseSpeed * 2}s`,
        }}
      />

      {/* Outer Rotating Ring */}
      <div
        className="absolute w-72 h-72 rounded-full border-2"
        style={{
          borderColor: primaryColor,
          borderStyle: 'dashed',
          boxShadow: `0 0 50px ${glowColor}`,
          animation: `spin ${rotateSpeed}s linear infinite`,
          opacity: 0.9,
        }}
      />

      {/* Middle Ring */}
      <div
        className="absolute w-56 h-56 rounded-full border"
        style={{
          borderColor: secondaryColor,
          borderWidth: '2px',
          boxShadow: `0 0 40px ${glowColor}, inset 0 0 30px ${glowColor}`,
          animation: `spin ${rotateSpeed * 0.7}s linear infinite reverse`,
          opacity: 0.8,
        }}
      />

      {/* Hexagon Frame */}
      <div
        className="absolute w-48 h-48"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}88, transparent 60%)`,
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          animation: `spin ${rotateSpeed * 1.5}s linear infinite`,
        }}
      />

      {/* Inner Core - Main Pulsing Element - MORE SOLID */}
      <div
        className="absolute w-40 h-40 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${primaryColor} 0%, ${secondaryColor} 50%, ${primaryColor}99 100%)`,
          boxShadow: `
            0 0 50px ${glowColor},
            0 0 100px ${glowColor},
            0 0 150px ${glowColor},
            inset 0 0 50px ${primaryColor}aa
          `,
          animation: `pulse-core ${pulseSpeed}s ease-in-out infinite`,
        }}
      />

      {/* Center Bright Spot - BRIGHTER */}
      <div
        className="absolute w-16 h-16 rounded-full"
        style={{
          background: `radial-gradient(circle, white 0%, ${primaryColor} 40%, ${primaryColor}cc 100%)`,
          boxShadow: `0 0 40px ${primaryColor}, 0 0 60px ${primaryColor}`,
          animation: `pulse-core ${pulseSpeed * 0.5}s ease-in-out infinite`,
        }}
      />

      {/* Particle Effects (Meltdown only) */}
      {isMelting && (
        <>
          <div className="absolute w-2 h-2 rounded-full bg-orange-500 animate-float-1"
            style={{ top: '20%', left: '30%', animationDuration: '2s' }} />
          <div className="absolute w-1 h-1 rounded-full bg-red-500 animate-float-2"
            style={{ top: '70%', right: '25%', animationDuration: '1.5s' }} />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-orange-400 animate-float-3"
            style={{ bottom: '30%', left: '20%', animationDuration: '2.5s' }} />
        </>
      )}

      {/* Scanline Effect (Overheat) */}
      {isOverheating && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 4px,
              ${primaryColor}11 4px,
              ${primaryColor}11 8px
            )`,
            animation: 'scanline-move 0.2s linear infinite',
          }}
        />
      )}

      {/* SVG Noise Filter */}
      <svg className="absolute" style={{ width: 0, height: 0 }}>
        <defs>
          <filter id="noise-filter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="4"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Noise Overlay */}
      <div
        className="absolute w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: isMelting ? 0.15 : 0.08,
          mixBlendMode: 'overlay',
          animation: 'noise-animate 0.2s steps(4) infinite',
        }}
      />

      {/* Keyframe Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-core {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.9;
          }
          50% { 
            transform: scale(1.1); 
            opacity: 1;
          }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
          50% { transform: translate(10px, -20px) scale(0.5); opacity: 0.5; }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
          50% { transform: translate(-15px, 15px) scale(0.3); opacity: 0.3; }
        }
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
          50% { transform: translate(20px, 10px) scale(0.6); opacity: 0.6; }
        }
        @keyframes scanline-move {
          from { transform: translateY(0); }
          to { transform: translateY(8px); }
        }
        .animate-float-1 { animation: float-1 2s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 1.5s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 2.5s ease-in-out infinite; }
        .animate-shake {
          animation: shake 0.1s ease-in-out infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px) translateY(1px); }
          50% { transform: translateX(3px) translateY(-1px); }
          75% { transform: translateX(-2px) translateY(2px); }
        }
        @keyframes noise-animate {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-1px, 1px); }
          50% { transform: translate(1px, -1px); }
          75% { transform: translate(-1px, -1px); }
          100% { transform: translate(1px, 1px); }
        }
      `}</style>
    </div>
  );
}

