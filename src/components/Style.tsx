import { h } from "preact";

export default function Style() {
  return (
    <style>{`
    .hopemod__container {
      position: relative;
      background-color: #fff;
      border: 1px solid rgba(0,0,0,.125);
      padding: 1rem;
      margin-bottom: 20px;
    }
    .hopemod__CourseCard {
      display: block;
      margin: 0.5em;
      padding: 0.5em;
      background-color: #fff;
      color: #333;
      border: solid 0.1rem #eee;
      border-radius: 0.3rem;
      box-shadow: 0 0.1rem 0.2rem rgba(0, 0, 0, 0.1);
    }
    
    .hopemod__TrashCan {
      position: absolute;
      display: inline-block;
      top: 10px;
      left: 10px;
      background-color: #e33;
      color: #fff;
      padding: 10px;
      border: solid 0.1rem #d22;
      border-radius: 0.3rem;
      box-shadow: 0 0.1rem 0.2rem rgba(0, 0, 0, 0.1);
      font-weight: bold;
    }
    .hopemod__TimeTable {
      width: calc(100% - 1em);
      margin: 0.5em;
      table-layout: fixed;
    }
    .hopemod__TimeTable td {
      border: solid 1px #ddd;
      margin-bottom: 1rem;
    }
    .hopemod__TimeTable tbody tr th:before { /* NOTE: https://blog.w0s.jp/281 */
      display: block;
      float: left;
      height: 5em;
      content: "";
    }
  `}</style>
  );
}
