import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../firebase'
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  arrayUnion,
  onSnapshot
} from 'firebase/firestore'
import { useAuthStore } from './auth'
import { useMatchesStore } from './matches'

export const useQuinielaStore = defineStore('quiniela', () => {
  const currentQuiniela = ref(null)
  const myQuinielas = ref([])
  const leaderboard = ref([])
  const loading = ref(false)

  const authStore = useAuthStore()
  const matchesStore = useMatchesStore()

  // Generate a random 6-character invitation code
  function generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  // Create a new Quiniela
  async function createQuiniela(name) {
    if (!authStore.user) throw new Error('Debes iniciar sesión')
    
    loading.value = true
    try {
      const code = generateInviteCode()
      const quinielaId = doc(collection(db, 'quinielas')).id
      
      const newQuiniela = {
        id: quinielaId,
        name,
        code,
        ownerId: authStore.user.uid,
        ownerName: authStore.user.displayName || 'Usuario',
        createdAt: new Date().toISOString(),
        members: [authStore.user.uid],
        memberNames: {
          [authStore.user.uid]: {
            name: authStore.user.displayName || 'Usuario',
            photoURL: authStore.user.photoURL || ''
          }
        },
        officialResults: {} // map of matchId -> { homeScore: number, awayScore: number }
      }

      await setDoc(doc(db, 'quinielas', quinielaId), newQuiniela)
      await fetchMyQuinielas()
      return newQuiniela
    } catch (error) {
      console.error('Error al crear quiniela:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Join a Quiniela using invite code
  async function joinQuiniela(code) {
    if (!authStore.user) throw new Error('Debes iniciar sesión')
    
    loading.value = true
    const codeClean = code.trim().toUpperCase()
    try {
      const q = query(collection(db, 'quinielas'), where('code', '==', codeClean))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        throw new Error('Código de invitación no válido')
      }

      const qDoc = querySnapshot.docs[0]
      const quinielaData = qDoc.data()

      if (quinielaData.members.includes(authStore.user.uid)) {
        return quinielaData // Already joined
      }

      const updatedMembers = [...quinielaData.members, authStore.user.uid]
      const updatedMemberNames = {
        ...quinielaData.memberNames,
        [authStore.user.uid]: {
          name: authStore.user.displayName || 'Usuario',
          photoURL: authStore.user.photoURL || ''
        }
      }

      await updateDoc(doc(db, 'quinielas', qDoc.id), {
        members: updatedMembers,
        memberNames: updatedMemberNames
      })

      await fetchMyQuinielas()
      return { id: qDoc.id, ...quinielaData }
    } catch (error) {
      console.error('Error al unirse a quiniela:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Fetch all Quinielas the current user is a member of
  async function fetchMyQuinielas() {
    if (!authStore.user) return
    
    loading.value = true
    try {
      const q = query(collection(db, 'quinielas'), where('members', 'array-contains', authStore.user.uid))
      const querySnapshot = await getDocs(q)
      const list = []
      querySnapshot.forEach((doc) => {
        list.push(doc.data())
      })
      myQuinielas.value = list
    } catch (error) {
      console.error('Error al obtener quinielas:', error)
    } finally {
      loading.value = false
    }
  }

  // Set up real-time listener for current quiniela
  let currentQuinielaListener = null
  function listenToQuiniela(quinielaId) {
    if (currentQuinielaListener) currentQuinielaListener()

    currentQuinielaListener = onSnapshot(doc(db, 'quinielas', quinielaId), (docSnap) => {
      if (docSnap.exists()) {
        currentQuiniela.value = docSnap.data()
        // Merge official results to local matches store
        matchesStore.updateOfficialResults(currentQuiniela.value.officialResults)
        fetchLeaderboard(quinielaId)
      }
    })
  }

  function stopListeningToQuiniela() {
    if (currentQuinielaListener) {
      currentQuinielaListener()
      currentQuinielaListener = null
    }
    currentQuiniela.value = null
    leaderboard.value = []
    matchesStore.resetMatches()
  }

  // Save predictions for the current user in a quiniela
  async function savePredictions(quinielaId, predictionsMap) {
    if (!authStore.user) return
    
    loading.value = true
    try {
      await setDoc(doc(db, `quinielas/${quinielaId}/predictions`, authStore.user.uid), {
        userId: authStore.user.uid,
        userName: authStore.user.displayName || 'Usuario',
        photoURL: authStore.user.photoURL || '',
        predictions: predictionsMap,
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error al guardar predicciones:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Save official results (Admin only)
  async function saveOfficialResults(quinielaId, resultsMap) {
    if (!currentQuiniela.value || currentQuiniela.value.ownerId !== authStore.user?.uid) {
      throw new Error('Solo el administrador puede ingresar resultados reales')
    }

    loading.value = true
    try {
      await updateDoc(doc(db, 'quinielas', quinielaId), {
        officialResults: resultsMap
      })
    } catch (error) {
      console.error('Error al guardar resultados reales:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Fetch individual user predictions
  async function getUserPredictions(quinielaId, userId) {
    try {
      const docSnap = await getDoc(doc(db, `quinielas/${quinielaId}/predictions`, userId))
      return docSnap.exists() ? docSnap.data().predictions : null
    } catch (error) {
      console.error('Error al obtener predicciones del usuario:', error)
      return null
    }
  }

  // Fetch all predictions in a quiniela
  async function getAllPredictions(quinielaId) {
    try {
      const querySnapshot = await getDocs(collection(db, `quinielas/${quinielaId}/predictions`))
      const all = []
      querySnapshot.forEach((doc) => {
        all.push(doc.data())
      })
      return all
    } catch (error) {
      console.error('Error al obtener todas las predicciones:', error)
      return []
    }
  }

  // Calculate scores and create leaderboard
  async function fetchLeaderboard(quinielaId) {
    if (!currentQuiniela.value) return

    try {
      // Get all predictions docs
      const querySnapshot = await getDocs(collection(db, `quinielas/${quinielaId}/predictions`))
      const allPredictions = []
      querySnapshot.forEach((doc) => {
        allPredictions.push(doc.data())
      })

      const official = currentQuiniela.value.officialResults || {}
      const membersMap = currentQuiniela.value.memberNames || {}
      
      const scores = currentQuiniela.value.members.map(memberId => {
        const memberInfo = membersMap[memberId] || { name: 'Participante', photoURL: '' }
        const predDoc = allPredictions.find(p => p.userId === memberId)
        const preds = predDoc ? predDoc.predictions : {}

        let points = 0
        let exactCount = 0
        let winnerCount = 0

        // Calculate points based on predictions
        Object.keys(official).forEach((matchId) => {
          const real = official[matchId]
          const pred = preds[matchId]

          if (real && pred && real.homeScore !== null && real.awayScore !== null && pred.homeScore !== undefined && pred.awayScore !== undefined) {
            const isKnockout = matchId.startsWith('KO')
            const multiplier = isKnockout ? 1.5 : 1.0

            const pHome = parseInt(pred.homeScore)
            const pAway = parseInt(pred.awayScore)
            const rHome = parseInt(real.homeScore)
            const rAway = parseInt(real.awayScore)

            // Exact match
            if (pHome === rHome && pAway === rAway) {
              points += Math.floor(5 * multiplier)
              exactCount++
            } else {
              // Winner/Draw match
              const predDiff = pHome - pAway
              const realDiff = rHome - rAway

              if ((predDiff > 0 && realDiff > 0) || (predDiff < 0 && realDiff < 0) || (predDiff === 0 && realDiff === 0)) {
                points += Math.floor(2 * multiplier)
                winnerCount++
              }
            }
          }
        })

        return {
          userId: memberId,
          name: memberInfo.name,
          photoURL: memberInfo.photoURL,
          points,
          exactCount,
          winnerCount
        }
      })

      // Sort by points desc, then by exactCount desc, then by winnerCount desc
      scores.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.exactCount !== a.exactCount) return b.exactCount - a.exactCount
        return b.winnerCount - a.winnerCount
      })

      leaderboard.value = scores
    } catch (error) {
      console.error('Error al calcular leaderboard:', error)
    }
  }

  return {
    currentQuiniela,
    myQuinielas,
    leaderboard,
    loading,
    createQuiniela,
    joinQuiniela,
    fetchMyQuinielas,
    listenToQuiniela,
    stopListeningToQuiniela,
    savePredictions,
    saveOfficialResults,
    getUserPredictions,
    getAllPredictions,
    fetchLeaderboard
  }
})
