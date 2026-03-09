import React, { useEffect, useRef, useState } from 'react';

/**
 * DemoTourOverlay – animated pulsing indicator that points at the next action.
 *
 * Props:
 *   targetId  – id of the DOM element to highlight
 *   message   – instructional text shown in the tooltip
 *   position  – 'top' | 'bottom' | 'left' | 'right' (default 'bottom')
 */
const DemoTourOverlay = ({ targetId, message, position = 'bottom' }) => {
    const [coords, setCoords] = useState(null);
    const rafRef = useRef(null);

    useEffect(() => {
        const update = () => {
            const el = document.getElementById(targetId);
            if (!el) return;
            const rect = el.getBoundingClientRect();
            setCoords({
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
                height: rect.height,
            });
        };

        // Poll until element mounts
        const poll = () => {
            update();
            rafRef.current = requestAnimationFrame(poll);
        };
        rafRef.current = requestAnimationFrame(poll);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [targetId]);

    if (!coords) return null;

    // Arrow + tooltip position calculations
    const OFFSET = 12;
    let arrowStyle = {};
    let tooltipStyle = {};
    let arrowChar = '';

    const cx = coords.left + coords.width / 2;
    const cy = coords.top + coords.height / 2;

    switch (position) {
        case 'bottom':
            arrowStyle = { top: coords.top + coords.height + 4, left: cx - 12 };
            tooltipStyle = { top: coords.top + coords.height + OFFSET + 28, left: cx - 120 };
            arrowChar = '▲';
            break;
        case 'top':
            arrowStyle = { top: coords.top - 32, left: cx - 12 };
            tooltipStyle = { top: coords.top - OFFSET - 90, left: cx - 120 };
            arrowChar = '▼';
            break;
        case 'right':
            arrowStyle = { top: cy - 12, left: coords.left + coords.width + 4 };
            tooltipStyle = { top: cy - 30, left: coords.left + coords.width + OFFSET + 24 };
            arrowChar = '◀';
            break;
        case 'left':
            arrowStyle = { top: cy - 12, left: coords.left - 32 };
            tooltipStyle = { top: cy - 30, left: coords.left - OFFSET - 248 };
            arrowChar = '▶';
            break;
        default:
            arrowStyle = { top: coords.top + coords.height + 4, left: cx - 12 };
            tooltipStyle = { top: coords.top + coords.height + OFFSET + 28, left: cx - 120 };
            arrowChar = '▲';
    }

    return (
        <>
            {/* Spotlight glow ring */}
            <div
                style={{
                    position: 'fixed',
                    top: coords.top - 6,
                    left: coords.left - 6,
                    width: coords.width + 12,
                    height: coords.height + 12,
                    borderRadius: 10,
                    zIndex: 9998,
                    pointerEvents: 'none',
                    boxShadow: '0 0 0 4px rgba(99,102,241,0.5), 0 0 0 8px rgba(99,102,241,0.2)',
                    animation: 'demoRing 1.5s ease-in-out infinite',
                }}
            />

            {/* Pulsing arrow */}
            <div
                style={{
                    position: 'absolute',
                    zIndex: 9999,
                    pointerEvents: 'none',
                    fontSize: 22,
                    color: '#6366f1',
                    animation: 'demoBounce 1s ease-in-out infinite',
                    ...arrowStyle,
                }}
            >
                {arrowChar}
            </div>

            {/* Tooltip bubble */}
            <div
                style={{
                    position: 'absolute',
                    zIndex: 9999,
                    pointerEvents: 'none',
                    minWidth: 200,
                    maxWidth: 260,
                    ...tooltipStyle,
                }}
            >
                <div
                    style={{
                        background: 'white',
                        border: '2px solid #6366f1',
                        borderRadius: 12,
                        boxShadow: '0 8px 30px rgba(99,102,241,0.25)',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <span style={{ fontSize: 18 }}>👆</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1e1b4b', lineHeight: 1.4 }}>
                        {message}
                    </span>
                </div>
            </div>

            {/* Global keyframes (injected once) */}
            <style>{`
        @keyframes demoRing {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.04); }
        }
        @keyframes demoBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
      `}</style>
        </>
    );
};

export default DemoTourOverlay;
