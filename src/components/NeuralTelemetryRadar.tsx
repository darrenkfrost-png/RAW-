import React, { useMemo, useRef, useEffect } from "react";
import { motion } from "motion/react";
import * as d3 from "d3";

interface RadarMetric {
  axis: string;
  value: number; // 0 to 100
}

interface NeuralTelemetryRadarProps {
  metrics: RadarMetric[];
  color?: string;
  size?: number;
  activeAxis?: string | null;
}

export default function NeuralTelemetryRadar({ 
  metrics, 
  color = "#dc2626", 
  size = 400,
  activeAxis = null
}: NeuralTelemetryRadarProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const radarData = useMemo(() => {
    const angleSlice = (Math.PI * 2) / metrics.length;
    const rScale = d3.scaleLinear().domain([0, 100]).range([0, size / 2 - 40]);

    return metrics.map((m, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      return {
        ...m,
        x: rScale(m.value) * Math.cos(angle),
        y: rScale(m.value) * Math.sin(angle),
        labelX: rScale(115) * Math.cos(angle),
        labelY: rScale(115) * Math.sin(angle),
        gridX: metrics.map((_, idx) => {
            const gridVal = (idx + 1) * 20;
            return rScale(gridVal) * Math.cos(angle);
        }),
        gridY: metrics.map((_, idx) => {
            const gridVal = (idx + 1) * 20;
            return rScale(gridVal) * Math.sin(angle);
        })
      };
    });
  }, [metrics, size]);

  const pathData = useMemo(() => {
    const line = d3.lineRadial<RadarMetric>()
      .radius(d => d3.scaleLinear().domain([0, 100]).range([0, size / 2 - 40])(d.value))
      .angle((d, i) => i * ((Math.PI * 2) / metrics.length))
      .curve(d3.curveLinearClosed);
    
    return line(metrics);
  }, [metrics, size]);

  return (
    <div className="relative flex items-center justify-center group" style={{ width: size, height: size }}>
      {/* Background Glow */}
      <div 
        className="absolute inset-0 rounded-full blur-[100px] opacity-20 pointer-events-none transition-opacity duration-1000 group-hover:opacity-40" 
        style={{ backgroundColor: color }}
      />
      
      <svg 
        ref={svgRef}
        width={size} 
        height={size} 
        className="relative z-10 overflow-visible"
        role="img"
        aria-label="Radar chart showing performance metrics"
      >
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          {/* Grid Circles */}
          {[20, 40, 60, 80, 100].map((level) => (
            <circle
              key={level}
              r={d3.scaleLinear().domain([0, 100]).range([0, size / 2 - 40])(level)}
              fill="none"
              stroke="white"
              strokeWidth={level === 100 ? "1" : "0.5"}
              strokeDasharray={level === 100 ? "0" : "4 4"}
              className={level === 100 ? "opacity-20" : "opacity-10"}
            />
          ))}

          {/* Axes */}
          {radarData.map((d, i) => (
            <g key={i}>
              <line
                x1={0}
                y1={0}
                x2={d.labelX * 0.85}
                y2={d.labelY * 0.85}
                stroke={activeAxis === d.axis ? color : "white"}
                strokeWidth={activeAxis === d.axis ? "2" : "1"}
                className={`transition-all duration-500 ${activeAxis === d.axis ? "opacity-60" : "opacity-5"}`}
              />
              <text
                x={d.labelX}
                y={d.labelY}
                fill={activeAxis === d.axis ? "white" : "zinc"}
                className={`text-[8px] uppercase font-mono font-black tracking-[0.2em] transition-all duration-500 ${activeAxis === d.axis ? "fill-white scale-110 drop-shadow-[0_0_8px_white]" : "fill-zinc-600 opacity-40 hover:opacity-100"}`}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {d.axis}
              </text>
              <circle 
                cx={d.labelX * 1.15} 
                cy={d.labelY * 1.15} 
                r="1.5" 
                className={`fill-red-500 transition-opacity duration-500 ${activeAxis === d.axis ? "opacity-100 animate-pulse" : "opacity-0"}`}
              />
            </g>
          ))}

          {/* Data Path */}
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "circOut" }}
            d={pathData || ""}
            fill={`${color}15`}
            stroke={color}
            strokeWidth="3"
            className="drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]"
          />

          {/* Data Points */}
          {radarData.map((d, i) => (
            <motion.circle
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + i * 0.1, duration: 0.5 }}
              cx={d.x}
              cy={d.y}
              r="4"
              fill="white"
              className="drop-shadow-[0_0_8px_white]"
            />
          ))}
        </g>
      </svg>

      {/* Decorative Scanner Line */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border border-editorial-border rounded-full pointer-events-none"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-1/2 bg-gradient-to-t from-red-600 via-red-600/20 to-transparent opacity-40 shadow-[0_0_20px_#dc2626]" />
      </motion.div>
    </div>
  );
}
