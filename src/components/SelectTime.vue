<template>
    <div class="w-full flex justify-center">
        <div class="flex items-center gap-1 md:gap-4 bg-slate-900/40 backdrop-blur-md px-3 py-4 rounded-2xl border border-white/10 shadow-inner touch-none">
            
            <div class="flex gap-1">
                <input
                    v-bind="inputProps"
                    v-model="hourTens"
                    ref="elHourTens"
                    aria-label="Giờ hàng chục"
                    @input="handleInput('hour', 'tens', $event)"
                    @keydown="handleKeydown('hour', 'tens', $event)"
                    @focus="handleFocus"
                    @wheel.prevent="handleWheel('hour', 'tens', $event)"
                    @touchstart="handleTouchStart"
                    @touchmove.prevent="handleTouchMove('hour', 'tens', $event)"
                />
                <input
                    v-bind="inputProps"
                    v-model="hourUnits"
                    ref="elHourUnits"
                    aria-label="Giờ hàng đơn vị"
                    @input="handleInput('hour', 'units', $event)"
                    @keydown="handleKeydown('hour', 'units', $event)"
                    @focus="handleFocus"
                    @wheel.prevent="handleWheel('hour', 'units', $event)"
                    @touchstart="handleTouchStart"
                    @touchmove.prevent="handleTouchMove('hour', 'units', $event)"
                />
            </div>

            <span class="text-xl md:text-4xl text-cyan-500/80 font-mono font-bold pb-1">:</span>

            <div class="flex gap-1">
                <input
                    v-bind="inputProps"
                    v-model="minuteTens"
                    ref="elMinuteTens"
                    aria-label="Phút hàng chục"
                    @input="handleInput('minute', 'tens', $event)"
                    @keydown="handleKeydown('minute', 'tens', $event)"
                    @focus="handleFocus"
                    @wheel.prevent="handleWheel('minute', 'tens', $event)"
                    @touchstart="handleTouchStart"
                    @touchmove.prevent="handleTouchMove('minute', 'tens', $event)"
                />
                <input
                    v-bind="inputProps"
                    v-model="minuteUnits"
                    ref="elMinuteUnits"
                    aria-label="Phút hàng đơn vị"
                    @input="handleInput('minute', 'units', $event)"
                    @keydown="handleKeydown('minute', 'units', $event)"
                    @focus="handleFocus"
                    @wheel.prevent="handleWheel('minute', 'units', $event)"
                    @touchstart="handleTouchStart"
                    @touchmove.prevent="handleTouchMove('minute', 'units', $event)"
                />
            </div>

            <span class="text-xl md:text-4xl text-cyan-500/80 font-mono font-bold pb-1">:</span>

            <div class="flex gap-1">
                <input
                    v-bind="inputProps"
                    v-model="secondTens"
                    ref="elSecondTens"
                    aria-label="Giây hàng chục"
                    @input="handleInput('second', 'tens', $event)"
                    @keydown="handleKeydown('second', 'tens', $event)"
                    @focus="handleFocus"
                    @wheel.prevent="handleWheel('second', 'tens', $event)"
                    @touchstart="handleTouchStart"
                    @touchmove.prevent="handleTouchMove('second', 'tens', $event)"
                />
                <input
                    v-bind="inputProps"
                    v-model="secondUnits"
                    ref="elSecondUnits"
                    aria-label="Giây hàng đơn vị"
                    @input="handleInput('second', 'units', $event)"
                    @keydown="handleKeydown('second', 'units', $event)"
                    @focus="handleFocus"
                    @wheel.prevent="handleWheel('second', 'units', $event)"
                    @touchstart="handleTouchStart"
                    @touchmove.prevent="handleTouchMove('second', 'units', $event)"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

