<script setup lang="ts">
import { ref, onMounted } from 'vue';
import WeatherChart from '../components/WeatherChart.vue';
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
import { getEnvironmentData } from '../services/api'; // [QUAN TRỌNG] Import hàm API có bảo mật

const weatherData = ref<any>(null);
const loading = ref(true);
const error = ref(false);

async function fetchWeather() {
    loading.value = true;
    error.value = false;
    try {
        // [FIX] Gọi hàm getEnvironmentData thay vì axios trực tiếp
        // Hàm này sẽ tự động lấy Token đăng nhập để vượt qua bảo mật Firebase
        const data = await getEnvironmentData();
        
        // Giả lập delay nhỏ cho hiệu ứng loading mượt hơn
        await new Promise(r => setTimeout(r, 500));
        
        weatherData.value = data;
    } catch (e) {
        console.error("Lỗi tải dữ liệu:", e);
        weatherData.value = null;
        error.value = true;
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchWeather();
});

const glassCardClass = "bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl w-full";
</script>

<template>
    <div>
        <div class="fixed inset-0 bg-slate-900 -z-10"></div>

        <div class="w-full max-w-lg mx-auto py-6 px-4 min-h-[85vh] flex flex-col">
            
            <div class="flex justify-between items-end mb-6">
                <div>
                    <h1 class="text-2xl md:text-3xl font-bold text-white tracking-wide drop-shadow-lg">
                        Môi Trường
                    </h1>
                    <p class="text-slate-400 text-sm mt-1">Theo dõi nhiệt độ & độ ẩm</p>
                </div>
                <button 
                    @click="fetchWeather" 
                    :disabled="loading"
                    class="p-2.5 rounded-xl bg-slate-800/50 border border-white/10 hover:bg-slate-700 hover:border-cyan-500/50 text-cyan-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group">
                    <ArrowPathIcon class="h-6 w-6 group-hover:animate-spin" />
                </button>
            </div>

            <div v-if="loading" :class="[glassCardClass, 'flex-1 flex flex-col items-center justify-center min-h-[300px] animate-pulse']">
                <div class="h-12 w-12 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
                <div class="text-slate-400 text-sm font-medium">Đang đồng bộ dữ liệu...</div>
            </div>

            <div v-else-if="weatherData" :class="[glassCardClass, 'flex-1 !p-1 md:!p-4 overflow-hidden relative']">
                <div class="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
                
                <div class="relative z-10 w-full h-full min-h-[300px]">
                    <WeatherChart :data="weatherData" />
                </div>
                
                <div class="mt-4 text-center">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                        <span class="relative flex h-2 w-2">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Hệ thống hoạt động bình thường
                    </span>
                </div>
            </div>

            <div v-else :class="[glassCardClass, 'flex-1 flex flex-col items-center justify-center min-h-[300px] border-red-500/30']">
                <div class="bg-red-500/10 p-4 rounded-full mb-4">
                    <ExclamationTriangleIcon class="h-10 w-10 text-red-400" />
                </div>
                <h3 class="text-white font-bold text-lg mb-2">Mất kết nối</h3>
                <p class="text-slate-400 text-sm text-center max-w-[200px] mb-6">Không thể tải dữ liệu. Vui lòng kiểm tra quyền truy cập hoặc mạng.</p>
                <button @click="fetchWeather" class="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-red-900/20 transition-all">
                    Thử lại
                </button>
            </div>

        </div>
    </div>
</template>