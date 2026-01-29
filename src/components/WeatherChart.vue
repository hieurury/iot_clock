<template>
    <div class="w-full">
        <div class="flex md:hidden bg-slate-800 p-1 rounded-xl mb-4 border border-slate-700">
            <button 
                @click="activeTab = 'chart'"
                :class="[
                    'flex-1 py-2 text-sm font-bold rounded-lg transition-all',
                    activeTab === 'chart' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white'
                ]">
                Biểu đồ
            </button>
            <button 
                @click="activeTab = 'data'"
                :class="[
                    'flex-1 py-2 text-sm font-bold rounded-lg transition-all',
                    activeTab === 'data' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white'
                ]">
                Số liệu & Thống kê
            </button>
        </div>

        <div class="flex flex-col xl:flex-row gap-6">
            
            <div 
                v-if="activeTab === 'chart' || isDesktop" 
                class="w-full xl:w-2/3 flex flex-col gap-4"
            >
                <div class="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-sm">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-slate-200 font-bold text-lg">Diễn biến Nhiệt & Ẩm</h3>
                        <div class="flex gap-4 text-xs">
                            <div class="flex items-center gap-1">
                                <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                                <span class="text-slate-400">Nhiệt độ</span>
                            </div>
                            <div class="flex items-center gap-1">
                                <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
                                <span class="text-slate-400">Độ ẩm</span>
                            </div>
                        </div>
                    </div>
                    <div class="h-75 md:h-112.5 w-full relative">
                        <Line :data="chartData" :options="chartOptions" />
                    </div>
                </div>
            </div>

            <div 
                v-if="activeTab === 'data' || isDesktop" 
                class="w-full xl:w-1/3 flex flex-col gap-4"
            >
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-sm">
                        <div class="text-slate-500 text-xs uppercase font-bold">TB Hôm nay</div>
                        <div class="text-2xl font-bold text-blue-400 mt-1">{{ stats.avgTemp }}°C</div>
                    </div>
                    <div class="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-sm">
                        <div class="text-slate-500 text-xs uppercase font-bold">Độ ẩm TB</div>
                        <div class="text-2xl font-bold text-emerald-400 mt-1">{{ stats.avgHum }}%</div>
                    </div>
                    <div class="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-sm">
                        <div class="text-slate-500 text-xs uppercase font-bold">Max (Tuần)</div>
                        <div class="text-2xl font-bold text-red-400 mt-1">{{ stats.maxTemp }}°C</div>
                    </div>
                    <div class="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-sm">
                        <div class="text-slate-500 text-xs uppercase font-bold">Min (Tuần)</div>
                        <div class="text-2xl font-bold text-cyan-400 mt-1">{{ stats.minTemp }}°C</div>
                    </div>
                </div>

                <div class="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
                    <div class="p-4 border-b border-slate-700 bg-slate-900/50">
                        <h3 class="text-slate-200 font-bold">Nhật ký chi tiết</h3>
                    </div>
                    
                    <div class="overflow-x-auto flex-1">
                        <table class="w-full text-left border-collapse text-sm">
                            <thead class="bg-slate-900/50 text-slate-400 sticky top-0">
                                <tr>
                                    <th class="p-3 font-semibold">Thời gian</th>
                                    <th class="p-3 font-semibold text-right">Temp</th>
                                    <th class="p-3 font-semibold text-right">Hum</th>
                                    <th class="p-3 font-semibold text-center">TT</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-700 text-slate-300">
                                <tr v-for="(row, index) in paginatedData" :key="index" class="hover:bg-slate-700/50 transition-colors">
                                    <td class="p-3">
                                        <div class="font-bold text-white">{{ formatTime(row.timestamp) }}</div>
                                        <div class="text-xs text-slate-500">{{ formatDate(row.timestamp) }}</div>
                                    </td>
                                    <td class="p-3 text-right font-mono text-blue-400">{{ row.temp }}°</td>
                                    <td class="p-3 text-right font-mono text-emerald-400">{{ row.hum }}%</td>
                                    <td class="p-3 text-center">
                                        <span v-if="row.temp > 35" class="inline-block w-2 h-2 rounded-full bg-red-500" title="Nóng"></span>
                                        <span v-else-if="row.hum > 90" class="inline-block w-2 h-2 rounded-full bg-blue-500" title="Ẩm"></span>
                                        <span v-else class="inline-block w-2 h-2 rounded-full bg-green-500" title="Tốt"></span>
                                    </td>
                                </tr>
                                <tr v-if="paginatedData.length === 0">
                                    <td colspan="4" class="p-6 text-center text-slate-500">Chưa có dữ liệu</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="p-3 border-t border-slate-700 bg-slate-900/30 flex justify-between items-center text-xs">
                        <button @click="currentPage--" :disabled="currentPage === 1" class="px-3 py-1.5 bg-slate-700 rounded hover:bg-slate-600 disabled:opacity-50 text-white font-medium">Trước</button>
                        <span class="text-slate-400">Trang {{ currentPage }} / {{ totalPages }}</span>
                        <button @click="currentPage++" :disabled="currentPage === totalPages" class="px-3 py-1.5 bg-slate-700 rounded hover:bg-slate-600 disabled:opacity-50 text-white font-medium">Sau</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Props nhận từ Parent (EnvironmentView.vue)
