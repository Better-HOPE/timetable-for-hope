import Course from "./course";

type Schedule = {
  header: string;
  schedule: {
    list: Course[];
  }[];
}[];

export const initialSchedule: Schedule = [..."月火水木金"].map((header) => ({
  header,
  schedule: [1, 2, 3, 4, 5, 6].map(() => ({ list: [] })),
}));

export default Schedule;
