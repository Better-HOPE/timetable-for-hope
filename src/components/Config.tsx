import { h, Fragment } from "preact";
import { useCallback, useState } from "preact/hooks";
import useSWR, { useSWRConfig } from "swr";
import { read, write } from "../api/backup";
import { getStorage, setStorage } from "../api/storage";
import getUserKey from "../api/userKey";
import { initialSchedule } from "../type/Schedule";
import { ScheduleStorage } from "../type/storage";

const ConfigCheckboxElement = ({
  id,
  label,
  reversed,
}: {
  id: string;
  label: string;
  reversed?: boolean;
}) => {
  const { data: value, mutate } = useSWR<boolean | null>(id, (id) =>
    getStorage(id)
  );

  const handleChange = useCallback(
    (ev: any) => {
      const changedValue = reversed
        ? !ev.currentTarget.checked
        : ev.currentTarget.checked;
      setStorage(id, changedValue);
      mutate(changedValue);
    },
    [id, reversed, mutate]
  );

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={reversed ? !(value ?? false) : value ?? false}
          onChange={handleChange}
        />
        {label}
      </label>
    </div>
  );
};

export default function Config() {
  const [message, setMessage] = useState<string | null>(null);
  const { mutate } = useSWRConfig();
  const handleExportConfig = useCallback(async () => {
    try {
      navigator.clipboard.writeText(
        JSON.stringify(await getStorage<ScheduleStorage>("schedule"))
      );
    } catch (e) {
      setMessage("時間割のデータをクリップボードにコピーできませんでした");
    }
    setMessage("時間割のデータをクリップボードにコピーしました");
  }, []);

  const handleImportSubmit = useCallback(
    async (ev: any) => {
      ev.preventDefault();
      const paste = ev.target.elements.import_text.value;
      try {
        if (paste === "") {
          throw "テキストボックスにエクスポート結果を貼り付けしてください";
        }
        const schedule = JSON.parse(paste);
        await setStorage<ScheduleStorage>("schedule", schedule);
        setMessage("時間割をインポートしました");
        mutate("schedule");
      } catch (e) {
        setMessage(`時間割のデータのインポートに失敗しました(${e.toString()})`);
      }
    },
    [mutate]
  );

  const handleUpload = useCallback(async () => {
    setMessage("時間割をアップロードしています…");
    try {
      await write(
        "schedule",
        await getUserKey(),
        await getStorage<ScheduleStorage>("schedule")
      );
      setMessage("時間割をアップロードしました");
    } catch (e) {
      setMessage(`時間割のアップロードに失敗しました(${e.toString()})`);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    setMessage("時間割をダウンロードしています…");

    try {
      const result = await read<ScheduleStorage>(
        "schedule",
        await getUserKey()
      );
      if (result) {
        await setStorage<ScheduleStorage>("schedule", result);
        setMessage("時間割をダウンロードしました");
        mutate("schedule");
      } else {
        throw "時間割のダウンロードに失敗しました。アップロードしましたか？";
      }
    } catch (e) {
      setMessage(`時間割のダウンロードに失敗しました(${e.toString()})`);
    }
  }, [mutate]);

  const { data: userKey } = useSWR<string>("userKey", () => getUserKey());

  const handleUserKeySubmit = useCallback(
    async (ev: any) => {
      ev.preventDefault();
      const newUserKey = ev.target.elements.user_key.value;

      try {
        await setStorage<string>("userKey", newUserKey);
        mutate("userKey");
      } catch (e) {
        setMessage("ユーザーキーの設定に失敗しました");
      }
    },
    [mutate]
  );

  const resetClassesSchedule = useCallback(() => {
    const newScheduleStorage = {
      schedule: initialSchedule,
      lastUpdate: Date.now(),
    };
    setStorage<ScheduleStorage>("schedule", newScheduleStorage);
    mutate("schedule");
  }, [mutate]);

  return (
    <details style={{ textAlign: "right" }}>
      <summary>設定</summary>
      <h2>表示</h2>
      <ConfigCheckboxElement
        id="config_compact"
        label="コンパクト表示(モバイル向け)を使用する"
      />
      <ConfigCheckboxElement
        id="open_in_same_tab"
        label="コースを別のタブで開く"
        reversed
      />
      <h2>移行とバックアップ</h2>
      <button style={{ marginBottom: "1em" }} onClick={handleExportConfig}>
        時間割をエクスポート
      </button>
      <form action="GET" onSubmit={handleImportSubmit}>
        <div>
          <textarea
            name="import_text"
            placeholder="エクスポートした時間割を貼り付け…"
          />
        </div>
        <div>
          <button>時間割を上書きしてインポート</button>
        </div>
      </form>
      <hr />
      <h2>同期</h2>
      <button onClick={handleUpload}>時間割データをアップロード</button>
      <button onClick={handleDownload}>
        時間割データをダウンロードして上書き
      </button>
      <details>
        <summary>ユーザーキーの設定を開く</summary>
        <form action="GET" onSubmit={handleUserKeySubmit}>
          <label>
            ユーザーキー(通常変更する必要はありません):
            <input
              name="user_key"
              value={userKey}
              placeholder="デフォルトのユーザーキーを使用…"
            />
            <button>保存</button>
          </label>
        </form>
        <div>使用中のユーザーキー: {userKey}</div>
      </details>
      <hr />
      <h2>リセット</h2>
      <button onClick={resetClassesSchedule}>時間割をリセットする</button>
      <hr />
      {message && (
        <>
          <div className="hopemod__CourseCard">{message ?? ""}</div>
          <hr />
        </>
      )}
      <div>
        TimeTable for HOPE version {VERSION}({TARGET})
      </div>
    </details>
  );
}
