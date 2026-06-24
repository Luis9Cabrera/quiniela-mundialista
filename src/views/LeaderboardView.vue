<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuinielaStore } from '../stores/quiniela'
import LeaderboardTable from '../components/LeaderboardTable.vue'

const route = useRoute()
const quinielaStore = useQuinielaStore()

onMounted(() => {
  if (route.params.id) {
    quinielaStore.listenToQuiniela(route.params.id)
  }
})

onUnmounted(() => {
  quinielaStore.stopListeningToQuiniela()
})
</script>

<template>
  <div class="space-y-8 py-4">
    <!-- Header Back Navigation -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <router-link 
        :to="{ name: 'quiniela-detail', params: { id: route.params.id } }" 
        class="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <span>← Volver a la Quiniela</span>
      </router-link>
      
      <span v-if="quinielaStore.currentQuiniela" class="text-xs text-gradient-gold font-bold">
        🏆 {{ quinielaStore.currentQuiniela.name }}
      </span>
    </div>

    <!-- Title and Description -->
    <div>
      <h2 class="text-2xl font-black text-white">Tabla de Clasificación</h2>
      <p class="text-xs text-slate-400 mt-1">Sigue el avance de los puntos acumulados por todos los participantes.</p>
    </div>

    <!-- Leaderboard loading state -->
    <div v-if="!quinielaStore.currentQuiniela" class="py-12 flex flex-col justify-center items-center space-y-3">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-gold-400 border-t-transparent"></div>
      <p class="text-xs text-slate-400">Calculando puntuaciones...</p>
    </div>

    <!-- Leaderboard Table -->
    <div v-else>
      <LeaderboardTable :leaderboard="quinielaStore.leaderboard" />
    </div>
  </div>
</template>
