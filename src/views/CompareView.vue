<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuinielaStore } from '../stores/quiniela'
import { useMatchesStore } from '../stores/matches'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const quinielaStore = useQuinielaStore()
const matchesStore = useMatchesStore()
const authStore = useAuthStore()

const activeTab = ref('groups')
const activeGroup = ref('A')
const playerPredictions = ref([])

onMounted(async () => {
  if (route.params.id) {
    quinielaStore.listenToQuiniela(route.params.id)
    const all = await quinielaStore.getAllPredictions(route.params.id)
    playerPredictions.value = all
  }
})

onUnmounted(() => {
  quinielaStore.stopListeningToQuiniela()
})

const players = computed(() => {
  const namesMap = quinielaStore.currentQuiniela?.memberNames || {}
  return playerPredictions.value.map(p => ({
    userId: p.userId,
    name: namesMap[p.userId]?.name || p.userName || 'Participante',
    photoURL: namesMap[p.userId]?.photoURL || p.photoURL || '',
    predictions: p.predictions || {}
  }))
})

const currentGroupMatches = computed(() => {
  return matchesStore.getMatchesByGroup(activeGroup.value)
})

const knockoutMatches = computed(() => {
  return matchesStore.matches.filter(m => m.phase !== 'groups')
})

function hasPrediction(matchId) {
  return players.value.some(p => p.predictions[matchId])
}

function getPlayerPrediction(player, matchId) {
  const p = player.predictions[matchId]
  if (!p || p.homeScore === undefined || p.awayScore === undefined) return null
  return p
}

function isExact(playerPred, official) {
  if (!playerPred || !official) return false
  return parseInt(playerPred.homeScore) === official.homeScore &&
         parseInt(playerPred.awayScore) === official.awayScore
}

function isWinner(playerPred, official) {
  if (!playerPred || !official) return false
  const pDiff = parseInt(playerPred.homeScore) - parseInt(playerPred.awayScore)
  const oDiff = official.homeScore - official.awayScore
  return (pDiff > 0 && oDiff > 0) || (pDiff < 0 && oDiff < 0) || (pDiff === 0 && oDiff === 0)
}
</script>

