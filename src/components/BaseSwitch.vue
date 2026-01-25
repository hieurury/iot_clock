<template>
    <button 
        type="button"
        class="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        :class="modelValue ? 'bg-blue-600' : 'bg-slate-700'"
        @click="toggle"
        :disabled="disabled"
    >
        <span class="sr-only">Use setting</span>
        <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
        />
    </button>
</template>

<script setup lang="ts">
const props = defineProps<{
    modelValue: boolean;
    disabled?: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'change', value: boolean): void;
}>();

const toggle = () => {
    if (props.disabled) return;
    const newValue = !props.modelValue;
    emit('update:modelValue', newValue);
    emit('change', newValue);
};
</script>