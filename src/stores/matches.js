import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { groups as initialGroups, matches as initialMatches } from '../data/worldcup2026'

export const useMatchesStore = defineStore('matches', () => {
  const groups = ref(initialGroups)
  const matches = ref(initialMatches)

  // Returns all matches for a specific phase
  const getMatchesByPhase = (phase) => {
    return matches.value.filter(m => m.phase === phase)
  }

  // Returns matches for a specific group
  const getMatchesByGroup = (groupKey) => {
    return matches.value.filter(m => m.group === groupKey)
  }

  // Merge official results into the local matches reference
  function updateOfficialResults(resultsMap) {
    if (!resultsMap) return
    
    matches.value = matches.value.map(match => {
      if (resultsMap[match.id]) {
        const result = resultsMap[match.id]
        return {
          ...match,
          homeScore: result.homeScore,
          awayScore: result.awayScore,
          status: result.status || 'finished'
        }
      }
      return match
    })
  }

  // Reset matches to initial state
  function resetMatches() {
    matches.value = JSON.parse(JSON.stringify(initialMatches))
  }

  return {
    groups,
    matches,
    getMatchesByPhase,
    getMatchesByGroup,
    updateOfficialResults,
    resetMatches
  }
})
