/**
 * The Swat valley at dusk: five ridgelines, a gold sun and the river, drawn as one inline SVG so every colour comes from the

 * different lengths added together, with fixed phases, so the picture is the same on every render.
 */
/** `waves`: [length as a share of the picture width, phase, weight]. */
type Layer = { base: number; amp: number; waves: Array<[period: number, phase: number, weight: number]> }

const tri = (t: number) => 1 - Math.abs(2 * (t - Math.floor(t)) - 1)

function ridge(w: number, h: number, { base, amp, waves }: Layer): string {
  const step = Math.max(8, Math.round(w / 90))
  let d = `M0 ${h}`
  for (let x = 0; x <= w + step; x += step) {
    const xx = Math.min(x, w)
    const v = waves.reduce((s, [period, phase, weight]) => s + weight * Math.pow(tri(xx / (period * w) + phase), 1.15), 0)
    d += ` L${xx} ${(h * base - amp * h * v).toFixed(1)}`
  }
  return `${d} L${w} ${h} Z`
}

const LAYERS: Array<{ cls: string; layer: Layer }> = [
  { cls: 'vy-r1', layer: { base: 0.56, amp: 0.2, waves: [[1.1, 0.12, 0.62], [0.47, 0.4, 0.28], [0.19, 0.7, 0.1]] } },
  { cls: 'vy-r2', layer: { base: 0.64, amp: 0.16, waves: [[0.85, 0.55, 0.58], [0.36, 0.15, 0.3], [0.15, 0.3, 0.12]] } },
  { cls: 'vy-r3', layer: { base: 0.74, amp: 0.13, waves: [[0.95, 0.9, 0.55], [0.4, 0.6, 0.33], [0.17, 0.05, 0.12]] } },
  { cls: 'vy-r4', layer: { base: 0.84, amp: 0.09, waves: [[0.7, 0.3, 0.6], [0.3, 0.8, 0.3], [0.13, 0.5, 0.1]] } },
]

/**
 * `sun`: how far across the sun sits (0 to 1). `horizon`: pushes the ridges down by that share of the height, which leaves more
 * open sky for text. `sunRadius`: in picture units; the default is a share of the shorter side.
 */
export default function Valley({ width, height, sun = 0.7, horizon = 0, sunRadius, className }: { width: number; height: number; sun?: number; horizon?: number; sunRadius?: number; className?: string }) {
  const r = sunRadius ?? Math.min(width, height) * 0.085
  const sx = width * sun
  const sy = height * (0.4 + horizon * 0.8)
  const ry = height * 0.935
  return (
    <svg className={className} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <rect className="vy-sky" width={width} height={height} />
      <g className="vy-sunrise">
        <circle className="vy-halo" cx={sx} cy={sy} r={r * 2.6} />
        <circle className="vy-halo" cx={sx} cy={sy} r={r * 1.7} />
        <circle className="vy-sun" cx={sx} cy={sy} r={r} />
      </g>
      {LAYERS.map(({ cls, layer }) => <path key={cls} className={cls} d={ridge(width, height, { ...layer, base: Math.min(layer.base + horizon * (1 - layer.base) * 1.4, 0.97) })} />)}
      <path className="vy-river" d={`M0 ${ry} C ${width * 0.25} ${ry - height * 0.03} ${width * 0.55} ${ry + height * 0.025} ${width} ${ry - height * 0.012} L${width} ${height} L0 ${height} Z`} />
      <g className="vy-glint">
        <path d={`M${sx - r * 0.9} ${ry + height * 0.012} h${r * 1.8}`} />
        <path d={`M${sx - r * 0.5} ${ry + height * 0.03} h${r}`} />
      </g>
    </svg>
  )
}
