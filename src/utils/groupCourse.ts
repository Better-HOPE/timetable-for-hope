import Course from "../type/course";

type CourseGroup = {
  courses: Course[];
  categoryName: string;
};

function getOrCreate<T, U>(map: Map<T, U>, key: T, defaultValue: () => U) {
  const existed = map.get(key);

  if (existed) {
    return existed;
  }

  const newItem = defaultValue();

  map.set(key, newItem);

  return newItem;
}

export default function groupCourse(courses: Course[]): CourseGroup[] {
  const grouped: Map<string | undefined, CourseGroup> = new Map();

  courses.forEach((course) => {
    const categoryName = course.coursecategory ?? "未設定";

    const group = getOrCreate(grouped, categoryName, () => ({
      courses: [],
      categoryName,
    }));

    group.courses.push(course);
  });

  return [...grouped.values()];
}
