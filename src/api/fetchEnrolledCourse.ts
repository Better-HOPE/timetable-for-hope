import Course from "../type/course";

async function getSessionKey(): Promise<string> {
  const logoutAnchor = [...document.getElementsByTagName("a")].filter((elm) =>
    elm.href.startsWith("https://hope.fun.ac.jp/login/logout.php")
  );

  if (logoutAnchor.length === 0 || !logoutAnchor[0]) {
    throw new Error("Failed to get session key; failed to find logout anchor");
  }

  const url = new URL(logoutAnchor[0].href);

  const maySessionKey = url.searchParams.get("sesskey");

  if (!maySessionKey) {
    throw new Error(
      "Failed to get session key; failed to find sesskey search param"
    );
  }
  return maySessionKey;
}

export default async function fetchEnrolledCourse(
  offset: number = 0,
  depth: number = 0
): Promise<Course[] | undefined> {
  // NOTE: limitが100でdepthが0~4だからだいたい400件までとれるはず
  if (depth > 5) {
    throw new Error("Fetching enrolled course depth max limit exceeds!");
  }

  const result = await fetch(
    `https://hope.fun.ac.jp/lib/ajax/service.php?sesskey=${await getSessionKey()}&info=core_course_get_enrolled_courses_by_timeline_classification`,
    {
      credentials: "include",
      headers: {
        "Accept-Language": "ja",
        "Content-Type": "application/json",
        "Cache-Control": "max-age=0",
      },
      referrer: "https://hope.fun.ac.jp/my/",
      body: JSON.stringify([
        {
          index: 0,
          methodname:
            "core_course_get_enrolled_courses_by_timeline_classification",
          args: {
            offset: offset,
            limit: 100,
            classification: "all",
            sort: "fullname",
            customfieldname: "",
            customfieldvalue: "",
          },
        },
      ]),
      method: "POST",
      mode: "cors",
    }
  );
  if (!result.ok) {
    return undefined;
  }
  const json = await result.json();
  if (json[0].error) {
    return undefined;
  }

  // OPTIMIZE: JSには末尾再帰最適化はないはずだけど最適化してもいいかも
  if (json[0].data.courses.length !== 0) {
    const next = await fetchEnrolledCourse(json[0].data.nextoffset, depth + 1);

    if (next) {
      return [...json[0].data.courses, ...next];
    }
  }

  return json[0].data.courses;
}
