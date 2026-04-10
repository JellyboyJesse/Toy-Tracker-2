import { useRef, useCallback, type PointerEvent } from 'react';

export function useKnobDrag(
  value: number,
  onChange: (v: number) => void,
  sensitivity = 0.005
) {
  const startY = useRef(0);
  const startValue = useRef(0);
  const lastDispatch = useRef(0);

  const onPointerDown = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      startY.current = e.clientY;
      startValue.current = value;
    },
    [value]
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      if (e.buttons === 0) return;
      const now = performance.now();
      if (now - lastDispatch.current < 16) return;
      lastDispatch.current = now;
      const delta = startY.current - e.clientY;
      const next = Math.max(0, Math.min(1, startValue.current + delta * sensitivity));
      onChange(next);
    },
    [onChange, sensitivity]
  );

  return { onPointerDown, onPointerMove };
}
