<script setup>
import { useAuthStore } from '../stores/auth'
import GoogleLoginButton from '../components/GoogleLoginButton.vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogin() {
  await authStore.signInWithGoogle()
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="space-y-16 py-8">
    <!-- Hero Section -->
    <section class="relative text-center py-12 md:py-20 flex flex-col items-center">
      <!-- Trofeo flotante animado (Emoji + Glow) -->
      <div class="relative w-28 h-28 md:w-36 md:h-36 mb-8 select-none">
        <div class="absolute inset-0 bg-gold-400/20 blur-3xl rounded-full animate-pulse-subtle"></div>
        <span class="absolute inset-0 flex items-center justify-center text-7xl md:text-8xl animate-bounce-subtle">
          🏆
        </span>
      </div>

      <!-- Main Headline -->
      <h1 class="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight">
        Crea tu Quiniela Mundialista <br class="hidden md:inline" />
        <span class="text-gradient-gold">FIFA World Cup 2026</span>
      </h1>
      <p class="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
        Juega con tus amigos, predice los resultados de los 104 partidos del mundial de fútbol y demuestra quién es el verdadero rey de los pronósticos.
      </p>

      <!-- Action Buttons -->
      <div class="max-w-xs w-full mx-auto">
        <router-link 
          v-if="authStore.isAuthenticated"
          :to="{ name: 'dashboard' }"
          class="block w-full text-center px-8 py-4 text-base font-bold text-dark-deep bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 rounded-xl shadow-xl hover:shadow-gold-500/20 transform hover:-translate-y-0.5 transition-all duration-300"
        >
          Ir a mi Panel ⚽
        </router-link>
        <GoogleLoginButton 
          v-else
          :loading="authStore.loading" 
          @click="handleLogin" 
        />
      </div>
    </section>

    <!-- Info Cards: How it works -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="glass-card bg-dark-card p-6 md:p-8 rounded-3xl hover:border-gold-500/25 transition-all duration-300 flex flex-col items-center text-center">
        <div class="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-2xl mb-4">
          👥
        </div>
        <h3 class="text-lg font-bold text-white mb-2">Crea tu Grupo</h3>
        <p class="text-sm text-slate-400">
          Crea una quiniela privada en segundos y comparte el código de invitación único con tus amigos por WhatsApp.
        </p>
      </div>

      <div class="glass-card bg-dark-card p-6 md:p-8 rounded-3xl hover:border-gold-500/25 transition-all duration-300 flex flex-col items-center text-center">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl mb-4">
          📝
        </div>
        <h3 class="text-lg font-bold text-white mb-2">Pronostica Partidos</h3>
        <p class="text-sm text-slate-400">
          Ingresa tus marcadores previstos para la fase de grupos y sigue guardando para la eliminatoria hasta antes del silbatazo inicial.
        </p>
      </div>

      <div class="glass-card bg-dark-card p-6 md:p-8 rounded-3xl hover:border-gold-500/25 transition-all duration-300 flex flex-col items-center text-center">
        <div class="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl mb-4">
          📈
        </div>
        <h3 class="text-lg font-bold text-white mb-2">Tabla en Vivo</h3>
        <p class="text-sm text-slate-400">
          Suma puntos con cada resultado correcto. Nuestra tabla de clasificación se actualiza al instante en cuanto el administrador sube el marcador real.
        </p>
      </div>
    </section>

    <!-- Points breakdown -->
    <section class="glass-card bg-dark-card rounded-3xl p-6 md:p-10 max-w-4xl mx-auto border border-dark-border/80">
      <div class="text-center mb-8">
        <h2 class="text-2xl md:text-3xl font-black text-white">Sistema de Puntuación</h2>
        <p class="text-sm text-slate-400 mt-1">Cómo se calculan los puntos de la quiniela</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <!-- 5 points card -->
        <div class="bg-dark-panel/40 border border-dark-border/60 rounded-2xl p-5 flex items-start space-x-4">
          <div class="bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-extrabold text-lg px-3.5 py-1.5 rounded-xl font-mono">
            5
          </div>
          <div>
            <h4 class="font-bold text-white text-sm mb-1">Resultado Exacto</h4>
            <p class="text-xs text-slate-400">
              Si aciertas exactamente los goles de ambos equipos. Por ejemplo, predices 2-1 y el partido termina 2-1.
            </p>
          </div>
        </div>

        <!-- 2 points card -->
        <div class="bg-dark-panel/40 border border-dark-border/60 rounded-2xl p-5 flex items-start space-x-4">
          <div class="bg-gold-500/15 border border-gold-500/25 text-gold-400 font-extrabold text-lg px-3.5 py-1.5 rounded-xl font-mono">
            2
          </div>
          <div>
            <h4 class="font-bold text-white text-sm mb-1">Ganador / Empate</h4>
            <p class="text-xs text-slate-400">
              Si aciertas quién gana o si empatan, pero no el marcador exacto. Por ejemplo, predices 1-0, gana 3-1.
            </p>
          </div>
        </div>
      </div>

      <div class="mt-6 bg-slate-900/30 border border-slate-800 rounded-2xl p-4 flex items-center justify-center space-x-3">
        <span class="text-xl">⚡</span>
        <p class="text-xs font-semibold text-slate-300">
          <span class="text-gold-400 font-extrabold uppercase">Multiplicador Eliminatoria:</span> Todos los aciertos en la ronda de eliminación directa (Dieciseisavos a Final) suman un <span class="text-emerald-400">x1.5</span> extra.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.animate-bounce-subtle {
  animation: bounce-subtle 4s infinite ease-in-out;
}
</style>