interface Props {
    modelValue?: string; 
}
const props = withDefaults(defineProps<Props>(), {
    modelValue: '00:00:00'
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

// Refs cho từng input để focus tự động (chỉ giữ lại nếu thực sự dùng)
const elHourUnits = ref<HTMLInputElement|null>(null);
const elMinuteUnits = ref<HTMLInputElement|null>(null);
const elSecondUnits = ref<HTMLInputElement|null>(null);

// Giá trị hiển thị
const hourTens = ref('0');
const hourUnits = ref('0');
const minuteTens = ref('0');
const minuteUnits = ref('0');
const secondTens = ref('0');
const secondUnits = ref('0');

// Thuộc tính chung cho input
const inputClass = `
    w-10 md:w-14 h-12 md:h-16 text-center text-2xl md:text-4xl rounded-lg 
    border-2 border-slate-700 bg-slate-800 text-white font-bold font-mono 
    focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none 
    focus:bg-slate-700 transition-all duration-200
    selection:bg-cyan-500 selection:text-black
`;

const inputProps = {
    type: 'tel', // Dùng tel để hiện bàn phím số tốt hơn trên mobile
    inputmode: 'numeric' as 'text' | 'search' | 'tel' | 'numeric' | 'email' | 'url' | 'none' | 'decimal' | undefined,
    pattern: '[0-9]*',
    maxlength: '1',
    class: inputClass,
    autocomplete: 'off'
};

// --- LOGIC XỬ LÝ DỮ LIỆU ---

const parseModelValue = (val: string) => {
    const parts = val.split(':');
    const h = (parts[0] || '00').padStart(2, '0');
    const m = (parts[1] || '00').padStart(2, '0');
    const s = (parts[2] || '00').padStart(2, '0');

    hourTens.value = h[0] ?? '0'; hourUnits.value = h[1] ?? '0';
    minuteTens.value = m[0] ?? '0'; minuteUnits.value = m[1] ?? '0';
    secondTens.value = s[0] ?? '0'; secondUnits.value = s[1] ?? '0';
};

const updateModel = () => {
    const timeStr = `${hourTens.value}${hourUnits.value}:${minuteTens.value}${minuteUnits.value}:${secondTens.value}${secondUnits.value}`;
    emit('update:modelValue', timeStr);
};

// Đồng bộ khi prop thay đổi
watch(() => props.modelValue, (newVal) => {
    const current = `${hourTens.value}${hourUnits.value}:${minuteTens.value}${minuteUnits.value}:${secondTens.value}${secondUnits.value}`;
    if (newVal !== current) parseModelValue(newVal);
}, { immediate: true });

// --- LOGIC NHẬP LIỆU (KEYBOARD) ---

const handleFocus = (e: FocusEvent) => {
    // Tự động bôi đen toàn bộ số khi focus để nhập đè nhanh
    (e.target as HTMLInputElement).select();
};

const handleInput = (type: 'hour'|'minute'|'second', digit: 'tens'|'units', e: Event) => {
    const input = e.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, ''); // Chỉ lấy số
    
    // Logic nhập đè: Lấy số cuối cùng nhập vào
    if (val.length > 1) val = val.slice(-1);
    
    // Cập nhật giá trị tạm
    let targetRef = getRefVar(type, digit);
    targetRef.value = val || '0';

    validateAndCorrect(type); // Kiểm tra logic giờ phút giây (ví dụ > 23h)
    updateModel();

    // Tự động nhảy sang ô tiếp theo nếu nhập xong 1 số
    if (val.length === 1 && digit === 'tens') {
        const nextInput = getNextInputRef(type);
        nextInput.value?.focus();
    }
};

const handleKeydown = (type: 'hour'|'minute'|'second', digit: 'tens'|'units', e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        changeValue(type, digit, 1);
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        changeValue(type, digit, -1);
    } else if (e.key === 'Backspace') {
        // Nếu xóa trống, đặt về 0 nhưng không mất focus
        const targetRef = getRefVar(type, digit);
        if (targetRef.value !== '0') {
            targetRef.value = '0';
            e.preventDefault(); // Ngăn hành vi xóa lùi focus mặc định
            updateModel();
            (e.target as HTMLInputElement).select(); // Bôi đen lại số 0
        }
    }
};

// --- LOGIC VUỐT (TOUCH & WHEEL) ---

let touchStartY = 0;
const handleTouchStart = (e: TouchEvent) => {
    if (e.touches && e.touches[0]) {
        touchStartY = e.touches[0].clientY;
    }
};

// Dùng Throttle đơn giản để giảm tốc độ nhảy số khi vuốt nhanh
let lastTouchTime = 0;
const handleTouchMove = (type: 'hour'|'minute'|'second', digit: 'tens'|'units', e: TouchEvent) => {
    const now = Date.now();
    if (now - lastTouchTime < 50) return; // Giới hạn tốc độ cập nhật (50ms)
    if (!(e.touches && e.touches[0])) return;
    const currentY = e.touches[0].clientY;
    const diff = touchStartY - currentY;
    // Độ nhạy: vuốt 10px thì nhảy 1 số
    if (Math.abs(diff) > 10) {
        const delta = diff > 0 ? 1 : -1; // Vuốt lên (+) tăng, xuống (-) giảm
        changeValue(type, digit, delta);
        touchStartY = currentY; // Reset mốc để vuốt tiếp
        lastTouchTime = now;
    }
};

const handleWheel = (type: 'hour'|'minute'|'second', digit: 'tens'|'units', e: WheelEvent) => {
    const delta = e.deltaY < 0 ? 1 : -1;
    changeValue(type, digit, delta);
};

// --- HÀM TIỆN ÍCH ---

// Thay đổi giá trị (Tăng/Giảm) có kiểm tra giới hạn
const changeValue = (type: 'hour'|'minute'|'second', digit: 'tens'|'units', delta: number) => {
    const refVar = getRefVar(type, digit);
    let val = parseInt(refVar.value) || 0;
    val += delta;

    // Giới hạn cục bộ cho từng chữ số (cơ bản)
    if (val < 0) val = 9;
    if (val > 9) val = 0;

    // Logic đặc biệt cho hàng chục
    if (digit === 'tens') {
        if (type === 'hour' && val > 2) val = 0; // Giờ chục max 2
        if (type !== 'hour' && val > 5) val = 0; // Phút/Giây chục max 5
    }

    refVar.value = val.toString();
    validateAndCorrect(type); // Validate lại logic tổng thể (ví dụ 29h -> 23h)
    updateModel();
};

// Kiểm tra logic thời gian hợp lệ
const validateAndCorrect = (type: 'hour'|'minute'|'second') => {
    if (type === 'hour') {
        const h = parseInt(hourTens.value + hourUnits.value);
        if (h > 23) {
            // Nếu > 23 (ví dụ nhập 29), sửa thành 23
            if (hourTens.value === '2') hourUnits.value = '3';
        }
    } else {
        // Phút và giây tự động đúng nhờ giới hạn hàng chục là 5
        // Nhưng nếu nhập tay có thể sai, check lại
        const refTens = type === 'minute' ? minuteTens : secondTens;
        if (parseInt(refTens.value) > 5) refTens.value = '5';
    }
};

const getRefVar = (type: string, digit: string) => {
    if (type === 'hour') return digit === 'tens' ? hourTens : hourUnits;
    if (type === 'minute') return digit === 'tens' ? minuteTens : minuteUnits;
    return digit === 'tens' ? secondTens : secondUnits;
};

const getNextInputRef = (type: string) => {
    if (type === 'hour') return elHourUnits;
    if (type === 'minute') return elMinuteUnits;
    return elSecondUnits;
};

</script>

<style scoped>
/* Ẩn nút tăng giảm mặc định của trình duyệt */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
</style>