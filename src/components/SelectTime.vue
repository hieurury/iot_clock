<template>
    <div class="w-full flex justify-center py-10">
        <div class="flex items-center gap-2 md:gap-6 bg-slate-900/60 backdrop-blur-xl px-4 py-6 rounded-3xl border border-white/10 shadow-2xl touch-none select-none">
            
            <div class="flex gap-1.5 group">
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

            <div class="flex flex-col gap-2 md:gap-4 opacity-50">
                <div class="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-cyan-400"></div>
                <div class="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-cyan-400"></div>
            </div>

            <div class="flex gap-1.5 group">
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

            <div class="flex flex-col gap-2 md:gap-4 opacity-50">
                <div class="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-cyan-400"></div>
                <div class="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-cyan-400"></div>
            </div>

            <div class="flex gap-1.5 group">
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

const elHourUnits = ref<HTMLInputElement|null>(null);
const elMinuteUnits = ref<HTMLInputElement|null>(null);
const elSecondUnits = ref<HTMLInputElement|null>(null);

// Values
const hourTens = ref('0');
const hourUnits = ref('0');
const minuteTens = ref('0');
const minuteUnits = ref('0');
const secondTens = ref('0');
const secondUnits = ref('0');

// --- STYLE MỚI: TO HƠN, RÕ HƠN ---
const inputClass = `
    w-12 h-20 md:w-24 md:h-36 
    text-center text-4xl md:text-8xl 
    rounded-xl md:rounded-2xl
    bg-slate-800 text-white font-bold font-mono leading-none
    border-2 border-slate-700 
    
    focus:border-cyan-400 focus:bg-slate-700 
    focus:ring-4 focus:ring-cyan-500/30 focus:outline-none focus:z-10
    
    transition-all duration-150 ease-out
    selection:bg-cyan-500 selection:text-black
`;

const inputProps = {
    type: 'tel' as const,
    inputmode: 'numeric' as 'tel' | 'numeric' | 'search' | 'text' | 'email' | 'url' | 'none' | 'decimal' | undefined,
    pattern: '[0-9]*',
    maxlength: '1',
    class: inputClass,
    autocomplete: 'off'
};

// --- LOGIC GIỮ NGUYÊN NHƯ BẢN TRƯỚC ---

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

watch(() => props.modelValue, (newVal) => {
    const current = `${hourTens.value}${hourUnits.value}:${minuteTens.value}${minuteUnits.value}:${secondTens.value}${secondUnits.value}`;
    if (newVal !== current) parseModelValue(newVal);
}, { immediate: true });

const handleFocus = (e: FocusEvent) => {
    (e.target as HTMLInputElement).select();
};

const handleInput = (type: 'hour'|'minute'|'second', digit: 'tens'|'units', e: Event) => {
    const input = e.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, ''); 
    if (val.length > 1) val = val.slice(-1);
    
    let targetRef = getRefVar(type, digit);
    targetRef.value = val || '0';

    validateAndCorrect(type); 
    updateModel();

    if (val.length === 1 && digit === 'tens') {
        const nextInput = getNextInputRef(type);
        nextInput.value?.focus();
    }
};

const handleKeydown = (type: 'hour'|'minute'|'second', digit: 'tens'|'units', e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
        e.preventDefault(); changeValue(type, digit, 1);
    } else if (e.key === 'ArrowDown') {
        e.preventDefault(); changeValue(type, digit, -1);
    } else if (e.key === 'Backspace') {
        const targetRef = getRefVar(type, digit);
        if (targetRef.value !== '0') {
            targetRef.value = '0';
            e.preventDefault(); updateModel();
            (e.target as HTMLInputElement).select(); 
        }
    }
};

let touchStartY = 0;
const handleTouchStart = (e: TouchEvent) => {
    if (e.touches && e.touches[0]) {
        touchStartY = e.touches[0].clientY;
    }
};

let lastTouchTime = 0;
const handleTouchMove = (type: 'hour'|'minute'|'second', digit: 'tens'|'units', e: TouchEvent) => {
    const now = Date.now();
    if (now - lastTouchTime < 50) return; 

    if (!(e.touches && e.touches[0])) return;
    const currentY = e.touches[0].clientY;
    const diff = touchStartY - currentY;
    
    if (Math.abs(diff) > 10) {
        const delta = diff > 0 ? 1 : -1; 
        changeValue(type, digit, delta);
        touchStartY = currentY; 
        lastTouchTime = now;
    }
};

const handleWheel = (type: 'hour'|'minute'|'second', digit: 'tens'|'units', e: WheelEvent) => {
    const delta = e.deltaY < 0 ? 1 : -1;
    changeValue(type, digit, delta);
};

const changeValue = (type: 'hour'|'minute'|'second', digit: 'tens'|'units', delta: number) => {
    const refVar = getRefVar(type, digit);
    let val = parseInt(refVar.value) || 0;
    val += delta;

    if (val < 0) val = 9;
    if (val > 9) val = 0;

    if (digit === 'tens') {
        if (type === 'hour' && val > 2) val = 0; 
        if (type !== 'hour' && val > 5) val = 0; 
    }

    refVar.value = val.toString();
    validateAndCorrect(type); 
    updateModel();
};

const validateAndCorrect = (type: 'hour'|'minute'|'second') => {
    if (type === 'hour') {
        const h = parseInt(hourTens.value + hourUnits.value);
        if (h > 23) {
            if (hourTens.value === '2') hourUnits.value = '3';
        }
    } else {
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
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
</style>