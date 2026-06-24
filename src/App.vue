<script setup>
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Navigation Bar -->
    <Navbar />

    <!-- Main Content Container with transition -->
    <main class="flex-grow container mx-auto px-4 py-8 max-w-7xl">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </transition>

      </router-view>
    </main>

    <!-- Footer -->
    <footer class="py-6 border-t border-dark-border bg-dark-panel/40 backdrop-blur-md text-center text-sm text-slate-500">
      <div class="container mx-auto px-4">
        <p>© 2026 Quiniela Mundialista. Construido con 💚 para amigos futboleros.</p>
        <p class="text-xs mt-1 text-slate-600">FIFA World Cup 2026 es una marca registrada de la FIFA. Este sitio no es oficial.</p>
      </div>
    </footer>
  </div>
</template>

<style>
/* Reset and global utility classes if any */
</style>
