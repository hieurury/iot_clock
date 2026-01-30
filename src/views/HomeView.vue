<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { 
    ArrowPathIcon, 
    FireIcon, 
    CloudIcon,
    ChartBarIcon,
    TableCellsIcon,
    MagnifyingGlassPlusIcon,
    XMarkIcon
} from '@heroicons/vue/24/outline';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- CẤU HÌNH ---
const BLYNK_TOKEN = import.meta.env.VITE_BLYNK_TOKEN;
const BLYNK_REALTIME_URL = "https://sgp1.blynk.cloud/external/api/get"; 
const FIREBASE_DB_URL = import.meta.env.VITE_FIREBASE_DATABASE_URL;

// --- STATE ---
const activeTab = ref<'chart' | 'stats'>('chart');
const showDetailModal = ref(false);
const loading = ref(true);
const temp = ref<number | null>(null);
const humi = ref<number | null>(null);
const lastUpdate = ref("");
const historyRaw = ref<any>({});

// --- HELPER FUNCTIONS ---

const getValue = (record: any, type: 'temp' | 'humi') => {
    if (!record) return 0;
    if (type === 'temp') return record.temperature ?? record.Temperature ?? record.temp ?? 0;
    return record.humidity ?? record.Humidity ?? record.humi ?? 0;
};

const getLast7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) { // 7 ngày gần nhất
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push({
            fullDate: d,
            dayStr: d.getDate().toString(), 
            display: `${d.getDate()}/${d.getMonth() + 1}`
        });
    }
    return days.reverse(); // Đảo ngược để ngày cũ nhất bên trái (cho biểu đồ xu hướng)
};

// --- DATA PROCESSING ---

// 1. DATA BIỂU ĐỒ CHÍNH (Chi tiết từng giờ của HÔM NAY)
const todayChartData = computed(() => {
    const todayStr = new Date().getDate().toString();
    const dayData = historyRaw.value[todayStr];
    let labels: string[] = [];
    let dataTemp: number[] = [];
    let dataHumi: number[] = [];

    if (dayData) {
        Object.keys(dayData).sort((a, b) => Number(a) - Number(b)).forEach(hour => {
            const record = dayData[hour];
            labels.push(`${hour}h`);
            dataTemp.push(getValue(record, 'temp'));
            dataHumi.push(getValue(record, 'humi'));
        });
    }
    
    return {
        hasData: labels.length > 0,
        data: {
            labels,
            datasets: [
                { label: 'Nhiệt độ', data: dataTemp, borderColor: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.1)', yAxisID: 'y', fill: true, tension: 0.4 },
                { label: 'Độ ẩm', data: dataHumi, borderColor: '#06b6d4', backgroundColor: 'rgba(6, 182, 212, 0.1)', yAxisID: 'y1', fill: true, tension: 0.4 }
            ]
        }
    };
});

// Helper: Tính toán dữ liệu trung bình 7 ngày
const weeklyStatsRaw = computed(() => {
    const days = getLast7Days(); // [Ngày cũ ... Ngày mới]
    return days.map(dayObj => {
        const dayData = historyRaw.value[dayObj.dayStr];
        let dTemp = 0, dHumi = 0, dCount = 0;

        if (dayData) {
            Object.values(dayData).forEach((rec: any) => {
                const t = getValue(rec, 'temp');
                const h = getValue(rec, 'humi');
                if (t !== 0) { dTemp += t; dHumi += h; dCount++; }
            });
        }
        
        return {
            date: dayObj.display,
            avgTemp: dCount > 0 ? Number((dTemp / dCount).toFixed(1)) : null,
            avgHumi: dCount > 0 ? Number((dHumi / dCount).toFixed(1)) : null,
            hasData: dCount > 0
        };
    });
});

