import { createContext } from "preact";

const DragStateContext = createContext<{
  handleDragStart: () => void;
  handleDragEnd: () => void;
}>({
  handleDragStart: () => {
    // DO NOTHING
  },
  handleDragEnd: () => {
    // DO NOTHING
  },
});

export default DragStateContext;
