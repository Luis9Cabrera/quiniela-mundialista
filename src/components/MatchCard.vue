<script setup>
import { computed } from 'vue'

const props = defineProps({
  match: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Object,
    default: () => ({ homeScore: '', awayScore: '' })
  },
  isPredicting: {
    type: Boolean,
    default: false
  },
  pointsEarned: {
    type: Number,
    default: null
  },
  savedPrediction: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const prediction = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Check if a match is knockout
const isKnockout = computed(() => props.match.id.startsWith('KO'))

// Lock predictions if the match has already started (is in the past) or if official results are loaded
const isLocked = computed(() => {
  if (props.match.status && props.match.status !== 'pending') return true
  
  if (props.match.date) {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayStr = `${year}-${month}-${day}`
    
    // Lock if the match day is in the past
    if (props.match.date < todayStr) {
      return true
    }
  }
  return false
})

// Format Date to legible format
const formattedDate = computed(() => {
  if (!props.match.date) return ''
  const parts = props.match.date.split('-')
  if (parts.length !== 3) return props.match.date
  
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const month = months[parseInt(parts[1]) - 1]
  return `${parts[2]} ${month}, 2026`
})
</script>

<template>
  <div class="glass-card bg-dark-card border border-dark-border/80 rounded-2xl p-4 md:p-5 flex flex-col justify-between hover:border-gold-500/20 transition-all duration-300 shadow-lg">
    <!-- Header: Date, Stadium, Phase -->
    <div class="flex justify-between items-center text-xs text-slate-400 mb-3 border-b border-dark-border/40 pb-2">
      <div class="flex items-center space-x-1.5">
        <span>📅 {{ formattedDate }}</span>
        <span v-if="match.time" class="text-slate-500 text-[10px]">🕐 {{ match.time }}</span>
        <span v-if="isLocked" class="text-rose-400 font-semibold flex items-center space-x-0.5" title="Predicciones bloqueadas">
          <span>🔒</span>
          <span class="text-[9px] uppercase tracking-wider">Bloqueado</span>
        </span>
      </div>
      <div class="flex items-center space-x-2">
        <span v-if="isKnockout" class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
          Eliminatoria
        </span>
        <span v-else class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
          Grupo {{ match.group }}
        </span>
      </div>
    </div>

    <!-- Match Columns: Teams & Scores -->
    <div class="grid grid-cols-12 items-center gap-3 py-2">
      <!-- Home Team -->
      <div class="col-span-5 flex items-center justify-end space-x-3 text-right">
        <span class="text-sm font-semibold text-white truncate max-w-[120px] md:max-w-none order-1 md:order-1">{{ match.homeTeam.name }}</span>
        <span class="text-2xl order-2 md:order-2">{{ match.homeTeam.emoji }}</span>
      </div>

      <!-- Center: Scores/Inputs -->
      <div class="col-span-2 flex justify-center items-center">
        <!-- Interactive Prediction Inputs -->
        <div v-if="isPredicting && !isLocked" class="flex items-center space-x-1.5">
          <input 
            type="number" 
            min="0"
            v-model="prediction.homeScore" 
            placeholder="-"
            class="w-10 h-10 text-center text-lg font-bold bg-dark-deep border border-slate-700 focus:border-gold-400 focus:outline-none rounded-lg text-white appearance-none"
          />
          <span class="text-slate-500 font-bold text-sm">:</span>
          <input 
            type="number" 
            min="0"
            v-model="prediction.awayScore" 
            placeholder="-"
            class="w-10 h-10 text-center text-lg font-bold bg-dark-deep border border-slate-700 focus:border-gold-400 focus:outline-none rounded-lg text-white appearance-none"
          />
        </div>

        <!-- Finished / Locked display -->
        <div v-else class="flex flex-col items-center">
          <!-- Real Score -->
          <div class="flex items-center space-x-2 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-lg">
            <span class="text-lg font-black text-white">
              {{ match.homeScore !== null ? match.homeScore : '-' }}
            </span>
            <span class="text-slate-600 font-bold text-xs">VS</span>
            <span class="text-lg font-black text-white">
              {{ match.awayScore !== null ? match.awayScore : '-' }}
            </span>
          </div>
        </div>
      </div>


      <!-- Away Team -->
      <div class="col-span-5 flex items-center justify-start space-x-3 text-left">
        <span class="text-2xl">{{ match.awayTeam.emoji }}</span>
        <span class="text-sm font-semibold text-white truncate max-w-[120px] md:max-w-none">{{ match.awayTeam.name }}</span>
      </div>
    </div>

    <!-- Prediction comparison and Points earned display (visible when not actively predicting) -->
    <div 
      v-if="!isPredicting && (savedPrediction || pointsEarned !== null)"
      class="mt-3 pt-3 border-t border-dark-border/40 flex flex-wrap items-center justify-between gap-2"
    >
      <!-- User Prediction badge -->
      <div v-if="savedPrediction" class="flex items-center space-x-1.5 text-xs text-slate-400">
        <span>Tu pronóstico:</span>
        <span class="font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/50">
          {{ savedPrediction.homeScore }} - {{ savedPrediction.awayScore }}
        </span>
      </div>

      <!-- Points earned badge -->
      <div v-if="pointsEarned !== null" class="ml-auto">
        <span 
          v-if="pointsEarned === 5 || pointsEarned === 7" 
          class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-950/20"
        >
          ⚽ +{{ pointsEarned }} pts (Exacto)
        </span>
        <span 
          v-else-if="pointsEarned === 2 || pointsEarned === 3" 
          class="px-2.5 py-1 rounded-full text-xs font-bold bg-gold-500/20 text-gold-400 border border-gold-500/30"
        >
          🎯 +{{ pointsEarned }} pts (Ganador)
        </span>
        <span 
          v-else 
          class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"
        >
          ❌ +0 pts
        </span>
      </div>
    </div>

    <!-- Footer: Stadium -->
    <div class="mt-2 text-[10px] text-slate-500 text-center uppercase tracking-wider">
      🏟️ {{ match.stadium }}
    </div>
  </div>
</template>

<style scoped>
/* Disable input spinners */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>
