<script setup>
import { computed } from 'vue'

const props = defineProps({
  groupKey: {
    type: String,
    required: true
  },
  group: {
    type: Object,
    required: true
  },
  matches: {
    type: Array,
    required: true
  }
})

const tableData = computed(() => {
  // Initialize stats for each team in the group
  const data = props.group.teams.map(team => ({
    ...team,
    pj: 0,
    pg: 0,
    pe: 0,
    pp: 0,
    gf: 0,
    gc: 0,
    diff: 0,
    pts: 0
  }))

  // Accumulate stats from matches
  props.matches.forEach(m => {
    // Both scores must be valid numbers (strings or numbers)
    const homeS = m.homeScore
    const awayS = m.awayScore

    if (
      homeS !== null && 
      awayS !== null && 
      homeS !== undefined && 
      awayS !== undefined && 
      homeS !== '' && 
      awayS !== ''
    ) {
      const homeVal = parseInt(homeS)
      const awayVal = parseInt(awayS)
      
      const homeTeamObj = data.find(t => t.id === m.homeTeam.id)
      const awayTeamObj = data.find(t => t.id === m.awayTeam.id)

      if (homeTeamObj && awayTeamObj) {
        homeTeamObj.pj++
        awayTeamObj.pj++
        homeTeamObj.gf += homeVal
        homeTeamObj.gc += awayVal
        awayTeamObj.gf += awayVal
        awayTeamObj.gc += homeVal

        if (homeVal > awayVal) {
          homeTeamObj.pg++
          homeTeamObj.pts += 3
          awayTeamObj.pp++
        } else if (homeVal < awayVal) {
          awayTeamObj.pg++
          awayTeamObj.pts += 3
          homeTeamObj.pp++
        } else {
          homeTeamObj.pe++
          homeTeamObj.pts += 1
          awayTeamObj.pe++
          awayTeamObj.pts += 1
        }
      }
    }
  })

  // Calculate goal difference and sort
  return data.map(team => {
    team.diff = team.gf - team.gc
    return team
  }).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    if (b.diff !== a.diff) return b.diff - a.diff
    return b.gf - a.gf
  })
})
</script>

<template>
  <div class="glass-card bg-dark-card border border-dark-border/80 rounded-2xl overflow-hidden shadow-lg">
    <!-- Header -->
    <div class="bg-dark-panel/40 px-4 py-3 border-b border-dark-border flex justify-between items-center">
      <h3 class="font-bold text-sm text-gradient-gold uppercase tracking-wider">
        Tabla {{ group.name }}
      </h3>
      <span class="text-[10px] text-slate-500 font-medium">Clasifican los 2 mejores</span>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto custom-scrollbar">
      <table class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="border-b border-dark-border text-slate-500 font-bold uppercase bg-dark-panel/10">
            <th class="py-2.5 px-4">Pos</th>
            <th class="py-2.5 px-2">Equipo</th>
            <th class="py-2.5 px-2 text-center">PJ</th>
            <th class="py-2.5 px-2 text-center hidden sm:table-cell">G</th>
            <th class="py-2.5 px-2 text-center hidden sm:table-cell">E</th>
            <th class="py-2.5 px-2 text-center hidden sm:table-cell">P</th>
            <th class="py-2.5 px-2 text-center">GF:GC</th>
            <th class="py-2.5 px-2 text-center">DG</th>
            <th class="py-2.5 px-4 text-center text-gold-400 font-extrabold">Pts</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(team, index) in tableData" 
            :key="team.id"
            class="border-b border-dark-border/40 hover:bg-slate-800/25 transition-colors"
            :class="index < 2 ? 'bg-emerald-950/5' : ''"
          >
            <!-- Position -->
            <td class="py-3 px-4 font-bold">
              <span 
                class="inline-flex justify-center items-center w-5 h-5 rounded-md text-[10px] font-bold"
                :class="index < 2 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'"
              >
                {{ index + 1 }}
              </span>
            </td>

            <!-- Team name + Flag -->
            <td class="py-3 px-2 font-semibold text-white whitespace-nowrap">
              <span class="text-base mr-2">{{ team.emoji }}</span>
              <span>{{ team.name }}</span>
            </td>

            <!-- Stats -->
            <td class="py-3 px-2 text-center text-slate-300 font-medium">{{ team.pj }}</td>
            <td class="py-3 px-2 text-center text-slate-400 hidden sm:table-cell">{{ team.pg }}</td>
            <td class="py-3 px-2 text-center text-slate-400 hidden sm:table-cell">{{ team.pe }}</td>
            <td class="py-3 px-2 text-center text-slate-400 hidden sm:table-cell">{{ team.pp }}</td>
            <td class="py-3 px-2 text-center text-slate-400 font-mono">{{ team.gf }}:{{ team.gc }}</td>
            <td 
              class="py-3 px-2 text-center font-bold font-mono"
              :class="team.diff > 0 ? 'text-emerald-400' : team.diff < 0 ? 'text-rose-400' : 'text-slate-400'"
            >
              {{ team.diff > 0 ? '+' : '' }}{{ team.diff }}
            </td>
            <td class="py-3 px-4 text-center text-sm font-extrabold text-gradient-gold">{{ team.pts }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
