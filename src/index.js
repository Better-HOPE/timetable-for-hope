/* tinydom */
t = (name) => (attributes) => (children) => {
  const elm = document.createElement(name);
  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      if (key === "className") {
        elm.setAttribute("class", attributes[key]);
      } else if (key.slice(0, 2) === "on") {
        elm.addEventListener(key.slice(2), attributes[key])
      } else {
        elm.setAttribute(key, attributes[key]);
      }
    });
  }
  if (children) {
    if (typeof children === "string" || typeof children === "number") {
      elm.appendChild(document.createTextNode(children))
    } else {
      children.forEach(child => {
        if (typeof child === "string") {
          elm.appendChild(document.createTextNode(child))
        } else {
          elm.appendChild(child)
        }
      });
    }
  }
  return elm;
}

["h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "div", "span", "input", "button", "ul", "ol", "li", "table", "tbody", "thead", "th", "tr", "td", "style", "details", "summary"].forEach(e => t[e] = t(e))
t.text = (text) => document.createTextNode(text);

(async () => {
  console.log("document", document);

  document.body.appendChild(t.style()(`
    .hopemod__container {
      background-color: #fff;
      border: 1px solid rgba(0,0,0,.125);
      padding: 1rem;
      margin-bottom: 20px;
    }
    .hopemod__CourseCard {
      display: block;
      margin: 0.5em;
      padding: 0.5em;
      border: solid 1px #999;
      background-color: #fff;
      color: #333;
    }
    .hopemod__TrashCan {
      position: absolute;
      display: inline-block;
      top: 10px;
      left: 10px;
      background-color: #e33;
      color: #fff;
      padding: 10px;
    }

    .hopemod__TimeTable {
      position: relative;
      width: calc(100% - 1em);
      margin: 0.5em;
      table-layout: fixed;
    }
    .hopemod__TimeTable td {
      border: solid 1px #999;
      margin-bottom: 1rem;
    }
    .hopemod__TimeTable tbody tr th:before { /* NOTE: https://blog.w0s.jp/281 */
      display: block;
      float: left;
      height: 5em;
      content: "";
    }
  `));

  const getSessionKey = async () => {
    const logoutAnchor = [...document.getElementsByTagName("a")].filter(elm => elm.href.startsWith("https://hope.fun.ac.jp/login/logout.php"));

    if (logoutAnchor.length === 0 || !logoutAnchor[0]) {
      throw new Error("Failed to get session key; failed to find logout anchor");
    }

    const url = new URL(logoutAnchor[0].href);

    const maySessionKey = url.searchParams.get("sesskey");

    if (!maySessionKey) {
      throw new Error("Failed to get session key; failed to find sesskey search param");
    }
    return maySessionKey;
  }

  const fetchEnrolledCourse = async () => {
    const result = await fetch(`https://hope.fun.ac.jp/lib/ajax/service.php?sesskey=${await getSessionKey()}&info=core_course_get_enrolled_courses_by_timeline_classification`, {
      "credentials": "include",
      "headers": {
        "Accept-Language": "ja",
        "Content-Type": "application/json",
        "Cache-Control": "max-age=0"
      },
      "referrer": "https://hope.fun.ac.jp/my/",
      "body": JSON.stringify([{ "index": 0, "methodname": "core_course_get_enrolled_courses_by_timeline_classification", "args": { "offset": 0, "limit": 0, "classification": "all", "sort": "fullname", "customfieldname": "", "customfieldvalue": "" } }]),
      "method": "POST",
      "mode": "cors"
    });
    if (!result.ok) {
      return undefined;
    }
    const json = await result.json();
    if (json?.[0]?.error) {
      return undefined;
    }
    return json?.[0]?.data?.courses;
  }

  let courses = null

  const calendar = document.createElement("div");
  calendar.className = "hopemod__container"

  let error = null;

  const render = () => {
    console.log("hopemod: re-rendering");

    calendar.innerHTML = "";

    if (error) {
      calendar.innerHTML = `時間割のロードに失敗しました(${error})`;
      return;
    }

    if (!courses) {
      if (localStorage.getItem("hopemod__summaryOpen") === "true") {
        calendar.innerHTML = `<div style="height: 1000px">時間割をロード中</div>`
      } else {
        calendar.innerHTML = `<div style="height: 600px">時間割をロード中</div>`
      }
      return;
    }

    const getClassSchedules = () => {
      const scheduleMapString = localStorage.getItem("hopemod__scheduleMap");
      if (!scheduleMapString) {
        return {};
      }
      const scheduleMap = JSON.parse(scheduleMapString);
      return scheduleMap;
    }
    const searchClassSchedule = (courseId) => {
      return getClassSchedules()[courseId];
    }
    const removeClassSchedule = (courseId, dayIndex, unitIndex) => {
      const original = getClassSchedules();
      const originalSchedule = original[courseId];
      if (!originalSchedule) {
        return;
      }
      localStorage.setItem("hopemod__scheduleMap", JSON.stringify({
        ...original,
        [courseId]: originalSchedule.filter((mayTarget) => (mayTarget.dayIndex !== dayIndex || mayTarget.unitIndex !== unitIndex))
      }));
      render();
    }
    const setClassSchedule = (courseId, dayIndex, unitIndex) => {
      removeClassSchedule(courseId, dayIndex, unitIndex) // NOTE: 重複対策
      const original = getClassSchedules();
      const originalSchedule = original[courseId] || [];
      localStorage.setItem("hopemod__scheduleMap", JSON.stringify({
        ...original,
        [courseId]: [...originalSchedule, { dayIndex, unitIndex }]
      }));
      render();
    }

    const schedule = [..."月火水木金"].map(week => ({
      header: week,
      schedule: [0, 1, 2, 3, 4, 5].map(() => [])
    }));

    const noScheduleCourse = [];

    courses.forEach(course => {
      const schedules = searchClassSchedule(course.id);
      if (!schedules || schedules.length === 0) {
        noScheduleCourse.push(course);
        return;
      }
      schedules.forEach(unit => {
        const { dayIndex, unitIndex } = unit;
        const weekObject = schedule[dayIndex];
        if (!weekObject) {
          console.error("invalid day index", schedules)
          noScheduleCourse.push(course);
          return;
        }

        const unitTimeObject = weekObject?.schedule?.[unitIndex];
        if (!unitTimeObject) {
          console.error("invalid unitTime index", schedules)
          noScheduleCourse.push(course);
          return;
        }
        unitTimeObject.push(course);
      })
    });

    window.hopemod__handleCourseDrop = (ev, dayIndex, unitIndex) => {
      ev.preventDefault();
      const { courseId, dayIndex: origDayIndex, unitIndex: origUnitIndex } = JSON.parse(ev.dataTransfer.getData('application/json'));
      if (origDayIndex === dayIndex && origUnitIndex === unitIndex) {
        return;
      }
      if (origDayIndex !== undefined && origUnitIndex !== undefined) {
        const remove = confirm(`もとのコマ(${schedule[dayIndex].header}曜${origUnitIndex + 1}限)を消しますか?(OK: 消す, キャンセル: 消さない)`);
        if (remove) {
          removeClassSchedule(courseId, origDayIndex, origUnitIndex) // NOTE: 重複対策
        }
      }

      setClassSchedule(courseId, dayIndex, unitIndex);
    }

    window.hopemod__handleCourseRemoveDrop = (ev) => {
      ev.preventDefault();
      const { courseId, dayIndex, unitIndex } = JSON.parse(ev.dataTransfer.getData('application/json'));
      removeClassSchedule(courseId, dayIndex, unitIndex);
    }

    window.hopemod__handleCourseDragStart = (ev, courseId, dayIndex, unitIndex) => {
      const timeTable = document.querySelector("#hopemod__TimeTable") || document.querySelector(".hopemod__TimeTable");
      if (timeTable.scrollIntoView) {
        timeTable.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        location.href = "#hopemod__TimeTable";
      }
      ev.dataTransfer.setData('application/json', JSON.stringify({ courseId, dayIndex, unitIndex }));

      const trashCan = t.div({
        className: "hopemod__TrashCan",
        ondragover: ev => ev.preventDefault(),
        ondrop: ev => window.hopemod__handleCourseRemoveDrop(ev),
        ondragenter: ev => ev.currentTarget.style.boxShadow = 'inset 0px 0px 0px 5px #33ff33',
        ondragleave: ev => ev.currentTarget.style.boxShadow = '',
      })(
        "時間割から削除"
      )
      document.querySelector(".hopemod__TimeTable").appendChild(trashCan);
    }

    window.hopemod__handleCourseDragEnd = (ev, courseId, dayIndex, unitIndex) => {
      document.querySelectorAll(".hopemod__TrashCan").forEach(elm => {
        elm.remove();
      })
    }


    const courseCard = (course, dayIndex, unitIndex) =>
      t.div({
        className: "hopemod__CourseCard",
        draggable: "true",
        ondragstart: event => window.hopemod__handleCourseDragStart(event, course.id, dayIndex, unitIndex),
        ondragend: event => window.hopemod__handleCourseDragEnd(event, course.id, dayIndex, unitIndex)
      })([
        t.a({ href: course.viewurl })(course.fullnamedisplay || course.fullname || "")
      ])

    const currentDayIndex = (new Date()).getDay() - 1;

    calendar.appendChild(
      t.div()([
        t.table({ className: "hopemod__TimeTable", id: "hopemod__TimeTable" })([
          t.thead()([
            t.th({ style: "width: 2rem" })(),
            ...schedule.map((day, dayIndex) => t.th()(day.header))
          ]),
          t.tbody()([
            ...(
              schedule[0].schedule.map((_, unitIndex) => t.tr()([
                t.th()(unitIndex + 1),
                ...schedule.map((day, dayIndex) =>
                  t.td({
                    style: currentDayIndex === dayIndex ? "background-color: #ffcc99" : "",
                    ondragover: event => event.preventDefault(),
                    ondrop: event => window.hopemod__handleCourseDrop(event, dayIndex, unitIndex),
                    ondragenter: event => event.currentTarget.style.boxShadow = "inset 0px 0px 0px 5px #33ff33",
                    ondragleave: event => event.currentTarget.style.boxShadow = "",
                  })([...day.schedule[unitIndex].map(unit => courseCard(unit, dayIndex, unitIndex))])
                )
              ]))
            )
          ]),
        ]),
        t.details({
          ondragover: event => event.preventDefault(),
          ondrop: event => window.hopemod__handleCourseRemoveDrop(event),
          ondragenter: event => event.currentTarget.style.boxShadow = 'inset 0px 0px 0px 5px #33ff33',
          ondragleave: event => event.currentTarget.style.boxShadow = '',
          ontoggle: event => { if (event.target.open) { localStorage.setItem('hopemod__summaryOpen', 'true') } else { localStorage.setItem('hopemod__summaryOpen', 'false') } },
          open: localStorage.getItem("hopemod__summaryOpen")
        })([
          t.summary()("時間割に表示されていないコース"),
          t.div()("ドラッグ&ドロップで時間割に登録することができます"),
          t.ul()([
            ...noScheduleCourse.map(course =>
              t.li()([courseCard(course, undefined, undefined)])
            )
          ])
        ])
      ])
    )
  }

  try {
    const regionMain = document.getElementById("region-main");
    regionMain.insertBefore(calendar, regionMain.firstChild);

    render();

    const gotCourses = await fetchEnrolledCourse()

    if (!gotCourses) {
      throw new Error("hopemod: failed to get enrolled courses");
      return; // Do nothing
    }
    courses = gotCourses;

    render();
  } catch (e) {
    error = e.toString();
    console.error(e);
    render();
  }
})();
