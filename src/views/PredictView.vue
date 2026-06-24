<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuinielaStore } from '../stores/quiniela'
import { useMatchesStore } from '../stores/matches'
import { useAuthStore } from '../stores/auth'
import MatchCard from '../components/MatchCard.vue'
import GroupTable from '../components/GroupTable.vue'

const route = useRoute()
const authStore = useAuthStore()
const quinielaStore = useQuinielaStore()
const matchesStore = useMatchesStore()

const activeTab = ref('groups') // 'groups' or 'knockout'
const activeGroup = ref('A') // Group A - L
const localPredictions = ref({})
const saveSuccess = ref(false)
const saveError = ref('')
const saving = ref(false)

// Fetch user data and listen to quiniela changes
onMounted(async () => {
  if (route.params.id) {
    quinielaStore.listenToQuiniela(route.params.id)
    
    // Fetch user's existing predictions
    const saved = await quinielaStore.getUserPredictions(route.params.id, authStore.user.uid)
    if (saved) {
      localPredictions.value = JSON.parse(JSON.stringify(saved))
    }
    
    // Initialize empty predictions for all matches
    matchesStore.matches.forEach(m => {
      if (!localPredictions.value[m.id]) {
        localPredictions.value[m.id] = { homeScore: '', awayScore: '' }
      }
    })
  }
})

onUnmounted(() => {
  quinielaStore.stopListeningToQuiniela()
})

const currentGroupData = computed(() => {
  return matchesStore.groups[activeGroup.value] || { name: '', teams: [] }
})

// Filter matches by current group, and map homeScore/awayScore to local predictions for real-time calculations
const currentGroupMatches = computed(() => {
  const matches = matchesStore.getMatchesByGroup(activeGroup.value)
  return matches.map(m => {
    const pred = localPredictions.value[m.id] || { homeScore: '', awayScore: '' }
    return {
      ...m,
      homeScore: pred.homeScore,
      awayScore: pred.awayScore
    }
  })
})

// Official results for GroupTable
const officialGroupMatches = computed(() => {
  return matchesStore.getMatchesByGroup(activeGroup.value).map(m => ({
    ...m,
    homeScore: m.homeScore,
    awayScore: m.awayScore
  }))
})

const knockoutMatches = computed(() => {
  // Returns all matches in elimination phases, mapping user prediction scores
  const allKo = matchesStore.matches.filter(m => m.phase !== 'groups')
  return allKo.map(m => {
    const pred = localPredictions.value[m.id] || { homeScore: '', awayScore: '' }
    return {
      ...m,
      homeScore: pred.homeScore,
      awayScore: pred.awayScore
    }
  })
})

// Check if there are unsaved changes
async function handleSave() {
  saving.value = true
  saveSuccess.value = false
  saveError.value = ''

  try {
    // Basic sanitization
    const cleaned = {}
    Object.keys(localPredictions.value).forEach(matchId => {
      const pred = localPredictions.value[matchId]
      if (pred.homeScore !== '' && pred.awayScore !== '') {
        cleaned[matchId] = {
          homeScore: parseInt(pred.homeScore),
          awayScore: parseInt(pred.awayScore)
        }
      }
    })

    await quinielaStore.savePredictions(route.params.id, cleaned)
    saveSuccess.value = true
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  } catch (err) {
    saveError.value = err.message || 'Error al guardar las predicciones'
  } finally {
    saving.value = false
  }
}

// Returns the reactive prediction object for a match
function getPrediction(matchId) {
  return localPredictions.value[matchId] || { homeScore: '', awayScore: '' }
}
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

    <!-- Main Title -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-black text-white">Ingresar Predicciones</h2>
        <p class="text-xs text-slate-400 mt-1">Completa tus marcadores para los partidos del torneo.</p>
      </div>

      <!-- Action Button -->
      <button 
        @click="handleSave"
        class="w-full md:w-auto px-6 py-3 text-sm font-bold text-dark-deep bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 rounded-xl shadow-lg hover:shadow-gold-500/10 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
        :disabled="saving"
      >
        <span v-if="saving" class="animate-spin h-4 w-4 border-2 border-dark-deep border-t-transparent rounded-full"></span>
        <span>{{ saving ? 'Guardando...' : 'Guardar Predicciones 💾' }}</span>
      </button>
    </div>

    <!-- Success / Error notification -->
    <div v-if="saveSuccess" class="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-center font-semibold text-xs transition-all">
      ✅ ¡Predicciones guardadas exitosamente!
    </div>
    <div v-if="saveError" class="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-400 text-center font-semibold text-xs transition-all">
      ⚠️ Error: {{ saveError }}
    </div>

    <!-- Tabs: Groups vs Knockouts -->
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

    <!-- Bottom save button -->
    <div class="flex justify-center pt-4 pb-8">
      <button 
        @click="handleSave"
        class="w-full max-w-md px-6 py-3 text-sm font-bold text-dark-deep bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 rounded-xl shadow-lg hover:shadow-gold-500/10 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
        :disabled="saving"
      >
        <span v-if="saving" class="animate-spin h-4 w-4 border-2 border-dark-deep border-t-transparent rounded-full"></span>
        <span>{{ saving ? 'Guardando...' : 'Guardar Predicciones 💾' }}</span>
      </button>
    </div>

    <!-- Content: Groups Tab -->
    <div v-if="activeTab === 'groups'" class="space-y-6">
      <!-- Group letters select slider (A - L) -->
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

      <!-- Main groups playground -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Match list (7 columns) -->
        <div class="lg:col-span-7 space-y-4">
          <h3 class="font-extrabold text-white text-sm uppercase tracking-wider mb-2">
            Partidos - Grupo {{ activeGroup }}
          </h3>
          
          <MatchCard 
            v-for="match in currentGroupMatches" 
            :key="match.id"
            :match="match"
            :isPredicting="true"
            :modelValue="getPrediction(match.id)"
          />
        </div>

        <!-- Real-time group standing projection (5 columns) -->
        <div class="lg:col-span-5 space-y-4">
          <h3 class="font-extrabold text-white text-sm uppercase tracking-wider mb-2">
            Proyección del Grupo
          </h3>
          
          <GroupTable 
            :groupKey="activeGroup"
            :group="currentGroupData"
            :matches="officialGroupMatches"
          />
        </div>
      </div>
    </div>

    <!-- Content: Knockouts Tab -->
    <div v-if="activeTab === 'knockout'" class="space-y-6">
      <div class="max-w-2xl mx-auto space-y-4">
        <h3 class="font-extrabold text-white text-sm uppercase tracking-wider mb-2">
          Pronósticos de Eliminatorias (x1.5 Multiplicador)
        </h3>
        
        <MatchCard 
          v-for="match in knockoutMatches" 
          :key="match.id"
          :match="match"
          :isPredicting="true"
          :modelValue="getPrediction(match.id)"
        />
      </div>
    </div>
  </div>
</template>
