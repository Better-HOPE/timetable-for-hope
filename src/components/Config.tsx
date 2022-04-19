import { h } from "preact";
import { useCallback } from "preact/hooks";
import useSWR, { useSWRConfig } from "swr";
import { getStorage, setStorage } from "../api/storage";
import { ScheduleStorage } from "../type/storage";

const ConfigCheckboxElement = ({id, label}: {id: string, label: string}) => {
  const {data: value, mutate} = useSWR<boolean>(id, getStorage);

  const handleChange = useCallback((ev: any) => {
    setStorage(id, ev.currentTarget.checked);
    mutate(ev.currentTarget.checked);
  }, [id, mutate]);

  return <div>
    <label><input type="checkbox" checked={value} onChange={handleChange} />{label}</label>
  </div>
}

export default function Config() {
  const {mutate} = useSWRConfig();
  const handleExportConfig = useCallback(async () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(await getStorage<ScheduleStorage>("schedule")));
    } catch(e) {
      alert("時間割のデータをクリップボードにコピーできませんでした")
    }
    alert("時間割のデータをクリップボードにコピーしました");
  }, []);

  const handleImportSubmit = useCallback(async (ev: any) => {
    ev.preventDefault();
    const paste = ev.target.elements.import_text.value;
    try {
      if (paste === "") {
        throw "テキストボックスにエクスポート結果を貼り付けしてください";
      }
      const schedule = JSON.parse(paste);
      await setStorage<ScheduleStorage>("schedule", schedule);
      alert("時間割をインポートしました");
      mutate("schedule");
    } catch(e) {
      alert(`時間割のデータのインポートに失敗しました(${e.toString()})`);
    }
  }, [mutate]);

  return (
    <details style={{textAlign: "right"}}>
      <summary>設定</summary>
      <h2>移行とバックアップ</h2>
      <button style={{marginBottom: "1em"}} onClick={handleExportConfig}>時間割をエクスポート</button>
      <form action="GET" onSubmit={handleImportSubmit}>
        <div>
          <textarea name="import_text" placeholder="エクスポートした時間割を貼り付け…"/>
        </div>
        <div>
          <button>時間割を上書きしてインポート</button>
        </div>
      </form>
    </details>
  )
}
