type Course = {
  id: number;
  viewurl: string;
  fullname: string;
};

export type CourseMetaData = {
  course: Course;
  dayIndex?: number;
  unitIndex?: number;
};

export default Course;
