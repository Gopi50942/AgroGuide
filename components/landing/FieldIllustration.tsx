const SUN_RAYS = [
  { x1: 786, y1: 110, x2: 798, y2: 110 },
  { x1: 779.84, y1: 133, x2: 790.23, y2: 139 },
  { x1: 763, y1: 149.84, x2: 769, y2: 160.23 },
  { x1: 740, y1: 156, x2: 740, y2: 168 },
  { x1: 717, y1: 149.84, x2: 711, y2: 160.23 },
  { x1: 700.16, y1: 133, x2: 689.77, y2: 139 },
  { x1: 694, y1: 110, x2: 682, y2: 110 },
  { x1: 700.16, y1: 87, x2: 689.77, y2: 81 },
  { x1: 717, y1: 70.16, x2: 711, y2: 59.77 },
  { x1: 740, y1: 64, x2: 740, y2: 52 },
  { x1: 763, y1: 70.16, x2: 769, y2: 59.77 },
  { x1: 779.84, y1: 87, x2: 790.23, y2: 81 },
];

export function FieldIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 900 560"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Hand-drawn illustration of a farmer walking through a tomato field at sunrise, with hills, a tractor and trees in the background"
    >
      {/* Sky */}
      <rect x="0" y="0" width="900" height="560" fill="none" />

      {/* Sun */}
      <circle cx="740" cy="110" r="58" fill="#F5DE9C" opacity="0.55" />
      <circle cx="740" cy="110" r="34" stroke="#C68F2A" strokeWidth="2" fill="#FBEFCB" />
      {SUN_RAYS.map((ray, i) => (
        <line
          key={i}
          x1={ray.x1}
          y1={ray.y1}
          x2={ray.x2}
          y2={ray.y2}
          stroke="#C68F2A"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
      ))}

      {/* Clouds */}
      <path
        d="M110 90c-10-14 8-28 22-20 4-16 30-16 34 0 16-6 28 10 18 22 8 10-4 22-16 18-6 10-24 10-30-2-14 6-28-6-28-18Z"
        fill="#FDFBF6"
        stroke="#A6C48A"
        strokeWidth="1.5"
        opacity="0.9"
      />
      <path
        d="M330 60c-7-10 6-20 16-14 3-11 21-11 24 0 11-4 20 7 13 16 6 7-3 16-11 13-4 7-17 7-21-1-10 4-19-4-21-14Z"
        fill="#FDFBF6"
        stroke="#A6C48A"
        strokeWidth="1.5"
        opacity="0.8"
      />

      {/* Birds */}
      <path d="M540 70q8-8 16 0q8-8 16 0" stroke="#3C4432" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M580 95q7-7 14 0q7-7 14 0" stroke="#3C4432" strokeWidth="1.6" fill="none" strokeLinecap="round" />

      {/* Back hills */}
      <path
        d="M0 300 Q120 230 260 280 T520 260 T900 290 V560 H0 Z"
        fill="#D1DFC5"
        opacity="0.7"
      />
      <path
        d="M0 300 Q120 230 260 280 T520 260 T900 290"
        stroke="#7FA85F"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />

      {/* Mid hills */}
      <path
        d="M0 360 Q160 300 340 350 T700 330 T900 360 V560 H0 Z"
        fill="#A6C48A"
        opacity="0.55"
      />

      {/* Trees on hill */}
      {[130, 640, 800].map((x, i) => (
        <g key={i} transform={`translate(${x}, 250)`}>
          <path d="M0 60 L0 30" stroke="#6E401C" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M-22 30c-4-16 10-28 22-24c2-14 24-14 26 0c14-4 26 10 20 24c8 8 0 22-12 20c-4 10-20 12-28 2c-14 4-24-8-28-22Z"
            fill="#5C8A44"
            stroke="#2F5423"
            strokeWidth="1.5"
          />
        </g>
      ))}

      {/* Ground */}
      <path d="M0 400 Q450 370 900 400 V560 H0 Z" fill="#EFE7D3" />

      {/* Crop rows (tomato field) */}
      {Array.from({ length: 7 }).map((_, row) => {
        const y = 420 + row * 18;
        return (
          <g key={row}>
            <line x1="20" y1={y} x2="880" y2={y - 4} stroke="#C9803D" strokeWidth="1" opacity="0.35" />
            {Array.from({ length: 14 }).map((_, i) => {
              const x = 40 + i * 62 + (row % 2 === 0 ? 0 : 20);
              if (x > 620 && x < 760) return null; // leave space for farmer
              return (
                <g key={i} transform={`translate(${x}, ${y - (i % 3)})`}>
                  <path d="M0 0 q-6 -14 0 -22 q6 8 0 22" fill="#3F6B2E" opacity="0.85" />
                  <circle cx="2" cy="-14" r="2.6" fill="#C1592F" opacity="0.9" />
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Tractor, ink line-art */}
      <g transform="translate(60,330)">
        <path d="M0 46 h74" stroke="#22281E" strokeWidth="0" />
        <path
          d="M4 46 L4 20 L34 20 L44 4 L70 4 L70 34 L58 34"
          stroke="#3C4432"
          strokeWidth="3"
          fill="#F4DFC2"
          strokeLinejoin="round"
        />
        <rect x="44" y="8" width="18" height="14" fill="#EAF0E4" stroke="#3C4432" strokeWidth="2" />
        <circle cx="16" cy="46" r="14" fill="#EFE7D3" stroke="#22281E" strokeWidth="3" />
        <circle cx="16" cy="46" r="4" fill="#22281E" />
        <circle cx="58" cy="46" r="9" fill="#EFE7D3" stroke="#22281E" strokeWidth="3" />
        <circle cx="58" cy="46" r="3" fill="#22281E" />
      </g>

      {/* Farmer — hand-drawn editorial style, walking with basket */}
      <g transform="translate(660, 300)">
        {/* body */}
        <path
          d="M40 40 C40 20 32 10 22 10 C12 10 4 20 4 40 L4 96 L14 96 L18 62 L22 96 L34 96 L38 60 L40 96 L50 96 L48 40 Z"
          fill="#EAF0E4"
          stroke="#22281E"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* shirt shading line */}
        <path d="M14 30 C14 44 30 44 34 30" stroke="#7FA85F" strokeWidth="2" fill="none" opacity="0.6" />
        {/* head */}
        <circle cx="22" cy="-4" r="14" fill="#F4DFC2" stroke="#22281E" strokeWidth="2.5" />
        {/* hat */}
        <path
          d="M2 -8 Q22 -34 42 -8 Q32 -14 22 -14 Q12 -14 2 -8Z"
          fill="#E8BE8B"
          stroke="#8F5424"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M-4 -8 h52" stroke="#8F5424" strokeWidth="3" strokeLinecap="round" />
        {/* arm holding basket */}
        <path d="M4 40 Q-14 46 -16 66" stroke="#22281E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M48 40 Q64 50 60 68" stroke="#22281E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* basket */}
        <path
          d="M-30 66 L-2 66 L-6 92 L-26 92 Z"
          fill="#F4DFC2"
          stroke="#8F5424"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M-30 66 Q-16 58 -2 66" stroke="#8F5424" strokeWidth="2" fill="none" />
        <circle cx="-20" cy="76" r="3" fill="#C1592F" />
        <circle cx="-12" cy="80" r="3" fill="#C1592F" />
        <circle cx="-16" cy="86" r="3" fill="#C1592F" />
      </g>

      {/* Ground line */}
      <path d="M0 486 Q450 470 900 486" stroke="#B06A2C" strokeWidth="1.5" opacity="0.4" fill="none" />
    </svg>
  );
}
