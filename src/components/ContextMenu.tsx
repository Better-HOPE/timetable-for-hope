import { ComponentChildren, h } from "preact";
import { MenuItem } from "../hooks/useContextMenu";

type ContextMenuProps = {
  x: number;
  y: number;
  isOpen: boolean;
  onMount: (ref: HTMLDivElement) => void;
  menuItems?: MenuItem[];
  children?: ComponentChildren;
};

export default function ContextMenu({
  isOpen,
  onMount,
  x,
  y,
  children,
}: ContextMenuProps) {
  if (!isOpen) {
    return null;
  }
  return (
    <div
      className="hopemod__ContextMenu"
      style={{ left: x, top: y }}
      ref={onMount}
    >
      {children}
    </div>
  );
}
