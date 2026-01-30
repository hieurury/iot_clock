<template>
    <Transition name="fade">
        <div v-if="store.isFinished" class="z-100 relative">
            
            <div v-if="isCountdownPage" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-slate-900/95 backdrop-blur-sm" @click="handleStopAndClose"></div>
                
                <div class="relative w-full max-w-sm bg-slate-800 border-2 border-red-500/50 rounded-2xl p-6 text-center shadow-2xl animate-bounce-in">
                    <div class="mb-4 animate-wiggle origin-bottom flex justify-center">
                        <BellAlertIcon class="w-16 h-16 text-red-400 drop-shadow-lg" />
                    </div>
                    <h2 class="text-3xl font-bold text-white mb-2">HẾT GIỜ!</h2>
                    
                    <div v-if="store.buzzerStatus === 1" class="mb-6 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <p class="text-red-400 font-bold animate-pulse flex items-center justify-center gap-2">
                            <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                            CÒI ĐANG KÊU
                        </p>
                    </div>

                    <div class="flex flex-col gap-3">
                        <button v-if="store.buzzerStatus === 1" 
                            @click="handleStopAndClose"
                            class="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-red-900/30 transition-all active:scale-95">
                            Tắt còi & Đặt lại
                        </button>
                        <button 
                            @click="handleStopAndClose"
                            class="w-full py-3.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium transition-colors">
                            Đóng (Tắt còi)
                        </button>
                    </div>
                </div>
            </div>

            <div v-else class="fixed top-4 right-4 z-50 w-full max-w-xs animate-slide-in">
                <div class="bg-slate-800/90 backdrop-blur-md rounded-lg shadow-2xl p-4 flex flex-col gap-3">
                    <div class="flex items-start gap-3">
                        <div class="animate-wiggle">
                            <BellAlertIcon class="w-8 h-8 text-red-400 drop-shadow" />
                        </div>
                        <div>
                            <h3 class="font-bold text-white text-lg">Đã hết giờ!</h3>
                            <p class="text-slate-400 text-sm">Bộ đếm ngược đã kết thúc.</p>
                        </div>
                    </div>

                    <div v-if="store.buzzerStatus === 1" class="text-red-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                        Còi đang kêu
                    </div>

                    <div class="flex gap-2 mt-1">
                        <button v-if="store.buzzerStatus === 1" 
                            @click="handleStopAndClose"
                            class="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-md shadow transition-colors">
                            Tắt còi
                        </button>
                        <button 
                            @click="handleStopAndClose"
                            class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-md transition-colors">
                            Đóng
                        </button>
                    </div>
                </div>
            </div>

        </div>
    </Transition>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCountdownStore } from '../stores/countdown';
import { BellAlertIcon } from '@heroicons/vue/24/outline';

const store = useCountdownStore();
const route = useRoute();
const router = useRouter();

const isCountdownPage = computed(() => route.path === '/countdown');

const handleStopAndClose = async () => {
    store.clearAllTimers();
    await store.turnOffBuzzer();
    if (!isCountdownPage.value) {
        router.push('/countdown');
    }
};

onBeforeUnmount(() => {
    if (store.isFinished || store.buzzerStatus === 1) {
        store.turnOffBuzzer();
    }
});
</script>

<style scoped>
@keyframes wiggle { 0%, 100% { transform: rotate(-10deg); } 50% { transform: rotate(10deg); } }
.animate-wiggle { animation: wiggle 0.5s ease-in-out infinite; }
@keyframes bounceIn { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); } }
.animate-bounce-in { animation: bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.animate-slide-in { animation: slideIn 0.4s ease-out; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>