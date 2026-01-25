<template>
    <div class="w-full h-full pt-6 pb-24 px-4 flex flex-col items-center">
        
        <div class="w-full max-w-md flex justify-between items-center mb-6">
            <div>
                <h2 class="text-2xl font-bold text-white">Báo thức</h2>
                <p class="text-slate-400 text-sm">Chọn nhiều ngày linh hoạt</p>
            </div>
            <button @click="openAddModal" :disabled="store.alarms.length >= 5" class="p-3 bg-blue-600 rounded-full text-white shadow-lg transition-all active:scale-95 disabled:opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            </button>
        </div>

        <div class="w-full max-w-md flex flex-col gap-3">
            <div v-if="store.loading" class="text-center text-slate-500 py-10">Đang tải dữ liệu...</div>
            <div v-else-if="store.alarms.length === 0" class="text-center py-10 flex flex-col items-center">
                <div class="text-4xl mb-2">🔕</div><p class="text-slate-500">Chưa có báo thức nào</p>
            </div>

            <div v-for="alarm in store.alarms" :key="alarm.id" class="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all" :class="{'opacity-60': !alarm.enable}">
                <div class="flex flex-col max-w-[70%]">
                    <span class="text-3xl font-mono font-bold text-white tracking-wider">{{ alarm.time }}</span>
                    <span class="text-xs text-cyan-400 font-bold mt-1 truncate">{{ formatDays(alarm.day) }}</span>
                </div>
                <div class="flex items-center gap-3">
                    <BaseSwitch v-model="alarm.enable" @change="(val) => store.toggleAlarm(alarm.id, val)" />
                    <button @click="prepareDelete(alarm.id)" class="text-slate-500 hover:text-red-500 p-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
            </div>
        </div>

        <Transition name="fade">
            <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" @click="showAddModal = false"></div>
                <div class="relative bg-slate-800 border border-slate-600 p-6 rounded-2xl w-full max-w-xs shadow-2xl flex flex-col items-center">
                    <h3 class="text-xl font-bold text-white mb-6">Thêm Báo Thức</h3>
                    <div class="flex items-center justify-center gap-2 mb-6">
                        <div class="flex flex-col items-center">
                            <label class="text-xs text-slate-400 mb-1 font-bold">GIỜ</label>
                            <input type="number" v-model="inputHour" min="0" max="23" @blur="validateTime" class="w-16 h-16 text-center text-3xl bg-slate-700 text-white rounded-xl border-2 border-slate-600 focus:border-blue-500 outline-none font-mono font-bold" />
                        </div>
                        <span class="text-3xl text-slate-500 font-bold mt-4">:</span>
                        <div class="flex flex-col items-center">
                            <label class="text-xs text-slate-400 mb-1 font-bold">PHÚT</label>
                            <input type="number" v-model="inputMinute" min="0" max="59" @blur="validateTime" class="w-16 h-16 text-center text-3xl bg-slate-700 text-white rounded-xl border-2 border-slate-600 focus:border-blue-500 outline-none font-mono font-bold" />
                        </div>
                    </div>
                    <div class="w-full mb-8">
                        <label class="text-xs text-slate-400 font-bold mb-3 block text-center uppercase">Lặp lại vào</label>
                        <div class="grid grid-cols-4 gap-2">
                            <button @click="toggleDay(0)" class="py-2 rounded-lg text-xs font-bold transition-all border col-span-1" :class="selectedDays.includes(0) ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400'">CN</button>
                            <button v-for="day in [1, 2, 3, 4, 5, 6]" :key="day" @click="toggleDay(day)" class="py-2 rounded-lg text-xs font-bold transition-all border" :class="selectedDays.includes(day) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400'">T{{ day + 1 }}</button>
                        </div>
                        <p class="text-center text-xs text-slate-500 mt-2 h-4">{{ previewSelectedDays }}</p>
                    </div>
                    <div class="flex gap-3 w-full">
                        <button @click="showAddModal = false" class="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-bold">Hủy</button>
                        <button @click="handleAdd" class="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg">Lưu</button>
                    </div>
                </div>
            </div>
        </Transition>

        <CustomAlert 
            v-model:visible="alertState.visible"
            :title="alertState.title"
            :message="alertState.message"
            :type="alertState.type"
            @confirm="alertState.onConfirm"
        />

    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useAlarmStore } from '../stores/alarm';
