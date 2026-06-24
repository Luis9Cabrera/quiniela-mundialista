<script setup>
import { useAuthStore } from '../stores/auth'
import GoogleLoginButton from '../components/GoogleLoginButton.vue'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

async function handleLogin() {
  try {
    await authStore.signInWithGoogle()
    // Redirect to redirect query param or fallback to dashboard
    const redirectTo = route.query.redirect || { name: 'dashboard' }
    router.push(redirectTo)
  } catch (error) {
    console.error('Failed to login:', error)
  }
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center py-12 px-4">
    <div class="glass-card bg-dark-card border border-slate-700/60 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-8">
      <!-- Icon/Logo -->
      <div class="flex flex-col items-center">
        <span class="text-5xl mb-4 select-none">🥅</span>
        <h2 class="text-2xl font-black text-white tracking-tight">¡Bienvenido de vuelta!</h2>
        <p class="text-sm text-slate-400 mt-2">
          Inicia sesión para entrar a tus quinielas y guardar tus predicciones.
        </p>
      </div>

      <!-- Button -->
      <div>
        <GoogleLoginButton 
          :loading="authStore.loading" 
          @click="handleLogin" 
        />
      </div>

      <!-- Footer Info -->
      <div class="text-[11px] text-slate-500 max-w-[280px] mx-auto leading-normal">
        Para jugar no necesitas crear una contraseña. Usamos Google para validar tu identidad de forma segura.
      </div>
    </div>
  </div>
</template>
