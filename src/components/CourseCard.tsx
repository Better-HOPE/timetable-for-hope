import produce from "immer";
import { h } from "preact";
import { useCallback, useContext } from "preact/hooks";
import useSWR from "swr";
import { getStorage, setStorage } from "../api/storage";
import DragStateContext from "../contexts/DragStateContext";
import useContextMenu from "../hooks/useContextMenu";
import Course, { CourseMetaData } from "../type/course";
import { initialSchedule } from "../type/Schedule";
import { ScheduleStorage } from "../type/storage";
import reduceCourse from "../utils/reduceCourse";
import ContextMenu from "./ContextMenu";
import ContextMenuItem from "./ContextMenuItem";

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

  const { data: scheduleStorage, mutate: mutateSchedule } = useSWR(
    "schedule",
    async (key) => await getStorage<ScheduleStorage>(key)
  );

  const schedule = scheduleStorage?.schedule ?? initialSchedule;

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

  const handleOpenCourse = useCallback(() => {
    document.location = course.viewurl;
  }, [course.viewurl]);

  const removeClassSchedule = useCallback(
    (course: Course, dayIndex: number, unitIndex: number) => {
      if (!schedule) {
        return;
      }
      const newState = produce(schedule, (draft) => {
        draft[dayIndex].schedule[unitIndex].list = draft[dayIndex].schedule[
          unitIndex
        ].list.filter((unit) => unit.id !== course.id);
      });
      const scheduleStorage = {
        schedule: newState,
        lastUpdate: Date.now(),
      };
      setStorage<ScheduleStorage>("schedule", scheduleStorage);
      mutateSchedule(scheduleStorage);
    },
    [mutateSchedule, schedule]
  );

  const handleRemoveSchedule = useCallback(() => {
    if (dayIndex === undefined || unitIndex === undefined) {
      return;
    }
    removeClassSchedule(course, dayIndex, unitIndex);
  }, [course, dayIndex, removeClassSchedule, unitIndex]);

  const { targetProps, contextMenuProps } = useContextMenu();

  return (
    <div
      className="hopemod__CourseCard"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      {...targetProps}
    >
      <a href={course.viewurl}>{course.fullname}</a>
      <ContextMenu {...contextMenuProps}>
        <ContextMenuItem onClick={handleOpenCourse}>
          <i class="fa fa-external-link" /> このコースを開く
        </ContextMenuItem>
        <ContextMenuItem onClick={handleRemoveSchedule}>
          <i class="fa fa-trash" /> このコースを削除する
        </ContextMenuItem>
      </ContextMenu>
    </div>
  );
}
