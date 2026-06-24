<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useQuinielaStore } from '../stores/quiniela'
import JoinModal from '../components/JoinModal.vue'

const authStore = useAuthStore()
const quinielaStore = useQuinielaStore()
const router = useRouter()

const showJoinModal = ref(false)

onMounted(async () => {
  await quinielaStore.fetchMyQuinielas()
})

function handleJoined(quiniela) {
  // Redirect to newly joined quiniela details
  if (quiniela && quiniela.id) {
    router.push({ name: 'quiniela-detail', params: { id: quiniela.id } })
  }
}
</script>

<template>
  <div class="space-y-10 py-6">
    <!-- Top Welcome Card -->
    <div class="glass-card bg-dark-card border border-dark-border/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center space-x-4 text-center md:text-left flex-col md:flex-row gap-4 md:gap-0">
        <img 
          :src="authStore.user?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback'" 
          alt="Avatar" 
          class="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gold-400 shadow-lg shadow-gold-500/10"
        />
        <div>
          <h2 class="text-xl md:text-2xl font-black text-white">¡Hola, {{ authStore.user?.displayName }}!</h2>
          <p class="text-xs md:text-sm text-slate-400 mt-1">Listo para conquistar la gloria del mundial.</p>
        </div>
      </div>

      <!-- Quick stats -->
      <div class="flex items-center space-x-6 bg-slate-900/50 border border-slate-800/80 px-6 py-4 rounded-2xl w-full md:w-auto justify-around">
        <div class="text-center">
          <span class="block text-xl font-extrabold text-gold-400 font-mono">{{ quinielaStore.myQuinielas.length }}</span>
          <span class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Mis Grupos</span>
        </div>
        <div class="h-8 w-px bg-slate-800"></div>
        <div class="text-center">
          <span class="block text-xl font-extrabold text-white font-mono">104</span>
          <span class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Partidos</span>
        </div>
      </div>
    </div>

    <!-- Actions Section -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Create CTA -->
      <router-link 
        :to="{ name: 'create-quiniela' }"
        class="glass-card bg-gradient-to-br from-gold-950/20 to-dark-card hover:to-gold-950/20 border border-dark-border/80 hover:border-gold-500/30 rounded-2xl p-6 flex items-center justify-between group transition-all duration-300 shadow-md hover:-translate-y-0.5"
      >
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 rounded-xl bg-gold-500/10 group-hover:bg-gold-500/20 border border-gold-500/20 flex items-center justify-center text-xl transition-all">
            ✨
          </div>
          <div>
            <h4 class="font-bold text-white text-base">Crear Nueva Quiniela</h4>
            <p class="text-xs text-slate-400 mt-0.5">Crea tu propio grupo privado</p>
          </div>
        </div>
        <span class="text-slate-400 group-hover:text-gold-400 transition-colors">➔</span>
      </router-link>

      <!-- Join CTA -->
      <button 
        @click="showJoinModal = true"
        class="glass-card bg-gradient-to-br from-emerald-950/20 to-dark-card hover:to-emerald-950/20 border border-dark-border/80 hover:border-emerald-500/30 rounded-2xl p-6 flex items-center justify-between text-left group transition-all duration-300 shadow-md hover:-translate-y-0.5"
      >
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-xl transition-all">
            🔑
          </div>
          <div>
            <h4 class="font-bold text-white text-base">Unirse con Código</h4>
            <p class="text-xs text-slate-400 mt-0.5">Ingresa con el código de un amigo</p>
          </div>
        </div>
        <span class="text-slate-400 group-hover:text-emerald-400 transition-colors">➔</span>
      </button>
    </div>

    <!-- My Quinielas List -->
    <div>
      <h3 class="text-lg font-bold text-white mb-4 flex items-center space-x-2">
        <span>⚽</span>
        <span>Mis Quinielas Participantes</span>
      </h3>

      <!-- Loading State -->
      <div v-if="quinielaStore.loading" class="py-12 flex justify-center items-center">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-gold-400 border-t-transparent"></div>
      </div>

      <!-- Empty State -->
      <div 
        v-else-if="quinielaStore.myQuinielas.length === 0" 
        class="glass-card bg-dark-card border border-dashed border-slate-700/60 rounded-3xl p-10 text-center space-y-4"
      >
        <p class="text-slate-400 text-sm">Aún no eres miembro de ninguna quiniela mundialista.</p>
        <button 
          @click="showJoinModal = true"
          class="px-5 py-2.5 text-xs font-bold text-dark-deep bg-gradient-to-r from-gold-300 to-gold-500 rounded-lg shadow-lg hover:shadow-gold-500/10"
        >
          ¡Únete a una ahora!
        </button>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          v-for="q in quinielaStore.myQuinielas" 
          :key="q.id"
          class="glass-card bg-dark-card border border-dark-border/80 hover:border-gold-500/15 rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col justify-between shadow-lg"
        >
          <div>
            <div class="flex justify-between items-start mb-4">
              <h4 class="font-extrabold text-white text-lg tracking-tight truncate max-w-[80%]">{{ q.name }}</h4>
              <span 
                v-if="q.ownerId === authStore.user?.uid"
                class="px-2 py-0.5 rounded-md bg-gold-500/15 border border-gold-500/25 text-gold-400 text-[9px] font-bold uppercase tracking-wider"
              >
                Creador
              </span>
            </div>
            
            <div class="flex items-center space-x-6 text-xs text-slate-400 mb-6 bg-slate-900/30 p-3 rounded-xl border border-dark-border/30">
              <div class="flex items-center space-x-1">
                <span>👥</span>
                <span class="font-bold text-slate-300">{{ q.members.length }}</span>
                <span>miembros</span>
              </div>
              <div class="h-4 w-px bg-slate-800"></div>
              <div class="flex items-center space-x-1 truncate max-w-[150px]">
                <span>👑</span>
                <span>Admin:</span>
                <span class="font-semibold text-slate-300">{{ q.ownerName }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="grid grid-cols-3 gap-2">
            <router-link 
              :to="{ name: 'quiniela-detail', params: { id: q.id } }"
              class="text-center py-2 text-xs font-bold text-slate-300 bg-slate-800/40 hover:bg-slate-800 hover:text-white border border-slate-700/50 rounded-lg transition-all"
            >
              Info
            </router-link>
            <router-link 
              :to="{ name: 'predict', params: { id: q.id } }"
              class="text-center py-2 text-xs font-bold text-emerald-400 bg-emerald-950/15 hover:bg-emerald-950/30 border border-emerald-900/30 rounded-lg transition-all"
            >
              Predicciones
            </router-link>
            <router-link 
              :to="{ name: 'leaderboard', params: { id: q.id } }"
              class="text-center py-2 text-xs font-bold text-gold-400 bg-gold-950/15 hover:bg-gold-950/30 border border-gold-900/30 rounded-lg transition-all"
            >
              Posiciones
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal overlay -->
    <JoinModal :show="showJoinModal" @close="showJoinModal = false" @joined="handleJoined" />
  </div>
</template>
