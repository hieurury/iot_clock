<script setup>
import { ref, onMounted } from 'vue';

const BLYNK_TOKEN = "UkzLc9RMcFWYHkmiXLAa0yn3ga3gdosi"; // Token bạn lấy trong Blynk Console
const BLYNK_URL = "https://blynk.cloud/external/api/";

const nhietDo = ref(0);
const doAm = ref(0);
const isBuzzerOn = ref(false);

// --- HÀM GỬI LỆNH ĐIỀU KHIỂN ---
const toggleBuzzer = async () => {
  isBuzzerOn.value = !isBuzzerOn.value;
  const val = isBuzzerOn.value ? 1 : 0;
  
  // Gọi API Blynk để cập nhật chân V0 (Còi)
  try {
    await fetch(`${BLYNK_URL}update?token=${BLYNK_TOKEN}&V0=${val}`);
    console.log("Đã gửi lệnh còi:", val);
  } catch (e) {
    console.error("Lỗi gửi lệnh:", e);
  }
};

// --- HÀM ĐỌC DỮ LIỆU CẢM BIẾN ---
const fetchSensorData = async () => {
  try {
    // Lấy Nhiệt độ (V1)
    const resTemp = await fetch(`${BLYNK_URL}get?token=${BLYNK_TOKEN}&V1`);
    nhietDo.value = await resTemp.json();

    // Lấy Độ ẩm (V2)
    const resHumi = await fetch(`${BLYNK_URL}get?token=${BLYNK_TOKEN}&V2`);
    doAm.value = await resHumi.json();
    
    // Lấy trạng thái Còi hiện tại (V0) - Để đồng bộ nếu mạch tự tắt
    const resBuzzer = await fetch(`${BLYNK_URL}get?token=${BLYNK_TOKEN}&V0`);
    const buzzerVal = await resBuzzer.json();
    isBuzzerOn.value = (buzzerVal === 1);
    
  } catch (e) {
    console.error("Lỗi đọc cảm biến:", e);
  }
};

// Tự động cập nhật mỗi 2 giây
onMounted(() => {
  fetchSensorData(); // Gọi ngay lần đầu
  setInterval(fetchSensorData, 2000);
});
</script>
<template>
    <div class="max-w-md mx-auto bg-slate-800/70 backdrop-blur-md rounded-xl p-6 mt-10 shadow-lg border border-slate-700">
        <h2 class="text-2xl font-bold text-center mb-6 text-slate-200">Blynk Sensor Monitor</h2>
        <div class="space-y-4">
            <div class="flex justify-between items-center">
                <span class="text-slate-300 font-medium">Nhiệt độ:</span>
                <span class="text-slate-100 font-bold">{{ nhietDo }} °C</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-slate-300 font-medium">Độ ẩm:</span>
                <span class="text-slate-100 font-bold">{{ doAm }} %</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-slate-300 font-medium">Còi:</span>
                <button
                    @click="toggleBuzzer"
                    :class="isBuzzerOn ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'"
                    class="px-4 py-2 rounded-lg text-white font-semibold transition-colors duration-300"
                >
                    {{ isBuzzerOn ? 'Tắt còi' : 'Bật còi' }}
                </button>
            </div>
        </div>
    </div>
</template>