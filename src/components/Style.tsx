import { h } from "preact";

export default function Style() {
  return <style>{`
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
  `}</style>;
}