// 2. DATA BIỂU ĐỒ TRUNG BÌNH TUẦN (Cho Modal)
const weeklyAverageChart = computed(() => {
    const raw = weeklyStatsRaw.value;
    
    return {
        labels: raw.map(d => d.date),
        datasets: [
            {
                label: 'TB Nhiệt độ',
                data: raw.map(d => d.avgTemp),
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.2)',
                yAxisID: 'y',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            },
            {
                label: 'TB Độ ẩm',
                data: raw.map(d => d.avgHumi),
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.2)',
                yAxisID: 'y1',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ]
    };
});

// 3. DATA BẢNG THỐNG KÊ (Tab 2)
// (Đảo ngược lại để ngày mới nhất lên đầu bảng)
const statsTable = computed(() => {
    const raw = [...weeklyStatsRaw.value].reverse(); 
    return raw.map(d => ({
        date: d.date,
        avgTemp: d.hasData ? d.avgTemp : "--",
        avgHumi: d.hasData ? d.avgHumi : "--"
    }));
});

// --- API FETCH ---
async function fetchData() {
    loading.value = true;
    try {
        const [resTemp, resHumi] = await Promise.all([
            fetch(`${BLYNK_REALTIME_URL}?token=${BLYNK_TOKEN}&V1`),
            fetch(`${BLYNK_REALTIME_URL}?token=${BLYNK_TOKEN}&V2`)
        ]);
        if (resTemp.ok && resHumi.ok) {
            temp.value = parseFloat(await resTemp.text());
            humi.value = parseFloat(await resHumi.text());
            lastUpdate.value = new Date().toLocaleTimeString('vi-VN');
        }
        const resFb = await fetch(`${FIREBASE_DB_URL}/environments.json`);
        if (resFb.ok) historyRaw.value = await resFb.json() || {};
    } catch (e) { console.error(e); } 
    finally { loading.value = false; }
}

let interval: any = null;
onMounted(() => {
    fetchData();
    interval = setInterval(fetchData, 10000);
});
onUnmounted(() => { if (interval) clearInterval(interval); });

// Chart Config
const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
        legend: { labels: { color: '#cbd5e1' } },
        tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)' }
    },
    scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        y: { 
            type: 'linear' as const, display: true, position: 'left' as const,
            grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#f97316' },
            title: { display: true, text: 'Nhiệt độ (°C)', color: '#f97316' }
        },
        y1: {
            type: 'linear' as const, display: true, position: 'right' as const,
            grid: { drawOnChartArea: false }, ticks: { color: '#06b6d4' },
            title: { display: true, text: 'Độ ẩm (%)', color: '#06b6d4' }
        }
    }
};

const glassCard = "bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl";
</script>

