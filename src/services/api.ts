import axios from "axios";
import { auth, signInAnonymously } from "../../firebaseConfig"; // Kiểm tra lại đường dẫn import này cho đúng với cấu trúc thư mục của bạn

// Lấy URL từ biến môi trường .env
const API_URL = import.meta.env.VITE_FIREBASE_DATABASE_URL;

// Hàm tiện ích: Lấy Token đăng nhập
const getAuthToken = async () => {
    if (!auth.currentUser) {
        await signInAnonymously(auth);
    }
    const token = await auth.currentUser?.getIdToken();
    return token;
};

// --- COUNTDOWN ---

const getCountdown = async () => {
    const token = await getAuthToken();
    const rs = await axios.get(`${API_URL}/countdown.json?auth=${token}`);
    return rs.data; 
};

const setCountdown = async (payload: { target: number, status: boolean }) => {
    const token = await getAuthToken();
    const rs = await axios.put(`${API_URL}/countdown.json?auth=${token}`, payload);
    return rs.data;
};

const resetCountdown = async () => {
    const token = await getAuthToken();
    const payload = { target: 0, status: false };
    const rs = await axios.put(`${API_URL}/countdown.json?auth=${token}`, payload);
    return rs.data;
};

// --- BUZZER ---

const getBuzzerStatus = async () => {
    const token = await getAuthToken();
    const rs = await axios.get(`${API_URL}/buzzer_status/status.json?auth=${token}`);
    return rs.data; 
};

const setBuzzerStatus = async (status: number) => {
    const token = await getAuthToken();
    const rs = await axios.patch(`${API_URL}/buzzer_status.json?auth=${token}`, { status: status });
    return rs.data;
};

// --- ALARMS ---

const getAlarms = async () => {
    const token = await getAuthToken();
    const rs = await axios.get(`${API_URL}/alarms.json?auth=${token}`);
    return rs.data; 
};

const updateAlarm = async (index: number, payload: { time: string, enable: boolean, day: number }) => {
    const token = await getAuthToken();
    const rs = await axios.put(`${API_URL}/alarms/${index}.json?auth=${token}`, payload);
    return rs.data;
};

const deleteAlarm = async (index: number) => {
    const token = await getAuthToken();
    const rs = await axios.delete(`${API_URL}/alarms/${index}.json?auth=${token}`);
    return rs.data;
};

// --- ENVIRONMENT ---

const getEnvironmentData = async () => {
    const token = await getAuthToken();
    const rs = await axios.get(`${API_URL}/environments.json?auth=${token}`);
    return rs.data;
};

// [ĐÃ SỬA] Dùng PUT thay vì PATCH để gán giá trị trực tiếp
const setState = async (state: number) => {
    const token = await getAuthToken();
    // PUT sẽ ghi đè giá trị tại node /state thành số bạn gửi lên
    const rs = await axios.put(`${API_URL}/state.json?auth=${token}`, state);
    return rs.data;
}

export { 
    getCountdown, 
    setCountdown, 
    resetCountdown, 
    getBuzzerStatus, 
    setBuzzerStatus,
    getAlarms, 
    updateAlarm, 
    deleteAlarm,
    getEnvironmentData,
    setState
};