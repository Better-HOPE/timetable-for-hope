import { ComponentChild, h } from "preact";

type ContextMenuItemProps = {
  className?: string;
  onClick?: (ev: MouseEvent) => void;
  children?: ComponentChild;
};

export default function ContextMenuItem({
  className,
  children,
  onClick,
}: ContextMenuItemProps) {
  return (
    <button
      className={`${className ?? "hopemod__ContextMenuItem"}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
