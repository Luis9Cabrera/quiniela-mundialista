<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuinielaStore } from '../stores/quiniela'

const quinielaStore = useQuinielaStore()
const router = useRouter()

const name = ref('')
const error = ref('')
const loading = ref(false)

async function handleCreate() {
  if (!name.value.trim()) {
    error.value = 'Por favor ingresa un nombre para la quiniela'
    return
  }

  error.value = ''
  loading.value = true

  try {
    const quiniela = await quinielaStore.createQuiniela(name.value)
    // Redirect to detail page
    router.push({ name: 'quiniela-detail', params: { id: quiniela.id } })
  } catch (err) {
    error.value = err.message || 'Error al crear la quiniela'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto py-12 px-4">
    <!-- Back Button -->
    <router-link 
      :to="{ name: 'dashboard' }" 
      class="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors"
    >
      <span>← Volver al Panel</span>
    </router-link>

    <!-- Card Container -->
    <div class="glass-card bg-dark-card border border-dark-border/80 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-2xl mb-4">
          ✨
        </div>
        <h2 class="text-xl md:text-2xl font-black text-white">Crear Nueva Quiniela</h2>
        <p class="text-xs text-slate-400 mt-1">
          Define el nombre de tu grupo. Los participantes se unirán con un código que generaremos automáticamente.
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleCreate" class="space-y-4">
        <div>
          <label for="name" class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Nombre de la Quiniela
          </label>
          <input 
            type="text" 
            id="name"
            v-model="name"
            placeholder="E.g. Amigos de la Oficina ⚽"
            class="w-full px-4 py-3 bg-dark-deep border border-slate-700/80 focus:border-gold-400 focus:outline-none rounded-xl text-white text-sm"
            required
            maxlength="30"
            :disabled="loading"
          />
        </div>

        <!-- Error Message -->
        <p v-if="error" class="text-xs font-semibold text-rose-400 text-center bg-rose-950/20 border border-rose-900/30 py-2 rounded-lg">
          ⚠️ {{ error }}
        </p>

        <!-- Submit Button -->
        <button 
          type="submit"
          class="w-full py-3.5 text-sm font-semibold text-dark-deep bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 rounded-xl shadow-lg hover:shadow-gold-500/15 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          :disabled="loading"
        >
          <span v-if="loading" class="animate-spin h-4 w-4 border-2 border-dark-deep border-t-transparent rounded-full"></span>
          <span>{{ loading ? 'Creando...' : 'Crear Grupo y Código' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