<template>
    <div class="min-h-screen w-full relative">
        <div class="fixed inset-0 bg-slate-900 -z-10"></div>
        
        <div class="max-w-4xl mx-auto py-6 px-4 flex flex-col gap-6">
            
            <div class="flex justify-between items-end">
                <div>
                    <h1 class="text-2xl font-bold text-white drop-shadow-lg">Thống kê</h1>
                    <p class="text-slate-400 text-xs mt-1 font-mono">Cập nhật: {{ lastUpdate }}</p>
                </div>
                <button @click="fetchData" :disabled="loading" class="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-cyan-400 transition-all">
                    <ArrowPathIcon class="h-5 w-5" :class="{ 'animate-spin': loading }" />
                </button>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div :class="glassCard" class="relative group overflow-hidden">
                    <div class="absolute -right-4 -top-4 w-20 h-20 bg-orange-500/20 rounded-full blur-xl group-hover:bg-orange-500/30 transition-all"></div>
                    <div class="relative z-10">
                        <p class="text-slate-400 text-xs font-bold uppercase mb-1">Nhiệt độ</p>
                        <div class="flex items-end gap-1">
                            <span class="text-4xl font-black text-white">{{ temp ?? '--' }}</span>
                            <span class="text-lg text-orange-400 mb-1">°C</span>
                        </div>
                        <FireIcon class="h-6 w-6 text-orange-400 absolute bottom-4 right-4 opacity-50" />
                    </div>
                </div>

                <div :class="glassCard" class="relative group overflow-hidden">
                    <div class="absolute -right-4 -top-4 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl group-hover:bg-cyan-500/30 transition-all"></div>
                    <div class="relative z-10">
                        <p class="text-slate-400 text-xs font-bold uppercase mb-1">Độ ẩm</p>
                        <div class="flex items-end gap-1">
                            <span class="text-4xl font-black text-white">{{ humi ?? '--' }}</span>
                            <span class="text-lg text-cyan-400 mb-1">%</span>
                        </div>
                        <CloudIcon class="h-6 w-6 text-cyan-400 absolute bottom-4 right-4 opacity-50" />
                    </div>
                </div>
            </div>

            <div class="flex p-1 bg-slate-800/50 rounded-xl border border-white/5">
                <button @click="activeTab = 'chart'" class="flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2" :class="activeTab === 'chart' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'">
                    <ChartBarIcon class="h-4 w-4" /> Biểu Đồ
                </button>
                <button @click="activeTab = 'stats'" class="flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2" :class="activeTab === 'stats' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'">
                    <TableCellsIcon class="h-4 w-4" /> Thống Kê
                </button>
            </div>

            <div v-if="activeTab === 'chart'" :class="glassCard" class="min-h-100 flex flex-col animate-fade-in relative">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-white font-bold flex items-center gap-2">
                        <span class="w-1 h-5 bg-orange-500 rounded-full"></span>
                        Hôm nay
                    </h3>
                    <button @click="showDetailModal = true" class="text-xs flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition-all shadow-lg border border-white/10">
                        <MagnifyingGlassPlusIcon class="h-4 w-4" />
                        7 Ngày Qua
                    </button>
                </div>
                
                <div class="flex-1 relative w-full">
                    <Line v-if="todayChartData.hasData" :data="todayChartData.data" :options="commonChartOptions as any" />
                    <div v-else class="absolute inset-0 flex items-center justify-center text-slate-500 flex-col gap-2">
                        <ChartBarIcon class="h-8 w-8 opacity-50"/>
                        <span>Hôm nay chưa có dữ liệu</span>
                    </div>
                </div>
            </div>

            <div v-else :class="glassCard" class="overflow-hidden p-0! animate-fade-in">
                <div class="px-6 py-4 border-b border-white/10">
                    <h3 class="text-white font-bold">Thống kê Tuần qua</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm text-slate-400">
                        <thead class="bg-white/5 text-xs uppercase font-bold text-slate-300">
                            <tr><th class="px-6 py-3">Ngày</th><th class="px-6 py-3 text-orange-400">TB Nhiệt độ</th><th class="px-6 py-3 text-cyan-400">TB Độ ẩm</th></tr>
                        </thead>
                        <tbody class="divide-y divide-white/5">
                            <tr v-for="(row, idx) in statsTable" :key="idx" class="hover:bg-white/5 transition-colors">
                                <td class="px-6 py-3 font-medium text-white">{{ row.date }}</td>
                                <td class="px-6 py-3">{{ row.avgTemp }} <span v-if="row.avgTemp !== '--'">°C</span></td>
                                <td class="px-6 py-3">{{ row.avgHumi }} <span v-if="row.avgHumi !== '--'">%</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>

        <Transition name="fade">
            <div v-if="showDetailModal" class="fixed inset-0 z-999 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" @click="showDetailModal = false"></div>
                
                <div class="relative bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl h-150 flex flex-col shadow-2xl overflow-hidden animate-fade-in">
                    <div class="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                        <div>
                            <h2 class="text-xl font-bold text-white">Xu hướng 7 ngày qua</h2>
                            <p class="text-slate-400 text-xs">Biểu đồ thể hiện giá trị trung bình mỗi ngày</p>
                        </div>
                        <button @click="showDetailModal = false" class="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-all">
                            <XMarkIcon class="h-6 w-6" />
                        </button>
                    </div>

                    <div class="flex-1 p-6 relative">
                        <Line :data="weeklyAverageChart" :options="commonChartOptions as any" />
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>