import { createRouter, createWebHistory } from 'vue-router'

// Layouts
import MainLayout from '../layouts/MainLayout.vue'

// Views
import HomeView from '../views/HomeView.vue'
import CountdownView from '../views/CountdownView.vue'
import AlarmView from '../views/AlarmView.vue'

const routes = [
    {
        path: '/',
        component: MainLayout, // MainLayout là khung cha
        children: [
            {
                path: '', // Đường dẫn gốc '/' sẽ load HomeView vào bên trong MainLayout
                name: 'home',
                component: HomeView,
            },
            {
                path: 'countdown', // Đường dẫn '/countdown' sẽ load CountdownView
                name: 'countdown',
                component: CountdownView,
            },
            {
                path: 'alarm', // Đường dẫn '/alarm' sẽ load AlarmView
                name: 'alarm',
                component: AlarmView,
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router