type Point = { date: string; count: number };

export function SignupSparkline({
  data,
  width = 120,
  height = 32,
}: {
  data: Point[];
  width?: number;
  height?: number;
}) {
  if (data.length === 0) {
    return (
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
        no data
      </span>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.count));
  const step = data.length > 1 ? width / (data.length - 1) : width;

  const points = data.map((d, i) => {
    const x = i * step;
    const y = height - (d.count / max) * (height - 4) - 2;
    return [x, y] as const;
  });

  const path = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");

  const area = `${path} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={`${data.reduce((a, d) => a + d.count, 0)} signups over ${data.length} days`}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id="sparkfill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkfill)" />
      <path
        d={path}
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.length > 0 ? (
        <circle
          cx={points[points.length - 1][0]}
          cy={points[points.length - 1][1]}
          r="2.5"
          fill="var(--color-brand)"
        />
      ) : null}
    </svg>
  );
}
