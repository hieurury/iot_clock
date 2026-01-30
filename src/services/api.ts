// Lấy Token từ file môi trường .env
const BLYNK_TOKEN = import.meta.env.VITE_BLYNK_TOKEN;
const BASE_URL = "https://blynk.cloud/external/api/";

// Hàm hỗ trợ gọi API Blynk
async function blynkRequest(endpoint: string, params: Record<string, any> = {}) {
    if (!BLYNK_TOKEN) throw new Error("Chưa cấu hình VITE_BLYNK_TOKEN trong .env");
    
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append("token", BLYNK_TOKEN);
    
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Blynk API Error: ${response.statusText}`);
    return response;
}

// ================= NHÓM 1: DỮ LIỆU CẢM BIẾN & BIỂU ĐỒ =================

/**
 * Lấy Nhiệt độ & Độ ẩm hiện tại (Snapshot)
 * Dùng cho các thẻ hiển thị realtime
 */
export async function getCurrentWeather() {
    try {
        const [resTemp, resHum] = await Promise.all([
            blynkRequest("get", { V1: "" }), // V1: Nhiệt độ
            blynkRequest("get", { V2: "" })  // V2: Độ ẩm
        ]);

        return {
            temp: await resTemp.json(),
            hum: await resHum.json()
        };
    } catch (error) {
        // error hidden for security
        return { temp: 0, hum: 0 };
    }
}

/**
 * Lấy dữ liệu lịch sử để vẽ biểu đồ
 * Mặc định lấy 1 tuần gần nhất
 */
export async function getEnvironmentData() {
    const endDate = Date.now();
    const startDate = endDate - (7 * 24 * 60 * 60 * 1000); // 7 ngày trước

    try {
        const [resTemp, resHum] = await Promise.all([
            blynkRequest("data/log", { pin: "V1", start: startDate, end: endDate }),
            blynkRequest("data/log", { pin: "V2", start: startDate, end: endDate })
        ]);

        const rawTemp = await resTemp.json();
        const rawHum = await resHum.json();

        // Format chuẩn cho Chart ({ x: timestamp, y: value })
        return {
            temperature: rawTemp.map((item: any[]) => ({ x: item[0], y: parseFloat(item[1]) })),
            humidity: rawHum.map((item: any[]) => ({ x: item[0], y: parseFloat(item[1]) })),
            lastUpdate: new Date().toLocaleString('vi-VN')
        };
    } catch (error) {
        // error hidden for security
        return null;
    }
}

// ================= NHÓM 2: ĐIỀU KHIỂN CÒI (BUZZER) =================

/**
 * Lấy trạng thái còi hiện tại (để đồng bộ nút toggle)
 */
export async function getBuzzerState(): Promise<boolean> {
    try {
        const res = await blynkRequest("get", { V0: "" });
        const val = await res.json();
        return val === 1;
    } catch (error) {
        return false;
    }
}

/**
 * Bật/Tắt còi
 * @param state true = Bật (1), false = Tắt (0)
 */
export async function toggleBuzzer(state: boolean) {
    try {
        const val = state ? 1 : 0;
        await blynkRequest("update", { V0: val });
        return true;
    } catch (error) {
        // error hidden for security
        return false;
    }
}

// ================= NHÓM 3: BÁO THỨC (ALARM) =================

/**
 * Lấy danh sách báo thức
 * (Vì V4 là String đơn, ta giả lập trả về mảng để App dễ xử lý)
 */
export async function getAlarms(): Promise<string[]> {
    try {
        const res = await blynkRequest("get", { V4: "" });
        const val = await res.text(); // V4 là String
        // Nếu chuỗi rỗng hoặc không có giờ -> trả về mảng rỗng
        return val && val.includes(":") ? [val] : [];
    } catch (error) {
        return [];
    }
}

/**
 * Thêm/Đặt báo thức mới
 * @param timeStr Chuỗi giờ (VD: "06:30")
 * Lưu ý: Vì V4 chỉ lưu 1 chuỗi, "thêm" ở đây thực chất là "ghi đè".
 */
export async function addAlarm(timeStr: string) {
    try {
        // Gửi chuỗi giờ lên V4
        await blynkRequest("update", { V4: timeStr });
        return true;
    } catch (error) {
        // error hidden for security
        return false;
    }
}

// ================= NHÓM 4: HẸN GIỜ (COUNTDOWN) =================

/**
 * Bắt đầu đếm ngược
 * @param minutes Số phút muốn hẹn (Gửi lên V3)
 */
export async function addCountdown(minutes: number) {
    try {
        await blynkRequest("update", { V3: minutes });
        return true;
    } catch (error) {
        // error hidden for security
        return false;
    }
}

/**
 * Hủy hẹn giờ
 * Gửi số 0 lên V3 để hủy
 */
export async function cancelCountdown() {
    try {
        await blynkRequest("update", { V3: 0 });
        return true;
    } catch (error) {
        // error hidden for security
        return false;
    }
}