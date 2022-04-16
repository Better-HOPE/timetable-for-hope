import produce from "immer";
import { h } from "preact";
import { useCallback, useErrorBoundary } from "preact/hooks";
import Course, { CourseMetaData } from "../type/course";
import Schedule from "../type/Schedule";
import CourseCard from "./CourseCard";

type TableProps = {
  schedule?: Schedule;
  onChange: (_: Schedule) => void;
};

export default function Table({ schedule, onChange }: TableProps) {
  const setClassSchedule = useCallback(
    (course: Course, dayIndex: number, unitIndex: number) => {
      if (!schedule) {
        return;
      }
      const newState = produce(schedule, (draft) => {
        draft[dayIndex].schedule[unitIndex].list = draft[dayIndex].schedule[
          unitIndex
        ].list.filter((unit) => unit.id !== course.id);
        draft[dayIndex].schedule[unitIndex].list.push(course);
      });
      onChange && onChange(newState);
    },
    [onChange, schedule]
  );

  const moveClassSchedule = useCallback(
    (
      course: Course,
      dayIndex: number,
      unitIndex: number,
      origDayIndex: number,
      origUnitIndex: number
    ) => {
      if (!schedule) {
        return;
      }
      const newState = produce(schedule, (draft) => {
        draft[origDayIndex].schedule[origUnitIndex].list = draft[
          origDayIndex
        ].schedule[origUnitIndex].list.filter((unit) => unit.id !== course.id);
        draft[dayIndex].schedule[unitIndex].list = draft[dayIndex].schedule[
          unitIndex
        ].list.filter((unit) => unit.id !== course.id);
        draft[dayIndex].schedule[unitIndex].list.push(course);
      });
      onChange && onChange(newState);
    },
    [onChange, schedule]
  );

  const todayDayIndex = new Date().getDay() - 1;

  const handleDragOver = useCallback((event: any) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      if (!schedule) {
        return;
      }
      const target = event.currentTarget;
      target.style.boxShadow = "";
      const dayIndex =
        target.dataset.dayIndex !== undefined
          ? parseInt(target.dataset.dayIndex, 10)
          : undefined;
      const unitIndex =
        target.dataset.unitIndex !== undefined
          ? parseInt(target.dataset.unitIndex, 10)
          : undefined;

      if (dayIndex === undefined || unitIndex === undefined) {
        alert("invalid drop");
        return;
      }

      const {
        course,
        dayIndex: origDayIndex,
        unitIndex: origUnitIndex,
      } = JSON.parse(
        event.dataTransfer.getData("application/json")
      ) as CourseMetaData;
      if (origDayIndex === dayIndex && origUnitIndex === unitIndex) {
        return;
      }
      if (origDayIndex === undefined || origUnitIndex === undefined) {
        setClassSchedule(course, dayIndex, unitIndex);
      } else {
        moveClassSchedule(
          course,
          dayIndex,
          unitIndex,
          origDayIndex,
          origUnitIndex
        );
      }
    },
    [schedule, setClassSchedule, moveClassSchedule]
  );

  const handleDragEnter = useCallback((event: any) => {
    event.currentTarget.style.boxShadow = "inset 0px 0px 3px 3px #eee";
  }, []);

  const handleDragLeave = useCallback((event: any) => {
    event.currentTarget.style.boxShadow = "";
  }, []);

  // placeholder
  if (!schedule) {
    return <div style={{ height: "500px", backgroundColor: "#eee" }} />;
  }

  return (
    <table className="hopemod__TimeTable">
      <thead>
        <th style={{ width: "2em" }} />
        {schedule.map((day, dayIndex) => (
          <th key={dayIndex}>{day.header}</th>
        ))}
      </thead>
      <tbody>
        {schedule[0].schedule.map((_, unitIndex) => (
          <tr key={unitIndex}>
            <th>
              <div>{unitIndex + 1}</div>
            </th>
            {schedule.map((day, dayIndex) => (
              <td
                key={dayIndex}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                data-day-index={dayIndex}
                data-unit-index={unitIndex}
                style={{
                  backgroundColor: todayDayIndex === dayIndex ? "#ffddaa" : "",
                }}
              >
                {day.schedule[unitIndex].list.map((course, i) => (
                  <CourseCard
                    key={i}
                    course={course}
                    dayIndex={dayIndex}
                    unitIndex={unitIndex}
                  />
                ))}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
