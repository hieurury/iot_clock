<template>
    <Transition name="fade">
        <div v-if="visible" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" @click="handleBackdropClick"></div>
            
            <div class="relative w-full max-w-xs bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center animate-scale-in">
                
                <div class="mb-4">
                    <QuestionMarkCircleIcon v-if="type === 'confirm'" class="h-10 w-10 text-yellow-400 mx-auto" />
                    <ExclamationTriangleIcon v-else-if="type === 'error'" class="h-10 w-10 text-red-500 mx-auto" />
                    <InformationCircleIcon v-else class="h-10 w-10 text-blue-400 mx-auto" />
                </div>

                <h3 class="text-xl font-bold text-white mb-2">{{ title }}</h3>
                
                <p class="text-slate-400 text-sm mb-6 leading-relaxed">
                    {{ message }}
                </p>

                <div class="flex gap-3 w-full">
                    <button 
                        v-if="type === 'confirm'"
                        @click="close"
                        class="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-bold transition-colors">
                        Hủy
                    </button>

                    <button 
                        @click="handleConfirm"
                        class="flex-1 py-2.5 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95"
                        :class="type === 'error' ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'">
                        {{ confirmText }}
                    </button>
                </div>

            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ExclamationTriangleIcon, InformationCircleIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
    visible: boolean;
    title?: string;
    message: string;
    type?: 'info' | 'error' | 'confirm'; // Loại thông báo
}>();

const emit = defineEmits(['update:visible', 'confirm']);

// Text nút bấm tùy theo loại
const confirmText = computed(() => {
    if (props.type === 'confirm') return 'Đồng ý';
    return 'Đóng';
});

const close = () => {
    emit('update:visible', false);
};

const handleBackdropClick = () => {
    // Nếu là confirm thì bắt buộc chọn, không cho bấm ra ngoài (tùy chọn)
    if (props.type !== 'confirm') close();
};

const handleConfirm = () => {
    emit('confirm'); // Báo ra ngoài là đã bấm đồng ý
    close();
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes scaleIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}
.animate-scale-in { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
</style>