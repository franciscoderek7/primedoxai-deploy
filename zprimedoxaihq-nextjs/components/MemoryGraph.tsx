'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchMemoryNodes, fetchMemoryEdges, fetchMemoryStats, type MemoryNodeRow, type MemoryEdgeRow } from '@/lib/realtime';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────

interface D3Node extends MemoryNodeRow {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number | null;
  fy?: number | null;
}

interface D3Link {
  source: D3Node;
  target: D3Node;
  relationship: string;
  weight: number;
}

interface TooltipState {
  node: D3Node;
  x: number;
  y: number;
}

const NODE_COLORS: Record<string, string> = {
  entity:   '#2E7D32',
  concept:  '#FFD700',
  document: '#4CAF50',
  citation: '#78909C',
};

const NODE_RADII: Record<string, number> = {
  entity:   9,
  concept:  11,
  document: 8,
  citation: 6,
};

const DOMAIN_COLORS: Record<string, string> = {
  legal:    '#60A5FA',
  cyber:    '#F87171',
  safety:   '#FB923C',
  business: '#A78BFA',
};

// ─── Component ────────────────────────────────────────────────────────────

export default function MemoryGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [stats, setStats] = useState<{
    total_nodes: number; total_edges: number;
    by_type: Record<string, number>; by_domain: Record<string, number>;
  } | null>(null);
  const [nodeCount, setNodeCount] = useState(0);
  const [filter, setFilter] = useState<string>('all');
  const simRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [nodes, statsData] = await Promise.all([
          fetchMemoryNodes(150),
          fetchMemoryStats(),
        ]);
        if (cancelled) return;

        const filtered = filter === 'all' ? nodes : nodes.filter(n => n.node_type === filter);
        const edges = await fetchMemoryEdges(filtered.map(n => n.id));
        if (cancelled) return;

        setNodeCount(filtered.length);
        setStats(statsData);
        renderGraph(filtered, edges);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load memory graph');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; simRef.current?.stop(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  function renderGraph(rawNodes: MemoryNodeRow[], rawEdges: MemoryEdgeRow[]) {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    simRef.current?.stop();

    const W = container.clientWidth || 700;
    const H = container.clientHeight || 480;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = '';

    if (rawNodes.length === 0) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(W / 2));
      text.setAttribute('y', String(H / 2));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'rgba(255,255,255,0.3)');
      text.setAttribute('font-size', '14');
      text.textContent = 'No memory nodes yet — run a workflow first';
      svg.appendChild(text);
      return;
    }

    // Build D3-style node/link objects manually
    const nodeMap = new Map<string, D3Node>();
    const d3Nodes: D3Node[] = rawNodes.map(n => {
      const node: D3Node = {
        ...n,
        x: W / 2 + (Math.random() - 0.5) * 300,
        y: H / 2 + (Math.random() - 0.5) * 300,
        vx: 0,
        vy: 0,
      };
      nodeMap.set(n.id, node);
      return node;
    });

    const d3Links: D3Link[] = rawEdges
      .filter(e => nodeMap.has(e.source_id) && nodeMap.has(e.target_id))
      .map(e => ({
        source: nodeMap.get(e.source_id)!,
        target: nodeMap.get(e.target_id)!,
        relationship: e.relationship,
        weight: e.weight,
      }));

    // SVG groups
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('viewBox', '0 -5 10 10');
    marker.setAttribute('refX', '16');
    marker.setAttribute('refY', '0');
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('orient', 'auto');
    const markerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    markerPath.setAttribute('d', 'M0,-5L10,0L0,5');
    markerPath.setAttribute('fill', 'rgba(255,255,255,0.2)');
    marker.appendChild(markerPath);
    defs.appendChild(marker);
    svg.appendChild(defs);

    const gLinks = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const gNodes = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(gLinks);
    svg.appendChild(gNodes);

    // Create link elements
    const linkEls = d3Links.map(link => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', 'rgba(255,255,255,0.12)');
      line.setAttribute('stroke-width', String(Math.max(0.5, link.weight)));
      line.setAttribute('marker-end', 'url(#arrowhead)');
      gLinks.appendChild(line);
      return { el: line, link };
    });

    // Create node elements
    const nodeEls = d3Nodes.map(node => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.style.cursor = 'pointer';

      const r = NODE_RADII[node.node_type] ?? 7;
      const color = node.domain
        ? DOMAIN_COLORS[node.domain] ?? NODE_COLORS[node.node_type] ?? '#888'
        : NODE_COLORS[node.node_type] ?? '#888';

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', String(r));
      circle.setAttribute('fill', color);
      circle.setAttribute('fill-opacity', '0.85');
      circle.setAttribute('stroke', '#fff');
      circle.setAttribute('stroke-width', '0.8');
      circle.setAttribute('stroke-opacity', '0.4');

      // Scale circle by usage_count
      const scale = Math.min(2.5, 1 + (node.usage_count - 1) * 0.15);
      circle.setAttribute('r', String(r * scale));

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('dy', String(r * scale + 10));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '9');
      label.setAttribute('fill', 'rgba(255,255,255,0.55)');
      label.setAttribute('pointer-events', 'none');
      label.textContent = node.label.length > 20 ? node.label.slice(0, 18) + '…' : node.label;

      g.appendChild(circle);
      g.appendChild(label);

      // Hover events
      g.addEventListener('mouseenter', (e) => {
        circle.setAttribute('stroke-opacity', '1');
        circle.setAttribute('stroke-width', '2');
        const rect = svg.getBoundingClientRect();
        setTooltip({
          node,
          x: (e as MouseEvent).clientX - rect.left,
          y: (e as MouseEvent).clientY - rect.top,
        });
      });
      g.addEventListener('mouseleave', () => {
        circle.setAttribute('stroke-opacity', '0.4');
        circle.setAttribute('stroke-width', '0.8');
        setTooltip(null);
      });

      // Drag
      let dragging = false;
      g.addEventListener('mousedown', () => { dragging = true; node.fx = node.x; node.fy = node.y; });
      svg.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const rect = svg.getBoundingClientRect();
        const scaleX = W / rect.width;
        const scaleY = H / rect.height;
        node.fx = ((e as MouseEvent).clientX - rect.left) * scaleX;
        node.fy = ((e as MouseEvent).clientY - rect.top) * scaleY;
      });
      svg.addEventListener('mouseup', () => {
        if (dragging) { dragging = false; node.fx = null; node.fy = null; }
      });

      gNodes.appendChild(g);
      return { el: g, circle, node };
    });

    // Force simulation (hand-rolled — no D3 dependency)
    const alpha = { value: 1 };
    const ALPHA_DECAY = 0.02;
    const ALPHA_MIN = 0.001;
    let rafId: number;

    function tick() {
      if (alpha.value < ALPHA_MIN) return;
      alpha.value *= (1 - ALPHA_DECAY);

      // Repulsion between nodes
      for (let i = 0; i < d3Nodes.length; i++) {
        for (let j = i + 1; j < d3Nodes.length; j++) {
          const a = d3Nodes[i], b = d3Nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const strength = (1200 / (dist * dist)) * alpha.value;
          a.vx -= (dx / dist) * strength;
          a.vy -= (dy / dist) * strength;
          b.vx += (dx / dist) * strength;
          b.vy += (dy / dist) * strength;
        }
      }

      // Link attraction
      for (const { link } of linkEls) {
        const dx = link.target.x - link.source.x;
        const dy = link.target.y - link.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const target = 120 * link.weight;
        const strength = ((dist - target) / dist) * 0.08 * alpha.value;
        link.source.vx += dx * strength;
        link.source.vy += dy * strength;
        link.target.vx -= dx * strength;
        link.target.vy -= dy * strength;
      }

      // Center gravity
      for (const n of d3Nodes) {
        n.vx += (W / 2 - n.x) * 0.002 * alpha.value;
        n.vy += (H / 2 - n.y) * 0.002 * alpha.value;
      }

      // Integrate + damping + bounds
      for (const n of d3Nodes) {
        if (n.fx != null) { n.x = n.fx; n.vx = 0; }
        else { n.vx *= 0.7; n.x = Math.max(20, Math.min(W - 20, n.x + n.vx)); }
        if (n.fy != null) { n.y = n.fy; n.vy = 0; }
        else { n.vy *= 0.7; n.y = Math.max(20, Math.min(H - 20, n.y + n.vy)); }
      }

      // Update DOM
      for (const { el, node } of nodeEls) {
        el.setAttribute('transform', `translate(${node.x},${node.y})`);
      }
      for (const { el, link } of linkEls) {
        el.setAttribute('x1', String(link.source.x));
        el.setAttribute('y1', String(link.source.y));
        el.setAttribute('x2', String(link.target.x));
        el.setAttribute('y2', String(link.target.y));
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    simRef.current = { stop: () => cancelAnimationFrame(rafId) };
  }

  return (
    <div className="bg-doc-card border border-doc-border/30 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-doc-border/20 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-doc-text font-semibold text-sm">Memory Graph</h3>
          <p className="text-doc-text/40 text-xs mt-0.5">
            {loading ? 'Loading…' : `${nodeCount} nodes · Self-growing knowledge base`}
          </p>
        </div>

        {/* Type filter */}
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'entity', 'concept', 'document', 'citation'].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={clsx(
                'px-2.5 py-1 rounded text-xs font-medium transition-colors capitalize',
                filter === t ? 'bg-doc-green text-white' : 'bg-white/5 text-doc-text/50 hover:bg-white/10'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-4 divide-x divide-doc-border/20 border-b border-doc-border/20">
          {[
            { label: 'Nodes', value: stats.total_nodes },
            { label: 'Edges', value: stats.total_edges },
            { label: 'Entities', value: stats.by_type.entity || 0 },
            { label: 'Concepts', value: stats.by_type.concept || 0 },
          ].map(s => (
            <div key={s.label} className="px-4 py-2.5 text-center">
              <div className="text-doc-gold font-bold text-lg">{s.value}</div>
              <div className="text-doc-text/40 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Graph canvas */}
      <div ref={containerRef} className="relative w-full h-96 bg-doc-dark/50">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-doc-text/40 text-sm">Loading knowledge graph…</div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-400 text-sm">{error}</p>
              <p className="text-doc-text/40 text-xs mt-1">Run a workflow to populate the memory graph</p>
            </div>
          </div>
        )}
        <svg ref={svgRef} className="w-full h-full" />

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute pointer-events-none bg-doc-card border border-doc-border/50 rounded-lg p-3 shadow-xl text-xs max-w-xs z-10"
            style={{ left: Math.min(tooltip.x + 12, 500), top: Math.max(8, tooltip.y - 60) }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: NODE_COLORS[tooltip.node.node_type] || '#888' }}
              />
              <span className="text-doc-text font-semibold">{tooltip.node.label}</span>
            </div>
            <div className="text-doc-text/50 space-y-0.5">
              <div>Type: <span className="text-doc-text/70 capitalize">{tooltip.node.node_type}</span></div>
              {tooltip.node.domain && (
                <div>Domain: <span className="text-doc-text/70 capitalize">{tooltip.node.domain}</span></div>
              )}
              <div>Referenced: <span className="text-doc-text/70">{tooltip.node.usage_count}×</span></div>
              {tooltip.node.content && (
                <div className="mt-1.5 text-doc-text/60 leading-relaxed border-t border-doc-border/20 pt-1.5">
                  {tooltip.node.content.slice(0, 140)}{tooltip.node.content.length > 140 ? '…' : ''}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-doc-border/20 flex flex-wrap gap-4">
        {Object.entries(NODE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-doc-text/40 text-xs capitalize">{type}</span>
          </div>
        ))}
        <span className="text-doc-text/25 text-xs ml-auto">Node size = reference frequency</span>
      </div>
    </div>
  );
}
