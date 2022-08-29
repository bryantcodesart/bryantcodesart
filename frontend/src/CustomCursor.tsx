import React, {
  useState, createContext, ReactNode, useContext, useMemo,
  Children, ReactElement, useEffect,
} from 'react';
import { useMouse } from 'rooks';
import { useHasNoMouse } from './useHasNoMouse';
import { useParamOnLoad } from './useParamOnLoad';

export type CustomCursorState = 'none'
 | 'normal'
 | 'contact'
 | 'computer-on'
 | 'terminal'
 | 'spill'
 | 'open-project'
 | 'unspill'
 | 'paint'
export type CustomCursorSetter = (_cursorState:CustomCursorState)=>void
export type CustomCursorArray = [CustomCursorState, CustomCursorSetter]

export const CustomCursorContext = createContext<CustomCursorArray>([
  'normal',
  (cursorState:CustomCursorState) => { console.warn(`Tried to set custom cursor to ${cursorState} outside of <CustomCursorProvider>`); },
]);

/**
 * @returns [cursorState, setCursorState]
 */
export const useCustomCursor = () => useContext(CustomCursorContext);

export function CustomCursorProvider({ children }:{children:ReactNode}) {
  const mouse = useMouse();
  const [cursor, setCursor] = useState<CustomCursorState>('normal');

  const customCursorStateArray = useMemo(() => [cursor, setCursor] as CustomCursorArray, [cursor]);

  const hasNoMouse = useHasNoMouse();

  const disabledByParam = useParamOnLoad('cursor', 'true') === 'false';

  const enabled = !hasNoMouse && !disabledByParam;

  const textCusor = cursor !== 'terminal' && cursor !== 'paint';

  return (
    <>
      <style>
        {enabled && `* {
          cursor: none !important;
        }`}
      </style>
      <CustomCursorContext.Provider value={customCursorStateArray}>
        {children}
      </CustomCursorContext.Provider>
      {enabled ? (
        <div
          className="pointer-events-none fixed top-0 left-0 z-[99999999]"
          style={{
            transform: `translate(${mouse.clientX ?? 0}px,${mouse.clientY ?? 0}px)`,
            filter: textCusor ? 'drop-shadow(0 0 0.2rem black) drop-shadow(0 0 0.2rem black)' : 'drop-shadow(0 0 0.1rem black) drop-shadow(0 0 0.1rem black)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {cursor === 'terminal' && <img className="w-[30px]" src="/cursor/terminal.svg" alt="" />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {cursor === 'paint' && <img className="w-[45px]" src="/cursor/paint.svg" alt="" />}
          <div
            className={`
              bg-contain bg-center
              font-mono text-white text-center leading-[0.8] text-[12px]
              -translate-x-1/2 -translate-y-1/2
              h-[75px] w-[75px]
              transition-all
              ${cursor === 'normal' ? 'scale-[0.25]' : ''}
              ${!textCusor ? 'opacity-0' : ''}
              grid place-items-center`}
            style={{ backgroundImage: 'url(/cursor/circle.svg)' }}
          >
            {cursor === 'computer-on' && (
              <>
                boot up
              </>
            )}
            {cursor === 'contact' && (
              <>
                say hi!
              </>
            )}
            {cursor === 'spill' && (
              <>
                spill
              </>
            )}
            {cursor === 'unspill' && (
              <>
                unspill
              </>
            )}
            {cursor === 'open-project' && (
              <>
                explore
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

export function CustomCursorHover({ children, cursor: targetCursor, defaultCursor = 'normal' }:
  { children: ReactElement; cursor: CustomCursorState; defaultCursor?:CustomCursorState }) {
  const setCursor = useCustomCursor()[1];
  const child = Children.only(children);
  const [hovering, setHovering] = useState(false);

  // If hovering and the targetcursor changes, call setCursor to change the cursor
  useEffect(() => {
    if (hovering) setCursor(targetCursor);
  }, [targetCursor]);

  return React.cloneElement(child, {
    onMouseEnter: () => {
      setCursor(targetCursor);
      setHovering(true);
    },
    onMouseLeave: () => {
      setCursor(defaultCursor);
      setHovering(false);
    },
  });
}
