<script setup>
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  leaderboard: {
    type: Array,
    required: true
  }
})

const authStore = useAuthStore()

// Returns medal emoji for top 3
function getMedal(index) {
  if (index === 0) return '🥇'
  if (index === 1) return '🥈'
  if (index === 2) return '🥉'
  return ''
}
</script>

<template>
  <div class="glass-card bg-dark-card border border-dark-border/80 rounded-2xl overflow-hidden shadow-xl">
    <div class="overflow-x-auto custom-scrollbar">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-dark-border text-xs text-slate-500 font-bold uppercase bg-dark-panel/30">
            <th class="py-4 px-6 text-center w-16">Pos</th>
            <th class="py-4 px-4">Participante</th>
            <th class="py-4 px-4 text-center hidden md:table-cell">Aciertos Exactos (5pts)</th>
            <th class="py-4 px-4 text-center hidden md:table-cell">Aciertos Ganador (2pts)</th>
            <th class="py-4 px-6 text-center text-gold-400 font-extrabold text-sm w-28">Puntos</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-dark-border/30">
          <tr 
            v-for="(member, index) in leaderboard" 
            :key="member.userId"
            class="hover:bg-slate-800/20 transition-all duration-200"
            :class="member.userId === authStore.user?.uid ? 'bg-gold-500/5 border-y border-gold-500/20' : ''"
          >
            <!-- Position / Medals -->
            <td class="py-4 px-6 text-center font-bold text-slate-300">
              <span v-if="index < 3" class="text-xl" :title="`Puesto ${index + 1}`">
                {{ getMedal(index) }}
              </span>
              <span v-else class="text-xs bg-slate-900 border border-slate-800 text-slate-400 w-6 h-6 inline-flex items-center justify-center rounded-full font-mono">
                {{ index + 1 }}
              </span>
            </td>

            <!-- User avatar + Name -->
            <td class="py-4 px-4 whitespace-nowrap">
              <div class="flex items-center space-x-3">
                <img 
                  :src="member.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback'" 
                  alt="Avatar" 
                  class="w-10 h-10 rounded-full border border-slate-700/60"
                  :class="member.userId === authStore.user?.uid ? 'border-gold-400/80 shadow-md shadow-gold-500/10' : ''"
                />
                <div class="flex flex-col">
                  <span 
                    class="text-sm font-semibold"
                    :class="member.userId === authStore.user?.uid ? 'text-gold-400 font-extrabold' : 'text-white'"
                  >
                    {{ member.name }}
                  </span>
                  <span v-if="member.userId === authStore.user?.uid" class="text-[10px] text-gold-400/80 font-medium">Tú</span>
                </div>
              </div>
            </td>

            <!-- Exact count stats -->
            <td class="py-4 px-4 text-center hidden md:table-cell text-emerald-400 font-bold font-mono">
              ⚽ {{ member.exactCount }}
            </td>

            <!-- Winner/Draw count stats -->
            <td class="py-4 px-4 text-center hidden md:table-cell text-slate-300 font-medium font-mono">
              🎯 {{ member.winnerCount }}
            </td>

            <!-- Total Points -->
            <td class="py-4 px-6 text-center">
              <span 
                class="text-base font-black px-3.5 py-1.5 rounded-xl block font-mono"
                :class="member.userId === authStore.user?.uid 
                  ? 'bg-gradient-to-r from-gold-500/20 to-gold-400/10 text-gold-400 border border-gold-400/30 shadow-lg shadow-gold-500/5' 
                  : 'text-white bg-slate-900 border border-slate-800'"
              >
                {{ member.points }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-if="leaderboard.length === 0" class="py-12 text-center text-slate-500 text-sm">
      Aún no hay participantes en esta quiniela.
    </div>
  </div>
</template>
