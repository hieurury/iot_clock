import { defineStore } from 'pinia';
import { addAlarm, getAlarms } from '../services/api'; // Giả sử api.ts giữ nguyên hàm gửi chuỗi

export interface AlarmItem {
    id: number;
    time: string;   // "07:30"
    enable: boolean;
    day: number;    // Bitmask: 0=CN, 1=T2... (Ví dụ: 65 = T7+CN)
}

export const useAlarmStore = defineStore('alarm', {
    state: () => ({
        alarms: [] as AlarmItem[],
        loading: false,
    }),
    actions: {
        // 1. LẤY DỮ LIỆU VÀ PARSE JSON
        async fetchAlarms() {
            this.loading = true;
            try {
                // Blynk V4 trả về chuỗi JSON. VD: '[{"id":1,"time":"06:00"...}]'
                const rawData = await getAlarms(); 
                
                if (Array.isArray(rawData) && rawData.length > 0 && rawData[0]) {
                    // Trường hợp API trả về mảng chuỗi 1 phần tử
                    this.alarms = JSON.parse(rawData[0]);
                } else {
                    this.alarms = [];
                }
            } catch (e) {
                console.error("Lỗi parse JSON báo thức:", e);
                this.alarms = [];
            } finally {
                this.loading = false;
            }
        },

        // 2. ĐỒNG BỘ LÊN BLYNK (QUAN TRỌNG)
        async syncToBlynk() {
            try {
                // Chuyển toàn bộ mảng thành chuỗi JSON
                const jsonString = JSON.stringify(this.alarms);
                await addAlarm(jsonString); // Gửi lên V4
                return true;
            } catch (e) {
                console.error("Lỗi gửi báo thức:", e);
                return false;
            }
        },

        // 3. CÁC HÀNH ĐỘNG CƠ BẢN (LOCAL -> SYNC)
        async addAlarm(time: string, day: number) {
            const newId = Date.now(); // Tạo ID duy nhất
            this.alarms.push({ id: newId, time, enable: true, day });
            this.alarms.sort((a, b) => a.time.localeCompare(b.time)); // Sắp xếp theo giờ
            return await this.syncToBlynk();
        },

        async toggleAlarm(id: number, val: boolean) {
            const alarm = this.alarms.find(a => a.id === id);
            if (alarm) {
                alarm.enable = val;
                await this.syncToBlynk();
            }
        },

        async removeAlarm(id: number) {
            this.alarms = this.alarms.filter(a => a.id !== id);
            await this.syncToBlynk();
        }
    }
});