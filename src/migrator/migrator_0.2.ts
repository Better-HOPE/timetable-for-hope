import produce from "immer";
import fetchEnrolledCourse from "../api/fetchEnrolledCourse";
import { getStorage, setStorage } from "../api/storage";
import Course from "../type/course";
import Schedule, { initialSchedule } from "../type/Schedule";
import { ScheduleStorage } from "../type/storage";

type v0_2ConfigType = {
  [courseId: string]: { dayIndex: number; unitIndex: number }[];
};

export default async function migratorForV0_2(): Promise<void> {
  const oldConfigJSON = localStorage.getItem("hopemod__scheduleMap");
  if (oldConfigJSON === null) {
    return;
  }

  console.log("migrating from v0.2");

  const oldConfig: v0_2ConfigType = JSON.parse(oldConfigJSON);
  const courses = await fetchEnrolledCourse();

  if (!courses) {
    return;
  }

  console.log("all materials loaded");

  const maySchedule = await getStorage<ScheduleStorage>("schedule");
  const schedule: Schedule = maySchedule?.schedule ?? initialSchedule;

  const courseMap: { [id: number]: Course } = {};

  courses.forEach((course) => {
    courseMap[course.id] = course;
  });

  console.log("all materials prepared")

  const newSchedule = produce(schedule, (draft) => {
    Object.entries(oldConfig).forEach(([courseId, oldSchedule]) => {
      oldSchedule.forEach((e) => {
        const course = courseMap[parseInt(courseId, 10)];
        if (!course) {
          return;
        }
        draft[e.dayIndex].schedule[e.unitIndex].list.push(
          course
        );
      });
    });
  });

  console.log("convert done")

  console.log(newSchedule);

  setStorage<ScheduleStorage>("schedule", {schedule: newSchedule});

  console.log("work saved");

  localStorage.removeItem("hopemod__scheduleMap");
}
