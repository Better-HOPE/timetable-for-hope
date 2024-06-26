import Course from "../type/course";

export default function reduceCourse({
  id,
  viewurl,
  fullname,
  coursecategory,
}: Course): Course {
  return {
    id,
    viewurl,
    fullname,
    coursecategory,
  };
}