import BaseSwitch from '../components/BaseSwitch.vue';
import CustomAlert from '../components/CustomAlert.vue'; // Import Component Mới

const store = useAlarmStore();
const showAddModal = ref(false);
const inputHour = ref<string | number>("07");
const inputMinute = ref<string | number>("00");
const selectedDays = ref<number[]>([]); 

// --- [MỚI] QUẢN LÝ TRẠNG THÁI ALERT ---
const alertState = reactive({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'info' | 'error' | 'confirm',
    onConfirm: () => {}
});

// Hàm hiển thị thông báo lỗi/info
const showAlert = (title: string, msg: string, type: 'info' | 'error' = 'info') => {
    alertState.title = title;
    alertState.message = msg;
    alertState.type = type;
    alertState.onConfirm = () => {}; // Không làm gì
    alertState.visible = true;
};

// Hàm hiển thị xác nhận (thay thế confirm browser)
const showConfirm = (title: string, msg: string, action: () => void) => {
    alertState.title = title;
    alertState.message = msg;
    alertState.type = 'confirm';
    alertState.onConfirm = action; // Gắn hành động vào nút Đồng ý
    alertState.visible = true;
};

// --- LOGIC CŨ (Đã chỉnh sửa để dùng CustomAlert) ---

const openAddModal = () => {
    inputHour.value = "07";
    inputMinute.value = "00";
    selectedDays.value = [1, 2, 3, 4, 5]; 
    showAddModal.value = true;
};

const toggleDay = (day: number) => {
    if (selectedDays.value.includes(day)) selectedDays.value = selectedDays.value.filter(d => d !== day);
    else { selectedDays.value.push(day); selectedDays.value.sort((a, b) => a - b); }
};

const previewSelectedDays = computed(() => {
    if (selectedDays.value.length === 0) return "Chưa chọn ngày nào";
    if (selectedDays.value.length === 7) return "Hằng ngày";
    return bitmaskToText(calculateBitmask(selectedDays.value));
});

const padZero = (num: string | number) => num.toString().padStart(2, '0');
const validateTime = () => {
    let h = parseInt(inputHour.value.toString()) || 0; let m = parseInt(inputMinute.value.toString()) || 0;
    if (h > 23) h = 23; if (h < 0) h = 0; if (m > 59) m = 59; if (m < 0) m = 0;
    inputHour.value = padZero(h); inputMinute.value = padZero(m);
};

const calculateBitmask = (days: number[]) => days.length === 0 ? 0 : days.reduce((sum, day) => sum | (1 << day), 0);
const formatDays = (mask: number) => (mask === -1 || mask === 127) ? "HẰNG NGÀY" : (mask === 0 ? "Một lần" : bitmaskToText(mask));

const bitmaskToText = (mask: number) => {
    const daysMap = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const result = [];
    for (let i = 0; i < 7; i++) { if ((mask >> i) & 1) result.push(daysMap[i]); }
    if (mask === 62) return "T2 - T6"; if (mask === 65) return "Cuối tuần";
    return result.join(", ");
};

const handleAdd = async () => {
    validateTime();
    const timeString = `${inputHour.value}:${inputMinute.value}`;
    
    if (selectedDays.value.length === 0) {
        // [THAY THẾ] alert -> showAlert
        showAlert("Thiếu thông tin", "Vui lòng chọn ít nhất một ngày!", "error");
        return;
    }

    const dayMask = calculateBitmask(selectedDays.value);
    const exists = store.alarms.some(a => a.time === timeString && a.day === dayMask);
    
    if (exists) {
        // [THAY THẾ] alert -> showAlert
        showAlert("Trùng lặp", `Báo thức ${timeString} đã tồn tại!`, "error");
        return;
    }

    const success = await store.addAlarm(timeString, dayMask);
    if (success) showAddModal.value = false;
};

// [MỚI] Hàm chuẩn bị xóa (kết nối với nút xóa)
const prepareDelete = (id: number) => {
    // [THAY THẾ] confirm -> showConfirm
    showConfirm(
        "Xác nhận xóa", 
        "Bạn có chắc chắn muốn xóa báo thức này không?", 
        async () => {
            await store.removeAlarm(id); // Hành động xóa thật sự chạy ở đây
        }
    );
};

onMounted(() => {
    store.fetchAlarms();
});
</script>

<style scoped>
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>