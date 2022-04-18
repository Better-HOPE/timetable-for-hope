import { h } from "preact";
import { useCallback, useContext } from "preact/hooks";
import DragStateContext from "../contexts/DragStateContext";
import Course, { CourseMetaData } from "../type/course";
import reduceCourse from "../utils/reduceCourse";

type CourseCardProps = {
  course: Course;
  dayIndex?: number;
  unitIndex?: number;
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

export default function CourseCard({
  course,
  dayIndex,
  unitIndex,
  onDragStart,
  onDragEnd,
}: CourseCardProps) {
  const {
    handleDragStart: registerHandleDragStart,
    handleDragEnd: registerHandleDragEnd,
  } = useContext(DragStateContext);

  const handleDragStart = useCallback(
    (ev: any) => {
      const timeTable =
        document.querySelector("#hopemod__TimeTable") ||
        document.querySelector(".hopemod__TimeTable");
      if (timeTable) {
        if (timeTable.scrollIntoView) {
          timeTable.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          location.href = "#hopemod__TimeTable";
        }
      }
      ev.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          course: reduceCourse(course),
          dayIndex,
          unitIndex,
        } as CourseMetaData)
      );
      registerHandleDragStart();
      onDragStart && onDragStart();
    },
    [course, dayIndex, onDragStart, registerHandleDragStart, unitIndex]
  );

  const handleDragEnd = useCallback(() => {
    registerHandleDragEnd();
    onDragEnd && onDragEnd();
  }, [onDragEnd, registerHandleDragEnd]);
  return (
    <div
      className="hopemod__CourseCard"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <a href={course.viewurl}>{course.fullname}</a>
    </div>
  );
}
