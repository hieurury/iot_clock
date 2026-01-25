import { defineStore } from 'pinia';
import { getAlarms, updateAlarm, deleteAlarm } from '../services/api';

export interface AlarmItem {
    id: number;
    time: string;
    enable: boolean;
    day: number; // -1: Hằng ngày, 0: CN, 1: T2...
}

export const useAlarmStore = defineStore('alarm', {
    state: () => ({
        alarms: [] as AlarmItem[],
        loading: false,
    }),
    actions: {
        async fetchAlarms() {
            this.loading = true;
            try {
                const data = await getAlarms();
                this.alarms = [];
                if (data) {
                    Object.keys(data).forEach(key => {
                        const idx = parseInt(key);
                        const item = data[key];
                        if (item && item.time) {
                            this.alarms.push({
                                id: idx,
                                time: item.time,
                                enable: item.enable,
                                day: item.day ?? -1 // Mặc định là -1 nếu thiếu
                            });
                        }
                    });
                    this.alarms.sort((a, b) => a.time.localeCompare(b.time));
                }
            } catch (e) { console.error(e); } 
            finally { this.loading = false; }
        },

        async toggleAlarm(id: number, newVal: boolean) {
            const alarm = this.alarms.find(a => a.id === id);
            if (alarm) {
                alarm.enable = newVal;
                await updateAlarm(id, {
                    time: alarm.time,
                    enable: newVal,
                    day: alarm.day // Giữ nguyên ngày cũ
                });
            }
        },

        // [CẬP NHẬT] Thêm tham số day
        async addAlarm(time: string, day: number) {
            const usedIds = this.alarms.map(a => a.id);
            let newId = -1;
            for (let i = 0; i < 5; i++) {
                if (!usedIds.includes(i)) {
                    newId = i;
                    break;
                }
            }

            if (newId === -1) {
                alert("Đã đạt giới hạn 5 báo thức!");
                return false;
            }

            // Gửi dữ liệu đầy đủ
            const newAlarm = { time, enable: true, day: day };
            await updateAlarm(newId, newAlarm);
            await this.fetchAlarms();
            return true;
        },

        async removeAlarm(id: number) {
            await deleteAlarm(id);
            await this.fetchAlarms();
        }
    }
});