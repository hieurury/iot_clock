<script setup lang="ts">
import { ref } from 'vue';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  const auth = getAuth();
  
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    router.push('/'); // Đăng nhập thành công thì về trang chủ
  } catch (e: any) {
    error.value = "Sai email hoặc mật khẩu!";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen px-4 flex items-center justify-center bg-slate-900">
    <div class="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 w-full max-w-sm">
      <h2 class="text-2xl font-bold text-white mb-6 text-center">Đăng nhập Admin</h2>
      
      <div class="flex flex-col gap-4">
        <input v-model="email" type="email" placeholder="Email" class="p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-cyan-400 outline-none" />
        <input v-model="password" type="password" placeholder="Mật khẩu" class="p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-cyan-400 outline-none" />
        
        <p v-if="error" class="text-red-400 text-sm text-center">{{ error }}</p>
        
        <button @click="handleLogin" :disabled="loading" class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50">
          {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
        </button>
      </div>
    </div>
  </div>
</template>