import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../firebase'  // Đảm bảo Firebase được khởi tạo
// Layouts
import MainLayout from '../layouts/MainLayout.vue'

// Views
import HomeView from '../views/HomeView.vue'
import CountdownView from '../views/CountdownView.vue'
import AlarmView from '../views/AlarmView.vue'
import LoginView from '../views/LoginView.vue';

const routes = [
    {
        path: '/',
        component: MainLayout, // MainLayout là khung cha
        children: [
            {
                path: '', // Đường dẫn gốc '/' sẽ load HomeView vào bên trong MainLayout
                name: 'home',
                component: HomeView,
                meta: { requiresAuth: true }, // Yêu cầu đăng nhập mới được vào trang này
            },
            {
                path: 'countdown', // Đường dẫn '/countdown' sẽ load CountdownView
                name: 'countdown',
                component: CountdownView,
                meta: { requiresAuth: true }, // Yêu cầu đăng nhập mới được vào trang này
            },
            {
                path: 'alarm', // Đường dẫn '/alarm' sẽ load AlarmView
                name: 'alarm',
                component: AlarmView,
                meta: { requiresAuth: true }, // Yêu cầu đăng nhập mới được vào trang này
            },
        ]
    },
    {
        path: '/login',
        name: 'login',
        component: LoginView,
        meta: { requiresAuth: false }, // Trang công khai
    }
]


const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Hàm kiểm tra quyền truy cập trước khi vào mỗi trang
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      getAuth(),
      (user) => {
        removeListener();
        resolve(user);
      },
      reject
    );
  });
};

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (await getCurrentUser()) {
      next(); // Đã đăng nhập -> Cho vào
    } else {
      next('/login'); // Chưa đăng nhập -> Đá về trang Login
    }
  } else {
    next(); // Trang công khai (như trang Login) -> Cho vào
  }
});


export default router