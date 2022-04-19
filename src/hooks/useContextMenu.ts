import { useCallback, useEffect, useRef, useState } from "preact/hooks";

export type MenuItem = {label: string, onClick: () => void};

export default function useContextMenu() {
  const [isContextMenuOpen, setIsContextMenuOpen] = useState<boolean>(false);
  const [x, setX]  = useState(0);
  const [y, setY]  = useState(0);

  const currentTargetRef = useRef<HTMLElement | null>(null);

  const onContextMenuRef = useCallback((ref: HTMLElement | null) => {
    if (!ref) {
      return;
    }

    ref.addEventListener("click", (event: any) => {
      event._contextmenu = true;
    }, {capture: true});
  }, []);
  
  const handleContextMenuEvent = useCallback((ev: any) => {
    ev.preventDefault();
    ev.stopPropagation();
    currentTargetRef.current = ev.currentTarget;
    setIsContextMenuOpen(true);
    setX(ev.clientX);
    setY(ev.clientY);
  }, []);

  const close = useCallback(() => {
    setIsContextMenuOpen(false);
  }, []);

  useEffect(() => {
    const onClick = (ev: any) => {
      if (!ev._contextmenu) {
        setIsContextMenuOpen(false);
      }
    };

    document.body.addEventListener("click", onClick);

    return () => {
      document.body.removeEventListener("click", onClick);
    }
  }, []);

  return {
    close,
    currentTarget: currentTargetRef,
    targetProps: {onContextMenu: handleContextMenuEvent},
    contextMenuProps: {onMount: onContextMenuRef, isOpen: isContextMenuOpen, x, y}
  }
}