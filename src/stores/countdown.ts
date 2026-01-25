import { defineStore } from 'pinia';
import { 
    getCountdown, setCountdown, resetCountdown, 
    getBuzzerStatus, setBuzzerStatus, 
    setState // Đảm bảo api.ts của bạn đã có hàm này
} from '../services/api';

export const useCountdownStore = defineStore('countdown', {
    state: () => ({
        status: false,
        target: 0,
        time: 0,
        buzzerStatus: 0,
        isTimeUp: false,
        intervalId: null as any,
        buzzerCheckId: null as any,
    }),
    actions: {
        // 1. BẮT ĐẦU ĐẾM -> CHUYỂN MÀN HÌNH SANG SỐ 2
        async startNewCountdown(durationSeconds: number) {
            const nowSeconds = Math.floor(Date.now() / 1000);
            const targetTime = nowSeconds + durationSeconds;
            
            this.status = true;
            this.target = targetTime;
            this.time = durationSeconds;
            this.isTimeUp = false;
            
            this.startLocalTicker();

            try {
                // Gửi lệnh song song: Set thời gian đếm + Chuyển màn hình LED (State 2)
                await Promise.all([
                    setCountdown({ target: targetTime, status: true }),
                    setState(2) 
                ]);
            } catch (e) { console.error(e); }
        },

        startLocalTicker() {
            if (this.intervalId) clearInterval(this.intervalId);
            const tick = () => {
                const now = Math.floor(Date.now() / 1000);
                const remaining = this.target - now;
                if (remaining > 0) {
                    this.time = remaining;
                } else {
                    // Hết giờ
                    this.time = 0;
                    this.status = false;
                    this.isTimeUp = true;
                    this.buzzerStatus = 1;
                    if (this.intervalId) clearInterval(this.intervalId);
                    
                    // Chờ 3s để mạch đồng bộ xong mới bắt đầu check còi
                    setTimeout(() => { if (this.isTimeUp) this.startBuzzerMonitor(); }, 3000);
                }
            };
            tick();
            this.intervalId = setInterval(tick, 1000);
        },

        startBuzzerMonitor() {
            if (this.buzzerCheckId) clearInterval(this.buzzerCheckId);
            this.buzzerCheckId = setInterval(async () => {
                try {
                    const status = await getBuzzerStatus();
                    // Nếu Web đang kêu mà Server đã tắt (do bấm nút cứng) -> Tắt Web
                    if (this.isTimeUp && status === 0) {
                        this.turnOffBuzzer();
                    } else {
                        this.buzzerStatus = status;
                    }
                } catch (e) {}
            }, 1500); 
        },

        // 2. TẮT CÒI / HỦY -> CHUYỂN MÀN HÌNH VỀ SỐ 1
        async turnOffBuzzer() {
            if (this.buzzerCheckId) {
                clearInterval(this.buzzerCheckId);
                this.buzzerCheckId = null;
            }
            this.buzzerStatus = 0;
            this.isTimeUp = false;
            this.status = false;

            try {
                // Gửi lệnh: Tắt còi + Reset đếm + Về màn hình chính (State 1)
                await Promise.all([
                    setBuzzerStatus(0),
                    resetCountdown(),
                    setState(1)
                ]);
            } catch (e) { console.error(e); }
            
            if (this.intervalId) clearInterval(this.intervalId);
        },

        async reset() {
            this.resetLocalState();
            // Reset bình thường cũng đưa về màn hình chính
            try {
                await Promise.all([
                    resetCountdown(),
                    setState(1)
                ]);
            } catch (e) { console.error(e); }
        },

        resetLocalState() {
            if (this.intervalId) clearInterval(this.intervalId);
            if (this.buzzerCheckId) clearInterval(this.buzzerCheckId);
            this.status = false;
            this.time = 0;
            this.target = 0;
            this.isTimeUp = false;
            this.buzzerStatus = 0;
        },
        
        async fetchCountdown() {
             try {
                const data = await getCountdown();
                if (data && data.status) {
                    const now = Math.floor(Date.now() / 1000);
                    if (data.target > now) {
                        this.target = data.target;
                        this.status = true;
                        this.startLocalTicker();
                    } else {
                        this.resetLocalState();
                    }
                }
            } catch (e) { console.error(e); }
        }
    }
});