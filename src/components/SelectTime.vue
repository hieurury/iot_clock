<template>
    <div class="w-full flex justify-center">
        <div class="flex items-center gap-2 md:gap-4 select-none bg-slate-900/40 backdrop-blur-md px-4 py-4 rounded-2xl border border-white/10 shadow-inner">
            
            <div class="flex gap-1">
                <input
                    type="text" maxlength="1" v-model="hourTens"
                    @input="onDigitInput('hour', 'tens', $event)"
                    @wheel="onWheel('hour', 'tens', $event)"
                    :class="inputClass" 
                    aria-label="Giờ hàng chục" inputmode="numeric" pattern="[0-9]*"
                />
                <input
                    type="text" maxlength="1" v-model="hourUnits"
                    @input="onDigitInput('hour', 'units', $event)"
                    @wheel="onWheel('hour', 'units', $event)"
                    :class="inputClass"
                    aria-label="Giờ hàng đơn vị" inputmode="numeric" pattern="[0-9]*"
                />
            </div>

            <span class="text-2xl md:text-4xl select-none text-cyan-500/80 font-mono font-bold animate-pulse">:</span>

            <div class="flex gap-1">
                <input
                    type="text" maxlength="1" v-model="minuteTens"
                    @input="onDigitInput('minute', 'tens', $event)"
                    @wheel="onWheel('minute', 'tens', $event)"
                    :class="inputClass"
                    aria-label="Phút hàng chục" inputmode="numeric" pattern="[0-9]*"
                />
                <input
                    type="text" maxlength="1" v-model="minuteUnits"
                    @input="onDigitInput('minute', 'units', $event)"
                    @wheel="onWheel('minute', 'units', $event)"
                    :class="inputClass"
                    aria-label="Phút hàng đơn vị" inputmode="numeric" pattern="[0-9]*"
                />
            </div>

            <span class="text-2xl md:text-4xl select-none text-cyan-500/80 font-mono font-bold animate-pulse">:</span>

            <div class="flex gap-1">
                <input
                    type="text" maxlength="1" v-model="secondTens"
                    @input="onDigitInput('second', 'tens', $event)"
                    @wheel="onWheel('second', 'tens', $event)"
                    :class="inputClass"
                    aria-label="Giây hàng chục" inputmode="numeric" pattern="[0-9]*"
                />
                <input
                    type="text" maxlength="1" v-model="secondUnits"
                    @input="onDigitInput('second', 'units', $event)"
                    @wheel="onWheel('second', 'units', $event)"
                    :class="inputClass"
                    aria-label="Giây hàng đơn vị" inputmode="numeric" pattern="[0-9]*"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';

// --- ĐỊNH NGHĨA CLASS TẠI ĐÂY ĐỂ TRÁNH LỖI @APPLY ---
const inputClass = `
    w-10 md:w-14 h-12 md:h-16 text-center text-2xl md:text-4xl rounded-lg 
    border-2 border-slate-700 bg-slate-800 text-white font-bold font-mono 
    focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none 
    focus:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all duration-200
    caret-transparent cursor-pointer selection:bg-transparent
`;

interface Props {
    modelValue?: string; 
}
const props = withDefaults(defineProps<Props>(), {
    modelValue: '00:00:00'
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const hourTens = ref('0');
const hourUnits = ref('0');
const minuteTens = ref('0');
const minuteUnits = ref('0');
const secondTens = ref('0');
const secondUnits = ref('0');

const parseModelValue = (val: string) => {
    const parts = val.split(':');
    const h = (parts[0] || '00').padStart(2, '0');
    const m = (parts[1] || '00').padStart(2, '0');
    const s = (parts[2] || '00').padStart(2, '0');

    hourTens.value = h[0] ?? '0'; hourUnits.value = h[1] ?? '0';
    minuteTens.value = m[0] ?? '0'; minuteUnits.value = m[1] ?? '0';
    secondTens.value = s[0] ?? '0'; secondUnits.value = s[1] ?? '0';
};

watch(() => props.modelValue, (newVal) => {
    const current = `${hourTens.value}${hourUnits.value}:${minuteTens.value}${minuteUnits.value}:${secondTens.value}${secondUnits.value}`;
    if (newVal !== current) {
        parseModelValue(newVal);
    }
}, { immediate: true });

const updateModel = () => {
    const timeStr = `${hourTens.value}${hourUnits.value}:${minuteTens.value}${minuteUnits.value}:${secondTens.value}${secondUnits.value}`;
    emit('update:modelValue', timeStr);
};

function onDigitInput(type: 'hour'|'minute'|'second', digit: 'tens'|'units', e: Event) {
    const input = e.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, ''); 
    if (val.length > 1) val = val.slice(-1); 
    if (val === '') val = '0'; 
    
    if (type === 'hour') {
        if (digit === 'tens') hourTens.value = val;
        else hourUnits.value = val;
        let h = parseInt(hourTens.value + hourUnits.value, 10);
        if (h > 23) { hourTens.value = '2'; hourUnits.value = '3'; }
    } 
    else if (type === 'minute') {
        if (digit === 'tens') minuteTens.value = val;
        else minuteUnits.value = val;
        let m = parseInt(minuteTens.value + minuteUnits.value, 10);
        if (m > 59) { minuteTens.value = '5'; minuteUnits.value = '9'; }
    } 
    else if (type === 'second') {
        if (digit === 'tens') secondTens.value = val;
        else secondUnits.value = val;
        let s = parseInt(secondTens.value + secondUnits.value, 10);
        if (s > 59) { secondTens.value = '5'; secondUnits.value = '9'; }
    }

    updateModel();
    
    if (val.length === 1 && input.nextElementSibling instanceof HTMLInputElement) {
        input.nextElementSibling.focus();
    }
}

function onWheel(type: 'hour'|'minute'|'second', digit: 'tens'|'units', e: WheelEvent) {
    e.preventDefault();
    let refVar = hourTens; 
    let max = 9, min = 0;

    if (type === 'hour') {
        if (digit === 'tens') { refVar = hourTens; max = 2; }
        else { refVar = hourUnits; max = (parseInt(hourTens.value) === 2) ? 3 : 9; }
    } else if (type === 'minute') {
        if (digit === 'tens') { refVar = minuteTens; max = 5; }
        else { refVar = minuteUnits; }
    } else {
        if (digit === 'tens') { refVar = secondTens; max = 5; }
        else { refVar = secondUnits; }
    }

    let val = parseInt(refVar.value) || 0;
    if (e.deltaY < 0) val = val + 1 > max ? min : val + 1; 
    else val = val - 1 < min ? max : val - 1; 

    refVar.value = val.toString();
    updateModel();
}

onMounted(() => {
    parseModelValue(props.modelValue);
});
</script>

<style scoped>
/* Ẩn nút spinner mặc định của browser */
input[type=text]::-webkit-outer-spin-button,
input[type=text]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>