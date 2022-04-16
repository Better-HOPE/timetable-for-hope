import Course from "../type/course";

export default function reduceCourse({
  id,
  viewurl,
  fullname,
}: Course): Course {
  return {
    id,
    viewurl,
    fullname,
  };
}