<template>
  <div class="space-y-8 py-4">
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

    <div>
      <h2 class="text-2xl font-black text-white">Comparar Predicciones</h2>
      <p class="text-xs text-slate-400 mt-1">Revisa los pronósticos de todos los participantes.</p>
    </div>

    <div v-if="!quinielaStore.currentQuiniela" class="py-12 flex flex-col justify-center items-center space-y-3">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-gold-400 border-t-transparent"></div>
      <p class="text-xs text-slate-400">Cargando...</p>
    </div>

    <div v-else>
      <div class="flex border-b border-dark-border/60">
        <button
          @click="activeTab = 'groups'"
          class="px-6 py-3 text-sm font-bold tracking-wide transition-all border-b-2"
          :class="activeTab === 'groups' ? 'border-gold-400 text-gold-400' : 'border-transparent text-slate-400 hover:text-white'"
        >
          Fase de Grupos
        </button>
        <button
          @click="activeTab = 'knockout'"
          class="px-6 py-3 text-sm font-bold tracking-wide transition-all border-b-2"
          :class="activeTab === 'knockout' ? 'border-gold-400 text-gold-400' : 'border-transparent text-slate-400 hover:text-white'"
        >
          Fase de Eliminatoria
        </button>
      </div>

      <div v-if="activeTab === 'groups'" class="space-y-6 mt-6">
        <div class="flex items-center space-x-2 overflow-x-auto custom-scrollbar pb-2">
          <button
            v-for="letter in Object.keys(matchesStore.groups)"
            :key="letter"
            @click="activeGroup = letter"
            class="w-10 h-10 flex-shrink-0 text-xs font-bold rounded-lg border transition-all"
            :class="activeGroup === letter
              ? 'bg-gold-500/10 border-gold-500/40 text-gold-400 font-extrabold shadow shadow-gold-950'
              : 'bg-dark-panel border-dark-border text-slate-400 hover:text-white'"
          >
            {{ letter }}
          </button>
        </div>

        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-dark-border text-slate-500 font-bold uppercase bg-dark-panel/30">
                <th class="py-3 px-3 whitespace-nowrap sticky left-0 bg-dark-panel/30 z-10">Partido</th>
                <th class="py-3 px-3 text-center whitespace-nowrap">Resultado</th>
                <th
                  v-for="player in players"
                  :key="player.userId"
                  class="py-3 px-3 text-center whitespace-nowrap"
                >
                  <div class="flex items-center space-x-1.5 justify-center">
                    <img :src="player.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback'" class="w-5 h-5 rounded-full border border-slate-700/50" />
                    <span class="text-xs" :class="player.userId === authStore.user?.uid ? 'text-gold-400 font-extrabold' : 'text-slate-300'">
                      {{ player.name.split(' ')[0] }}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="match in currentGroupMatches"
                :key="match.id"
                class="border-b border-dark-border/40 hover:bg-slate-800/15 transition-colors"
              >
                <td class="py-3 px-3 whitespace-nowrap sticky left-0 bg-dark-card z-10 border-r border-dark-border/20">
                  <span class="font-semibold text-white">{{ match.homeTeam.emoji }} {{ match.homeTeam.name }}</span>
                  <span class="text-slate-600 mx-1">vs</span>
                  <span class="font-semibold text-white">{{ match.awayTeam.emoji }} {{ match.awayTeam.name }}</span>
                </td>
                <td class="py-3 px-3 text-center font-bold font-mono">
                  <span v-if="match.homeScore !== null && match.awayScore !== null" class="text-white bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                    {{ match.homeScore }}:{{ match.awayScore }}
                  </span>
                  <span v-else class="text-slate-600">- : -</span>
                </td>
                <td
                  v-for="player in players"
                  :key="player.userId"
                  class="py-3 px-3 text-center"
                >
                  <template v-if="getPlayerPrediction(player, match.id)">
                    <span
                      class="font-mono font-bold px-2 py-1 rounded-md inline-block"
                      :class="isExact(getPlayerPrediction(player, match.id), { homeScore: match.homeScore, awayScore: match.awayScore })
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isWinner(getPlayerPrediction(player, match.id), { homeScore: match.homeScore, awayScore: match.awayScore })
                          ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                          : 'bg-slate-800/50 text-slate-300 border border-slate-700/30'"
                    >
                      {{ getPlayerPrediction(player, match.id).homeScore }}:{{ getPlayerPrediction(player, match.id).awayScore }}
                    </span>
                  </template>
                  <span v-else class="text-slate-700">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="players.length === 0" class="text-center py-8 text-slate-500 text-sm">
          Aún no hay predicciones de otros jugadores.
        </div>
      </div>

      <div v-if="activeTab === 'knockout'" class="space-y-6 mt-6">
        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-dark-border text-slate-500 font-bold uppercase bg-dark-panel/30">
                <th class="py-3 px-3 whitespace-nowrap sticky left-0 bg-dark-panel/30 z-10">Partido</th>
                <th class="py-3 px-3 text-center whitespace-nowrap">Resultado</th>
                <th
                  v-for="player in players"
                  :key="player.userId"
                  class="py-3 px-3 text-center whitespace-nowrap"
                >
                  <div class="flex items-center space-x-1.5 justify-center">
                    <img :src="player.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback'" class="w-5 h-5 rounded-full border border-slate-700/50" />
                    <span class="text-xs" :class="player.userId === authStore.user?.uid ? 'text-gold-400 font-extrabold' : 'text-slate-300'">
                      {{ player.name.split(' ')[0] }}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="match in knockoutMatches"
                :key="match.id"
                class="border-b border-dark-border/40 hover:bg-slate-800/15 transition-colors"
              >
                <td class="py-3 px-3 whitespace-nowrap sticky left-0 bg-dark-card z-10 border-r border-dark-border/20">
                  <span class="font-semibold text-white">{{ match.homeTeam.emoji }} {{ match.homeTeam.name }}</span>
                  <span class="text-slate-600 mx-1">vs</span>
                  <span class="font-semibold text-white">{{ match.awayTeam.emoji }} {{ match.awayTeam.name }}</span>
                </td>
                <td class="py-3 px-3 text-center font-bold font-mono">
                  <span v-if="match.homeScore !== null && match.awayScore !== null" class="text-white bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                    {{ match.homeScore }}:{{ match.awayScore }}
                  </span>
                  <span v-else class="text-slate-600">- : -</span>
                </td>
                <td
                  v-for="player in players"
                  :key="player.userId"
                  class="py-3 px-3 text-center"
                >
                  <template v-if="getPlayerPrediction(player, match.id)">
                    <span
                      class="font-mono font-bold px-2 py-1 rounded-md inline-block"
                      :class="isExact(getPlayerPrediction(player, match.id), { homeScore: match.homeScore, awayScore: match.awayScore })
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isWinner(getPlayerPrediction(player, match.id), { homeScore: match.homeScore, awayScore: match.awayScore })
                          ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                          : 'bg-slate-800/50 text-slate-300 border border-slate-700/30'"
                    >
                      {{ getPlayerPrediction(player, match.id).homeScore }}:{{ getPlayerPrediction(player, match.id).awayScore }}
                    </span>
                  </template>
                  <span v-else class="text-slate-700">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
