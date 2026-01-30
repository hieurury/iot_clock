<template>
    <div class="w-full h-full flex flex-col items-center justify-start pt-10 px-4">
        
        <div class="w-full max-w-md transition-all duration-300">
            
            <div v-if="!store.isRunning" class="flex flex-col gap-6 animate-fade-in">
                <div class="text-center">
                    <h2 class="text-2xl font-bold text-white">Bộ đếm ngược</h2>
                    <p class="text-slate-400 text-sm mt-1">Chọn thời gian để bắt đầu</p>
                </div>
                
                <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm">
                    <SelectTime v-model="timeString" />
                </div>

                <div class="grid grid-cols-3 gap-3">
                    <button v-for="min in [1, 5, 10, 30, 60]" :key="min"
                        @click="quickCountdown(min)"
                        class="py-3 bg-slate-800 border border-slate-700 hover:border-blue-500 hover:text-blue-400 text-slate-300 rounded-xl font-medium text-sm transition-all active:scale-95">
                        +{{ min }} Phút
                    </button>
                    
                    <button @click="timeString = '00:00:00'" 
                        class="py-3 bg-slate-800/50 border border-slate-700/50 text-slate-500 hover:text-white rounded-xl font-medium text-sm transition-all">
                        Xóa
                    </button>
                </div>

                <button 
                    @click="setCountdownFromInput"
                    class="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <PlayIcon class="h-6 w-6" />
                    BẮT ĐẦU
                </button>
            </div>

            <div v-else class="flex flex-col items-center animate-fade-in">
                <div class="relative w-72 h-72 mb-8">
                    <svg class="w-full h-full transform -rotate-90">
                        <circle cx="50%" cy="50%" r="48%" stroke="#334155" stroke-width="6" fill="transparent" />
                        <circle cx="50%" cy="50%" r="48%" stroke="#3b82f6" stroke-width="6" fill="transparent" 
                            stroke-dasharray="283" 
                            :stroke-dashoffset="progressOffset" 
                            stroke-linecap="round" 
                            class="transition-all duration-1000 ease-linear" />
                    </svg>
                    
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="text-6xl font-mono font-bold text-white tabular-nums tracking-tight">
                            {{ formattedCountdown }}
                        </span>
                        <span class="text-slate-400 text-sm font-medium mt-2 uppercase tracking-wide">Còn lại</span>
                    </div>
                </div>

                <div class="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6 flex justify-between items-center">
                    <div class="flex flex-col">
                        <span class="text-xs text-slate-500 font-bold uppercase">Kết thúc dự kiến</span>
                        <span class="text-lg text-white font-mono">{{ formatEndTime(store.targetTime) }}</span>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                        <ClockIcon class="h-6 w-6" />
                    </div>
                </div>

                <button @click="reset" class="w-full py-3 bg-transparent border-2 border-slate-700 text-slate-300 hover:border-red-500 hover:text-red-500 rounded-xl font-bold transition-all">
                    Hủy bỏ
                </button>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'; // [NEW] Thêm watch
import { useCountdownStore } from '../stores/countdown';
import SelectTime from '../components/SelectTime.vue';
import { PlayIcon, ClockIcon } from '@heroicons/vue/24/outline';

const store = useCountdownStore();
const timeString = ref('00:00:00');
const showTimeUpAlert = ref(false); // [NEW] Biến điều khiển Alert

// --- WATCHER: LẮNG NGHE KHI HẾT GIỜ ---
watch(() => store.isFinished, (isFinished) => {
    if (isFinished) {
        showTimeUpAlert.value = true; // Hiện bảng thông báo
    }
});


// 1. Format thời gian (Giữ nguyên)
const formattedCountdown = computed(() => {
    const sec = store.remainingSeconds;
    if (sec <= 0) return "00:00:00";
    
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    
    if (h === '00') return `${m}:${s}`;
    return `${h}:${m}:${s}`;
});

// 2. Progress Bar (Giữ nguyên)
const progressOffset = computed(() => {
    if (!store.targetTime || !store.remainingSeconds) return 0;
    const totalDuration = store.targetTime - (Date.now() / 1000 - (store.targetTime - store.remainingSeconds)); 
    const percent = store.remainingSeconds / (totalDuration || 1); 
    return 283 * (1 - percent); 
});

const formatEndTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// 3. Set Input (Giữ nguyên)
function setCountdownFromInput() {
    const [hRaw, mRaw, sRaw] = timeString.value.split(':');
    const h = Number(hRaw) || 0;
    const m = Number(mRaw) || 0;
    const s = Number(sRaw) || 0;
    const totalSeconds = (h * 3600) + (m * 60) + s;

    if (totalSeconds > 0) {
        store.startCountdown(totalSeconds); 
    } else {
        alert("Vui lòng chọn thời gian!");
    }
}

// 4. Set Quick (Giữ nguyên)
function quickCountdown(minutes: number) {
    const totalSeconds = minutes * 60;
    store.startCountdown(totalSeconds);
}

// 5. Reset (Giữ nguyên)
function reset() {
    store.stopCountdown();
}
</script>

<style scoped>
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
</style>