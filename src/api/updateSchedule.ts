import { mutate } from "swr";
import { ScheduleStorage } from "../type/storage";
import { getStorage, setStorage } from "./storage";
import getUserKey from "./userKey";
import { write } from "./backup";

export async function updateSchedule(scheduleStorage: ScheduleStorage) {
    await setStorage<ScheduleStorage>("schedule", scheduleStorage);
    await write(
        "schedule",
        await getUserKey(),
        await getStorage<ScheduleStorage>("schedule")
    );
    mutate("schedule", scheduleStorage);
}
