<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuinielaStore } from '../stores/quiniela'
import { useMatchesStore } from '../stores/matches'
import { useAuthStore } from '../stores/auth'
import MatchCard from '../components/MatchCard.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const quinielaStore = useQuinielaStore()
const matchesStore = useMatchesStore()

const activeTab = ref('groups')
const activeGroup = ref('A')
const localResults = ref({})
const saveSuccess = ref(false)
const saveError = ref('')
const saving = ref(false)

onMounted(() => {
  if (route.params.id) {
    quinielaStore.listenToQuiniela(route.params.id)
  }
})

// Sync official results when loaded
const hasSyncResults = computed(() => {
  return quinielaStore.currentQuiniela?.officialResults
})

// Initialize localResults once we get database snapshot
computed(() => {
  if (hasSyncResults.value) {
    const saved = quinielaStore.currentQuiniela.officialResults || {}
    Object.keys(saved).forEach(matchId => {
      localResults.value[matchId] = {
        homeScore: saved[matchId].homeScore ?? '',
        awayScore: saved[matchId].awayScore ?? ''
      }
    })
  }
  return null
})

onUnmounted(() => {
  quinielaStore.stopListeningToQuiniela()
})

const isOwner = computed(() => {
  return quinielaStore.currentQuiniela?.ownerId === authStore.user?.uid
})

const currentGroupMatches = computed(() => {
  return matchesStore.getMatchesByGroup(activeGroup.value)
})

const knockoutMatches = computed(() => {
  return matchesStore.matches.filter(m => m.phase !== 'groups')
})

async function handleSaveResults() {
  if (!isOwner.value) {
    saveError.value = 'No estás autorizado para modificar resultados'
    return
  }

  saving.value = true
  saveSuccess.value = false
  saveError.value = ''

  try {
    const cleaned = {}
    Object.keys(localResults.value).forEach(matchId => {
      const res = localResults.value[matchId]
      if (res.homeScore !== '' && res.awayScore !== '') {
        cleaned[matchId] = {
          homeScore: parseInt(res.homeScore),
          awayScore: parseInt(res.awayScore),
          status: 'finished'
        }
      }
    })

    await quinielaStore.saveOfficialResults(route.params.id, cleaned)
    saveSuccess.value = true
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  } catch (err) {
    saveError.value = err.message || 'Error al guardar los resultados oficiales'
  } finally {
    saving.value = false
  }
}

function updateLocalResult(matchId, side, val) {
  if (!localResults.value[matchId]) {
    localResults.value[matchId] = { homeScore: '', awayScore: '' }
  }
  localResults.value[matchId][side] = val
}

// Watcher-like initialization helper to set local results if they change in db
function syncLocalResults(matchId) {
  const dbResult = quinielaStore.currentQuiniela?.officialResults?.[matchId]
  if (dbResult && !localResults.value[matchId]) {
    localResults.value[matchId] = {
      homeScore: dbResult.homeScore ?? '',
      awayScore: dbResult.awayScore ?? ''
    }
  }
  return localResults.value[matchId] || { homeScore: '', awayScore: '' }
}
</script>

