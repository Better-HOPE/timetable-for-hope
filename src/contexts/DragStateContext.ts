import { createContext } from "preact";

const DragStateContext = createContext<{
  handleDragStart: () => void;
  handleDragEnd: () => void;
}>({ handleDragStart: () => {}, handleDragEnd: () => {} });

export default DragStateContext;
