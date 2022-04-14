import produce from "immer";
import { h } from "preact";
import { useCallback, useEffect, useErrorBoundary, useState } from "preact/hooks";
import fetchEnrolledCourse from "./api/fetchEnrolledCourse";
import { getStorage, setStorage } from "./api/storage";
import CourseCard from "./components/CourseCard";
import Style from "./components/Style";
import Table from "./components/Table";
import Course, { CourseMetaData } from "./type/course";
import Schedule, { initialSchedule } from "./type/Schedule";
import { ScheduleStorage } from "./type/storage";

export default function App() {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [course, setCourse] = useState<Course[] | null>(null);

  const onMount = () => {
    (async () => {
      const maySchedule = await getStorage<ScheduleStorage>("schedule");
      const schedule: Schedule = maySchedule?.schedule ?? initialSchedule;
      setSchedule(schedule);

      const course = await fetchEnrolledCourse();

      setCourse(() => course ?? null);
    })();
  };

  const removeClassSchedule = useCallback(
    (course: Course, dayIndex: number, unitIndex: number) => {
      if (!schedule) {
        return
      }
      const newState = produce(schedule, (draft) => {
        draft[dayIndex].schedule[unitIndex].list = draft[dayIndex].schedule[unitIndex].list.filter((unit) => unit.id !== course.id);
      });
      setSchedule(newState);
      setStorage<ScheduleStorage>("schedule", {schedule: newState});
    },
    [schedule]
  );


  const handleChange = useCallback((newSchedule: Schedule) => {
    setSchedule(newSchedule);
    setStorage<ScheduleStorage>("schedule", {schedule: newSchedule});
  }, []);

  const handleRemoveAreaDragOver = useCallback((event: any) => {
    event.preventDefault();
  }, []);

  const handleRemoveAreaDrop = useCallback((event: any) => {
    event.preventDefault();
    const {
      course,
      dayIndex,
      unitIndex
    } = JSON.parse(
      event.dataTransfer.getData("application/json")
    ) as CourseMetaData;
    if (dayIndex === undefined || unitIndex === undefined) {
      return;
    }
    removeClassSchedule(course, dayIndex, unitIndex);
  }, [removeClassSchedule]);

  useEffect(onMount, []);

  const [error, resetError] = useErrorBoundary();

  if (error) {
    return <div>エラーが発生しました。<button onClick={() => resetError()}>再試行</button></div>
  }

  return (
    <div className="hopemod__container">
      <Table schedule={schedule ?? undefined} onChange={handleChange} />
      <details onDragOver={handleRemoveAreaDragOver} onDrop={handleRemoveAreaDrop}>
        <summary>講義一覧</summary>
        {course ? null : <div>ロード中</div>}
        {course?.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </details>
      <Style />
    </div>
  );
}
