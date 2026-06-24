<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useQuinielaStore } from '../stores/quiniela'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const quinielaStore = useQuinielaStore()

const copied = ref(false)

onMounted(() => {
  if (route.params.id) {
    quinielaStore.listenToQuiniela(route.params.id)
  }
})

onUnmounted(() => {
  quinielaStore.stopListeningToQuiniela()
})

const isOwner = computed(() => {
  return quinielaStore.currentQuiniela?.ownerId === authStore.user?.uid
})

async function copyCode() {
  if (!quinielaStore.currentQuiniela?.code) return
  
  try {
    await navigator.clipboard.writeText(quinielaStore.currentQuiniela.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy code:', err)
  }
}

// Convert memberNames object map to array
const membersList = computed(() => {
  if (!quinielaStore.currentQuiniela) return []
  const namesMap = quinielaStore.currentQuiniela.memberNames || {}
  return quinielaStore.currentQuiniela.members.map(memberId => {
    return {
      id: memberId,
      name: namesMap[memberId]?.name || 'Participante',
      photoURL: namesMap[memberId]?.photoURL || ''
    }
  })
})
</script>

<template>
  <div class="space-y-8 py-4">
    <!-- Back Navigation -->
    <router-link 
      :to="{ name: 'dashboard' }" 
      class="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
    >
      <span>← Volver al Panel</span>
    </router-link>

    <!-- Loading State -->
    <div v-if="!quinielaStore.currentQuiniela" class="py-12 flex flex-col justify-center items-center space-y-3">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-gold-400 border-t-transparent"></div>
      <p class="text-xs text-slate-400">Cargando detalles del grupo...</p>
    </div>

    <!-- Details View -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Left Column: Details & Invites (7 cols) -->
      <div class="lg:col-span-8 space-y-6">
        
        <!-- League Header Info -->
        <div class="glass-card bg-dark-card border border-dark-border/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <span class="text-2xl">🏆</span>
              <h2 class="text-xl md:text-2xl font-black text-white tracking-tight">
                {{ quinielaStore.currentQuiniela.name }}
              </h2>
            </div>
            <p class="text-xs text-slate-400">
              Administrador: <span class="font-semibold text-slate-300">{{ quinielaStore.currentQuiniela.ownerName }}</span>
            </p>
          </div>

          <!-- Invitation Code Box -->
          <div class="bg-dark-panel border border-slate-800 rounded-2xl p-4 flex items-center justify-between space-x-6">
            <div>
              <span class="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Código de Invitación</span>
              <span class="text-lg font-mono font-black text-white tracking-widest">{{ quinielaStore.currentQuiniela.code }}</span>
            </div>
            <button 
              @click="copyCode"
              class="px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5"
              :class="copied 
                ? 'bg-emerald-950/40 border border-emerald-900/60 text-emerald-400' 
                : 'bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-200'"
            >
              <span>{{ copied ? '¡Copiado!' : 'Copiar' }}</span>
              <span>{{ copied ? '✓' : '📋' }}</span>
            </button>
          </div>
        </div>

        <!-- Dashboard Shortcut Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <!-- Predictions View Card -->
          <router-link 
            :to="{ name: 'predict', params: { id: quinielaStore.currentQuiniela.id } }"
            class="glass-card bg-dark-card border border-dark-border/80 hover:border-emerald-500/20 rounded-2xl p-5 text-center group transition-all duration-300 shadow-md hover:-translate-y-0.5"
          >
            <div class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-lg mb-3">
              📝
            </div>
            <h4 class="font-bold text-white text-sm mb-1 group-hover:text-emerald-400 transition-colors">Mis Predicciones</h4>
            <p class="text-[10px] text-slate-400">Ingresa o edita tus marcadores del Mundial</p>
          </router-link>

          <!-- Leaderboard View Card -->
          <router-link 
            :to="{ name: 'leaderboard', params: { id: quinielaStore.currentQuiniela.id } }"
            class="glass-card bg-dark-card border border-dark-border/80 hover:border-gold-500/20 rounded-2xl p-5 text-center group transition-all duration-300 shadow-md hover:-translate-y-0.5"
          >
            <div class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-lg mb-3">
              📈
            </div>
            <h4 class="font-bold text-white text-sm mb-1 group-hover:text-gold-400 transition-colors">Posiciones</h4>
            <p class="text-[10px] text-slate-400">Revisa la clasificación en tiempo real</p>
          </router-link>

          <!-- Admin Panel (Only for owner) -->
          <router-link 
            v-if="isOwner"
            :to="{ name: 'admin', params: { id: quinielaStore.currentQuiniela.id } }"
            class="glass-card bg-dark-card border border-dark-border/80 hover:border-amber-500/20 rounded-2xl p-5 text-center group transition-all duration-300 shadow-md hover:-translate-y-0.5"
          >
            <div class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-lg mb-3">
              ⚙️
            </div>
            <h4 class="font-bold text-white text-sm mb-1 group-hover:text-amber-400 transition-colors">Panel Admin</h4>
            <p class="text-[10px] text-slate-400">Ingresar resultados reales del torneo</p>
          </router-link>
        </div>

      </div>

      <!-- Right Column: Members (4 cols) -->
      <div class="lg:col-span-4 glass-card bg-dark-card border border-dark-border/80 rounded-3xl p-6 shadow-xl">
        <h3 class="font-extrabold text-white text-sm uppercase tracking-wider mb-4 pb-2 border-b border-dark-border/40">
          Participantes ({{ membersList.length }})
        </h3>
        
        <ul class="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
          <li 
            v-for="member in membersList" 
            :key="member.id"
            class="flex items-center space-x-3 p-2 bg-slate-900/20 border border-dark-border/20 rounded-xl"
          >
            <img 
              :src="member.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback'" 
              alt="Avatar" 
              class="w-8 h-8 rounded-full border border-slate-700/50"
            />
            <div class="flex flex-col truncate">
              <span class="text-xs font-bold text-slate-200 truncate">{{ member.name }}</span>
              <span v-if="member.id === quinielaStore.currentQuiniela.ownerId" class="text-[9px] text-gold-400 font-medium">Administrador</span>
              <span v-else class="text-[9px] text-slate-500 font-medium">Jugador</span>
            </div>
          </li>
        </ul>
      </div>

    </div>
  </div>
</template>
