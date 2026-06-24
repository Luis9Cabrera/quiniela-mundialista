<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const isMenuOpen = ref(false)

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'home' })
  isMenuOpen.value = false
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <nav class="sticky top-0 z-50 glass-card bg-dark-panel/85 border-b border-dark-border px-6 py-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <!-- Logo -->
      <router-link :to="{ name: 'home' }" class="flex items-center space-x-3 group">
        <span class="text-2xl font-bold tracking-tight text-gradient-gold font-display transition-all duration-300 group-hover:scale-105">
          🏆 Quiniela 2026
        </span>
      </router-link>

      <!-- Desktop Navigation Links -->
      <div class="hidden md:flex items-center space-x-6">
        <router-link :to="{ name: 'home' }" class="text-sm font-medium text-slate-300 hover:text-gold-400 transition-colors">
          Inicio
        </router-link>
        <template v-if="authStore.isAuthenticated">
          <router-link :to="{ name: 'dashboard' }" class="text-sm font-medium text-slate-300 hover:text-gold-400 transition-colors">
            Mi Panel
          </router-link>
          <div class="flex items-center space-x-4 border-l border-dark-border pl-6">
            <div class="flex items-center space-x-2">
              <img 
                :src="authStore.user?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback'" 
                alt="User Avatar" 
                class="w-8 h-8 rounded-full border border-gold-400/50"
              />
              <span class="text-sm font-medium text-slate-200 truncate max-w-[120px]">
                {{ authStore.user?.displayName }}
              </span>
            </div>
            <button 
              @click="handleLogout" 
              class="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 hover:border-rose-900/50 rounded-lg transition-all"
            >
              Salir
            </button>
          </div>
        </template>
        <template v-else>
          <router-link 
            :to="{ name: 'login' }" 
            class="px-4 py-2 text-sm font-semibold text-dark-deep bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 rounded-lg shadow-lg hover:shadow-gold-500/20 transition-all duration-300"
          >
            Iniciar Sesión
          </router-link>
        </template>
      </div>

      <!-- Mobile Menu Button -->
      <button @click="toggleMenu" class="md:hidden p-2 text-slate-300 hover:text-white focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path v-if="isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- Mobile Dropdown Menu -->
    <div 
      v-if="isMenuOpen" 
      class="md:hidden mt-4 pt-4 border-t border-dark-border flex flex-col space-y-3 bg-dark-panel/95 rounded-lg p-4 glass-card"
    >
      <router-link 
        :to="{ name: 'home' }" 
        @click="isMenuOpen = false" 
        class="text-sm font-medium text-slate-300 hover:text-gold-400 p-2 hover:bg-slate-800/40 rounded-md transition-colors"
      >
        Inicio
      </router-link>
      <template v-if="authStore.isAuthenticated">
        <router-link 
          :to="{ name: 'dashboard' }" 
          @click="isMenuOpen = false" 
          class="text-sm font-medium text-slate-300 hover:text-gold-400 p-2 hover:bg-slate-800/40 rounded-md transition-colors"
        >
          Mi Panel
        </router-link>
        <div class="flex items-center space-x-3 p-2 bg-slate-900/30 rounded-md border border-dark-border">
          <img 
            :src="authStore.user?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback'" 
            alt="User Avatar" 
            class="w-8 h-8 rounded-full border border-gold-400/50"
          />
          <span class="text-sm font-medium text-slate-200">
            {{ authStore.user?.displayName }}
          </span>
        </div>
        <button 
          @click="handleLogout" 
          class="w-full text-center py-2 text-sm font-semibold text-rose-400 bg-rose-950/20 border border-rose-900/30 hover:bg-rose-950/40 rounded-md transition-all"
        >
          Cerrar Sesión
        </button>
      </template>
      <template v-else>
        <router-link 
          :to="{ name: 'login' }" 
          @click="isMenuOpen = false" 
          class="w-full text-center py-2.5 text-sm font-semibold text-dark-deep bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 rounded-md transition-all duration-300"
        >
          Iniciar Sesión
        </router-link>
      </template>
    </div>
  </nav>
</template>
