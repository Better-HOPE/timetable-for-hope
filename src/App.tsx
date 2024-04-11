import produce from "immer";
import { h } from "preact";
import { useCallback, useErrorBoundary, useMemo, useState } from "preact/hooks";
import useSWR from "swr";
import fetchEnrolledCourse from "./api/fetchEnrolledCourse";
import { getStorage, setStorage } from "./api/storage";
import Config from "./components/Config";
import CourseCard from "./components/CourseCard";
import Style from "./components/Style";
import Table from "./components/Table";
import DragStateContext from "./contexts/DragStateContext";
import Course, { CourseMetaData } from "./type/course";
import Schedule, { initialSchedule } from "./type/Schedule";
import { ScheduleStorage } from "./type/storage";
import groupCourse from "./utils/groupCourse";

export default function App() {
  const { data: scheduleStorage, mutate: mutateSchedule } = useSWR(
    "schedule",
    async (key) => await getStorage<ScheduleStorage>(key)
  );

  const schedule = scheduleStorage?.schedule ?? initialSchedule;

  const { data: course } = useSWR(
    "/lib/ajax/service.php?info=core_course_get_enrolled_courses_by_timeline_classification",
    async () => {
      return await fetchEnrolledCourse();
    }
  );
  const { data: compactDisplay } = useSWR<boolean | null>(
    "config_compact",
    getStorage
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showAllCourse, setShowAllCourse] = useState<boolean>(false);

  const displayCourseList = useMemo(() => {
    if (!schedule) {
      return null;
    }

    if (!course) {
      return null;
    }

    if (showAllCourse) {
      return groupCourse(course);
    }

    const registeredCourse = schedule
      .map((day) => day.schedule.map((unit) => unit.list))
      .flat(2);

    const registeredCourseSet: { [id: string]: boolean } = {};

    registeredCourse.forEach((course) => {
      registeredCourseSet[course.id] = true;
    });

    return groupCourse(
      course.filter((course) => !registeredCourseSet[course.id])
    );
  }, [course, schedule, showAllCourse]);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);
  const onDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

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
      const newScheduleStorage = {
        schedule: newState,
        lastUpdate: Date.now(),
      };
      setStorage<ScheduleStorage>("schedule", newScheduleStorage);
      mutateSchedule(newScheduleStorage);
    },
    [mutateSchedule, schedule]
  );

  const handleChange = useCallback(
    async (newSchedule: Schedule) => {
      const newScheduleStorage = {
        schedule: newSchedule,
        lastUpdate: Date.now(),
      };
      await setStorage<ScheduleStorage>("schedule", newScheduleStorage);
      mutateSchedule(newScheduleStorage);
    },
    [mutateSchedule]
  );

  const handleRemoveAreaDragOver = useCallback((event: any) => {
    event.preventDefault();
  }, []);

  const handleRemoveAreaDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      const { course, dayIndex, unitIndex } = JSON.parse(
        event.dataTransfer.getData("application/json")
      ) as CourseMetaData;
      if (dayIndex === undefined || unitIndex === undefined) {
        return;
      }
      removeClassSchedule(course, dayIndex, unitIndex);
    },
    [removeClassSchedule]
  );

  const handleDragEnter = useCallback((event: any) => {
    event.currentTarget.style.boxShadow = "inset 0px 0px 3px 3px #eee";
  }, []);

  const handleDragLeave = useCallback((event: any) => {
    event.currentTarget.style.boxShadow = "";
  }, []);

  const handleToggleCourseListOption = useCallback(() => {
    setShowAllCourse((current) => !current);
  }, []);

  const [error, resetError] = useErrorBoundary();

  if (error) {
    console.error(error);
    return (
      <div>
        エラーが発生しました。
        <button onClick={() => resetError()}>再試行</button>
      </div>
    );
  }

  return (
    <div className="hopemod__container">
      <Config />
      <DragStateContext.Provider
        value={{ handleDragStart: onDragStart, handleDragEnd: onDragEnd }}
      >
        <Table
          schedule={schedule ?? undefined}
          compact={compactDisplay ?? false}
          onChange={handleChange}
        />
        <details
          onDragOver={handleRemoveAreaDragOver}
          onDrop={handleRemoveAreaDrop}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <summary>講義一覧</summary>
          {!displayCourseList ? (
            <div>ロード中</div>
          ) : (
            <div>
              <label>
                <input
                  type="checkbox"
                  onChange={handleToggleCourseListOption}
                  checked={showAllCourse}
                />
                時間割に追加したコースを含める
              </label>
              <ul>
                {displayCourseList?.map((course) => (
                  <details>
                    <summary>{course.categoryName}</summary>
                    {course.courses.map((course) => (
                      <li key={course.id}>
                        <CourseCard key={course.id} course={course} />
                      </li>
                    ))}
                  </details>
                ))}
              </ul>
            </div>
          )}
        </details>
        <Style />
      </DragStateContext.Provider>
      {isDragging && (
        <div
          className="hopemod__TrashCan"
          onDragOver={handleRemoveAreaDragOver}
          onDrop={handleRemoveAreaDrop}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          削除する
        </div>
      )}
    </div>
  );
}
