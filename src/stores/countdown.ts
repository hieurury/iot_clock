import { defineStore } from 'pinia';
import { 
    addCountdown, 
    cancelCountdown, 
    toggleBuzzer, 
    getBuzzerState 
} from '../services/api';

export const useCountdownStore = defineStore('countdown', {
    state: () => ({
        isRunning: false,
        targetTime: 0,
        remainingSeconds: 0,
        buzzerStatus: 0,
        isFinished: false,
        timerId: null as any,
        syncBuzzerId: null as any,
    }),

    actions: {
        // [SỬA LẠI HÀM NÀY] Nhận vào seconds (giây) thay vì minutes
        async startCountdown(seconds: number) {
            
            // --- SAI (CŨ): Dòng này gây lỗi 5s thành 5 phút ---
            // const durationSecs = seconds * 60; 

            // --- ĐÚNG (MỚI): Giữ nguyên số giây nhận được ---
            const durationSecs = seconds; 
            
            const now = Math.floor(Date.now() / 1000);
            
            this.targetTime = now + durationSecs;
            this.remainingSeconds = durationSecs;
            this.isRunning = true;
            this.isFinished = false;
            this.buzzerStatus = 0;

            this.startLocalTicker();

            // Gửi lệnh lên Blynk
            try {
                // Gửi thẳng số giây lên V3 (Hardware cũng phải sửa để nhận giây)
                await addCountdown(seconds); 
                console.log(`Đã gửi lệnh đếm ngược ${seconds} giây`);
            } catch (e) {
                console.error("Lỗi gửi lệnh Blynk:", e);
            }
        },

        async stopCountdown() {
            this.clearAllTimers();
            this.isRunning = false;
            this.isFinished = false;
            this.remainingSeconds = 0;
            this.buzzerStatus = 0;

            try {
                await Promise.all([toggleBuzzer(false), cancelCountdown()]);
            } catch (e) {}
        },

        startLocalTicker() {
            if (this.timerId) clearInterval(this.timerId);
            this.timerId = setInterval(() => {
                const now = Math.floor(Date.now() / 1000);
                const left = this.targetTime - now;

                if (left > 0) {
                    this.remainingSeconds = left;
                } else {
                    this.remainingSeconds = 0;
                    this.isRunning = false;
                    this.finishCountdown();
                }
            }, 1000);
        },

        finishCountdown() {
            if (this.timerId) clearInterval(this.timerId);
            this.isFinished = true;
            this.buzzerStatus = 1; 
            this.startSyncBuzzer();
        },

        startSyncBuzzer() {
            if (this.syncBuzzerId) clearInterval(this.syncBuzzerId);
            this.syncBuzzerId = setInterval(async () => {
                try {
                    const isOn = await getBuzzerState();
                    if (!isOn && this.isFinished) {
                        this.stopCountdown(); 
                    } else {
                        this.buzzerStatus = isOn ? 1 : 0;
                    }
                } catch (e) {}
            }, 2000); 
        },

        async turnOffBuzzer() {
            await this.stopCountdown();
        },

        clearAllTimers() {
            if (this.timerId) clearInterval(this.timerId);
            if (this.syncBuzzerId) clearInterval(this.syncBuzzerId);
            this.timerId = null;
            this.syncBuzzerId = null;
        }
    }
});