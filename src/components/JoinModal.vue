<script setup>
import { ref } from 'vue'
import { useQuinielaStore } from '../stores/quiniela'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'joined'])

const quinielaStore = useQuinielaStore()
const code = ref('')
const error = ref('')
const loading = ref(false)

async function handleJoin() {
  if (!code.value.trim()) {
    error.value = 'Por favor ingresa un código'
    return
  }

  error.value = ''
  loading.value = true

  try {
    const quiniela = await quinielaStore.joinQuiniela(code.value)
    code.value = ''
    emit('joined', quiniela)
    emit('close')
  } catch (err) {
    error.value = err.message || 'Ocurrió un error al unirse'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div 
    v-if="show" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-deep/80 backdrop-blur-md"
    @click.self="emit('close')"
  >
    <!-- Modal Box -->
    <div class="glass-card bg-dark-card border border-slate-700/60 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative animate-pulse-subtle">
      <!-- Close Button -->
      <button 
        @click="emit('close')" 
        class="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Content -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-2xl mb-4">
          🔑
        </div>
        <h2 class="text-xl font-bold text-white mb-2">Unirse a una Quiniela</h2>
        <p class="text-sm text-slate-400">
          Pídele el código de invitación de 6 dígitos a tu amigo para ingresar a su quiniela privada.
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleJoin" class="space-y-4">
        <div>
          <label for="code" class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Código de Invitación
          </label>
          <input 
            type="text" 
            id="code"
            v-model="code"
            placeholder="E.g. A1B2C3"
            maxlength="6"
            class="w-full text-center text-xl font-mono font-bold tracking-widest px-4 py-3 bg-dark-deep border border-slate-700/80 focus:border-gold-400 focus:outline-none rounded-xl text-white uppercase"
            required
            :disabled="loading"
          />
        </div>

        <!-- Error Message -->
        <p v-if="error" class="text-xs font-semibold text-rose-400 text-center bg-rose-950/20 border border-rose-900/30 py-2 rounded-lg">
          ⚠️ {{ error }}
        </p>

        <!-- Actions -->
        <div class="flex items-center space-x-3 pt-2">
          <button 
            type="button" 
            @click="emit('close')"
            class="flex-1 px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all"
            :disabled="loading"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            class="flex-1 px-4 py-3 text-sm font-semibold text-dark-deep bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 rounded-xl shadow-lg hover:shadow-gold-500/10 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
            :disabled="loading"
          >
            <span v-if="loading" class="animate-spin h-4 w-4 border-2 border-dark-deep border-t-transparent rounded-full"></span>
            <span>{{ loading ? 'Ingresando...' : 'Unirse' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