const props = defineProps<{ 
    data: { 
        temperature: { x: number, y: number }[], 
        humidity: { x: number, y: number }[],
        lastUpdate?: string 
    } 
}>();

// --- TAB & RESPONSIVE LOGIC ---
const activeTab = ref<'chart' | 'data'>('chart');
const isDesktop = ref(window.innerWidth >= 1280);

const handleResize = () => {
    isDesktop.value = window.innerWidth >= 1280;
};
onMounted(() => window.addEventListener('resize', handleResize));
onUnmounted(() => window.removeEventListener('resize', handleResize));

// --- XỬ LÝ DỮ LIỆU (QUAN TRỌNG: MAPPING BLYNK DATA) ---
interface DataRow {
    timestamp: number;
    temp: number;
    hum: number;
}

// Hàm gộp 2 mảng Nhiệt độ và Độ ẩm thành 1 danh sách duy nhất
// Blynk trả về 2 mảng riêng lẻ, cần gộp lại dựa trên timestamp gần nhau
const mergedData = computed<DataRow[]>(() => {
    if (!props.data?.temperature || !props.data?.humidity) return [];

    const tempData = props.data.temperature;
    const humData = props.data.humidity;
    
    // Map dữ liệu nhiệt độ trước
    const rows = tempData.map(tItem => {
        // Tìm bản ghi độ ẩm có thời gian gần nhất (trong vòng 5 phút)
        const hItem = humData.find(h => Math.abs(h.x - tItem.x) < 300000); 
        return {
            timestamp: tItem.x,
            temp: tItem.y,
            hum: hItem ? hItem.y : 0 // Nếu không tìm thấy thì tạm để 0
        };
    });

    return rows.sort((a, b) => a.timestamp - b.timestamp);
});

// --- THỐNG KÊ ---
const stats = computed(() => {
    const list = mergedData.value;
    if (list.length === 0) return { avgTemp: 0, avgHum: 0, maxTemp: 0, minTemp: 0 };

    const temps = list.map(r => r.temp);
    const hums = list.map(r => r.hum).filter(h => h > 0); // Lọc bỏ giá trị 0 ảo

    return {
        avgTemp: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
        avgHum: hums.length ? (hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(0) : 0,
        maxTemp: Math.max(...temps),
        minTemp: Math.min(...temps)
    };
});

// --- CẤU HÌNH CHART ---
const chartData = computed(() => {
    // Chỉ lấy khoảng 50 điểm dữ liệu gần nhất để vẽ cho đỡ rối
    // Hoặc lấy mẫu (sampling) nếu dữ liệu quá dày
    const rawData = mergedData.value;
    const samplingRate = Math.ceil(rawData.length / 50); 
    const displayData = rawData.filter((_, index) => index % samplingRate === 0);

    return {
        labels: displayData.map(r => formatTime(r.timestamp)), // Nhãn trục X là giờ:phút
        datasets: [
            {
                label: 'Nhiệt độ',
                data: displayData.map(r => r.temp),
                borderColor: '#3b82f6',
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 2,
                pointBackgroundColor: '#1e293b',
                pointBorderColor: '#3b82f6',
                yAxisID: 'y'
            },
            {
                label: 'Độ ẩm',
                data: displayData.map(r => r.hum),
                borderColor: '#10b981',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [4, 4],
                tension: 0.4,
                pointRadius: 0,
                yAxisID: 'y1'
            }
        ]
    };
});

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            mode: 'index' as const,
            intersect: false,
            backgroundColor: '#0f172a',
            titleColor: '#e2e8f0',
            bodyColor: '#fff',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 10
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 }
        },
        y: {
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            grid: { color: '#334155', tickLength: 0 },
            ticks: { color: '#94a3b8' }
        },
        y1: {
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            grid: { display: false },
            ticks: { display: false },
            min: 0, max: 100
        }
    }
};

// --- PHÂN TRANG BẢNG ---
const currentPage = ref(1);
const pageSize = 8;
const tableSource = computed(() => [...mergedData.value].reverse()); // Đảo ngược để hiện mới nhất lên đầu
const totalPages = computed(() => Math.ceil(tableSource.value.length / pageSize));
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return tableSource.value.slice(start, start + pageSize);
});

// --- UTILS FORMAT ---
const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};
const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

</script>