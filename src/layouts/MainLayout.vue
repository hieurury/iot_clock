<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'; // [CẬP NHẬT] Thêm onUnmounted
import TimeUpAlert from '../components/TimeUpAlert.vue';
import BaseSwitch from '../components/BaseSwitch.vue';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { useCountdownStore } from '../stores/countdown';
import { useRoute } from 'vue-router';
import { CloudIcon, ClockIcon, BellAlertIcon } from '@heroicons/vue/24/outline';
import { toggleBuzzer, getBuzzerState } from '../services/api';

const router = useRouter();
const route = useRoute();
const store = useCountdownStore();

const isBuzzerOn = ref(false);
const isLoadingBuzzer = ref(false);
let buzzerSyncInterval: any = null; // [MỚI] Biến giữ Timer

const isActive = (path: string) => route.path === path;

// Hàm đồng bộ trạng thái từ Server về Web
const syncBuzzerState = async () => {
    // Nếu đang bấm nút (loading) thì không đồng bộ đè lên để tránh giật lag
    if (isLoadingBuzzer.value) return; 

    try {
        const state = await getBuzzerState();
        // Chỉ cập nhật nếu trạng thái khác nhau (để tránh render lại không cần thiết)
        if (isBuzzerOn.value !== state) {
            isBuzzerOn.value = state;
            store.buzzerStatus = state ? 1 : 0;
        }
    } catch (e) { 
        console.error("Lỗi đồng bộ còi:", e); 
    }
};

const handleSwitch = async (val: boolean) => {
    if (isLoadingBuzzer.value) return;
    isLoadingBuzzer.value = true;
    try {
        const success = await toggleBuzzer(val);
        if (success) {
            isBuzzerOn.value = val;
            store.buzzerStatus = val ? 1 : 0;
            if (!val) store.isFinished = false; 
        } else {
            // Nếu lỗi thì trả lại trạng thái cũ
            isBuzzerOn.value = !val;
        }
    } catch (e) {
        isBuzzerOn.value = !val;
    } finally {
        isLoadingBuzzer.value = false;
    }
};

const handleLogout = async () => {
    await signOut(getAuth());
    router.push('/login');
};

onMounted(() => {
    // 1. Lấy trạng thái ngay khi vào
    syncBuzzerState();

    // 2. [QUAN TRỌNG] Thiết lập kiểm tra định kỳ mỗi 3 giây
    // Giúp Switch tự tắt nếu ESP32 tắt còi (do cảm biến hoặc hết giờ)
    buzzerSyncInterval = setInterval(syncBuzzerState, 3000);
});

onUnmounted(() => {
    // Xóa timer khi thoát để tránh rò rỉ bộ nhớ
    if (buzzerSyncInterval) clearInterval(buzzerSyncInterval);
});
</script>

<template>
    <div class="min-h-screen font-sans text-slate-200 relative overflow-hidden">
        <TimeUpAlert />
        
        <div class="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-900/80 px-3 py-2 rounded-xl shadow-lg border border-slate-700 backdrop-blur-md transition-all hover:bg-slate-800/90">
            <span class="text-xs font-bold text-slate-300 select-none uppercase tracking-wider">Còi</span>
            <div v-if="isLoadingBuzzer" class="w-8 h-4 flex items-center justify-center">
                <div class="w-3 h-3 border-2 border-slate-500 border-t-cyan-400 rounded-full animate-spin"></div>
            </div>
            <BaseSwitch v-else :model-value="isBuzzerOn" @update:model-value="handleSwitch" />
            <Button 
            class="ml-4 px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-900/30 transition-all active:scale-95"
            @click="handleLogout">Đăng xuất</Button>
        </div>

        <div class="fixed inset-0 bg-linear-to-br from-slate-900 via-[#1e1b4b] to-slate-900 -z-20"></div>
        <div class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"></div>
            <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px]"></div>
        </div>

        <main class="pb-24 pt-4 px-2 w-full mx-auto min-h-screen flex flex-col">
            <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </main>

        <nav class="fixed bottom-4 left-4 right-4 h-16 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 max-w-xl mx-auto flex items-center justify-around">
            
            <router-link 
                to="/" 
                class="flex flex-col items-center justify-center w-full h-full transition-all duration-300 relative group"
                :class="isActive('/') ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'"
            >
                <div 
                    class="p-1.5 rounded-xl transition-all duration-300"
                    :class="isActive('/') ? 'bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.3)] -translate-y-1' : ''"
                >
                    <CloudIcon class="h-6 w-6" />
                </div>
                <span class="text-[10px] font-bold mt-1">Môi trường</span>
            </router-link>

            <router-link 
                to="/alarm" 
                class="flex flex-col items-center justify-center w-full h-full transition-all duration-300 relative group"
                :class="isActive('/alarm') ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'"
            >
                <div 
                    class="p-1.5 rounded-xl transition-all duration-300"
                    :class="isActive('/alarm') ? 'bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.3)] -translate-y-1' : ''"
                >
                    <BellAlertIcon class="h-6 w-6" />
                </div>
                <span class="text-[10px] font-bold mt-1">Báo thức</span>
            </router-link>

            <router-link 
                to="/countdown" 
                class="flex flex-col items-center justify-center w-full h-full transition-all duration-300 relative group"
                :class="isActive('/countdown') ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'"
            >
                <div 
                    class="p-1.5 rounded-xl transition-all duration-300"
                    :class="isActive('/countdown') ? 'bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.3)] -translate-y-1' : ''"
                >
                    <ClockIcon class="h-6 w-6" />
                </div>
                <span class="text-[10px] font-bold mt-1">Đếm ngược</span>
            </router-link>

        </nav>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>