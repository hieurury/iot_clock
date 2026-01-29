import { createRouter, createWebHistory } from 'vue-router'

// Layouts
import MainLayout from '../layouts/MainLayout.vue'

// Views
import HomeView from '../views/HomeView.vue'
import CountdownView from '../views/CountdownView.vue'
import AlarmView from '../views/AlarmView.vue'
import Test from '../views/Test.vue'

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
            },
            {
                path: 'test', // Đường dẫn '/test' sẽ load Test
                name: 'test',
                component: Test,
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router