<template>
  <div class="space-y-8 py-4">
    <!-- Navigation Back -->
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

    <!-- Security Check -->
    <div v-if="quinielaStore.currentQuiniela && !isOwner" class="p-8 text-center glass-card bg-rose-950/10 border border-rose-900/40 rounded-3xl space-y-4">
      <p class="text-sm font-semibold text-rose-400">⚠️ No tienes permisos de administrador para este grupo.</p>
      <router-link 
        :to="{ name: 'quiniela-detail', params: { id: route.params.id } }" 
        class="inline-block px-4 py-2 text-xs font-bold text-white bg-slate-800 rounded-lg"
      >
        Regresar
      </router-link>
    </div>

    <!-- Admin Panel -->
    <div v-else-if="quinielaStore.currentQuiniela" class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-white">Panel de Administración</h2>
          <p class="text-xs text-slate-400 mt-1">Carga los resultados reales de los partidos para actualizar las posiciones de todos.</p>
        </div>

        <button 
          @click="handleSaveResults"
          class="w-full md:w-auto px-6 py-3 text-sm font-bold text-dark-deep bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 rounded-xl shadow-lg hover:shadow-gold-500/10 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          :disabled="saving"
        >
          <span v-if="saving" class="animate-spin h-4 w-4 border-2 border-dark-deep border-t-transparent rounded-full"></span>
          <span>{{ saving ? 'Guardando...' : 'Guardar Resultados Oficiales 💾' }}</span>
        </button>
      </div>

      <!-- Messages -->
      <div v-if="saveSuccess" class="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-center font-semibold text-xs transition-all">
        ✅ ¡Resultados oficiales guardados! Las puntuaciones de los miembros se calcularán al instante.
      </div>
      <div v-if="saveError" class="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-400 text-center font-semibold text-xs transition-all">
        ⚠️ Error: {{ saveError }}
      </div>

      <!-- Navigation tabs -->
      <div class="flex border-b border-dark-border/60">
        <button 
          @click="activeTab = 'groups'"
          class="px-6 py-3 text-sm font-bold tracking-wide transition-all border-b-2"
          :class="activeTab === 'groups' 
            ? 'border-gold-400 text-gold-400' 
            : 'border-transparent text-slate-400 hover:text-white'"
        >
          Fase de Grupos
        </button>
        <button 
          @click="activeTab = 'knockout'"
          class="px-6 py-3 text-sm font-bold tracking-wide transition-all border-b-2"
          :class="activeTab === 'knockout' 
            ? 'border-gold-400 text-gold-400' 
            : 'border-transparent text-slate-400 hover:text-white'"
        >
          Fase de Eliminatoria
        </button>
      </div>

      <!-- Groups selection slider -->
      <div v-if="activeTab === 'groups'" class="space-y-6">
        <div class="flex items-center space-x-2 overflow-x-auto custom-scrollbar pb-2">
          <button 
            v-for="letter in Object.keys(matchesStore.groups)"
            :key="letter"
            @click="activeGroup = letter"
            class="w-10 h-10 flex-shrink-0 text-xs font-bold rounded-lg border transition-all"
            :class="activeGroup === letter 
              ? 'bg-gold-500/10 border-gold-500/40 text-gold-400 font-extrabold' 
              : 'bg-dark-panel border-dark-border text-slate-400 hover:text-white'"
          >
            {{ letter }}
          </button>
        </div>

        <!-- Matches layout list -->
        <div class="max-w-2xl mx-auto space-y-4">
          <h3 class="font-extrabold text-white text-sm uppercase tracking-wider mb-2">
            Ingresar marcadores reales - Grupo {{ activeGroup }}
          </h3>

          <MatchCard 
            v-for="match in currentGroupMatches" 
            :key="match.id"
            :match="match"
            :isPredicting="true"
            :modelValue="syncLocalResults(match.id)"
            @update:modelValue="(val) => {
              updateLocalResult(match.id, 'homeScore', val.homeScore);
              updateLocalResult(match.id, 'awayScore', val.awayScore);
            }"
          />
        </div>
      </div>

      <!-- Knockouts select -->
      <div v-if="activeTab === 'knockout'" class="space-y-6">
        <div class="max-w-2xl mx-auto space-y-4">
          <h3 class="font-extrabold text-white text-sm uppercase tracking-wider mb-2">
            Ingresar marcadores reales - Eliminatorias
          </h3>

          <MatchCard 
            v-for="match in knockoutMatches" 
            :key="match.id"
            :match="match"
            :isPredicting="true"
            :modelValue="syncLocalResults(match.id)"
            @update:modelValue="(val) => {
              updateLocalResult(match.id, 'homeScore', val.homeScore);
              updateLocalResult(match.id, 'awayScore', val.awayScore);
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
