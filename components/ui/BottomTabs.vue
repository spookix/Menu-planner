<template>
    <v-bottom-navigation app height="80" bg-color="surface" grow class="custom-bottom-nav">
      <v-btn 
        to="/planner" 
        :active="route.path.startsWith('/planner')"
        class="nav-button"
        variant="text"
      >
        <v-icon size="24" class="mb-1">mdi-calendar</v-icon>
        <span class="nav-label">Menu</span>
      </v-btn>
      <v-btn 
        to="/recipes" 
        :active="route.path.startsWith('/recipes')"
        class="nav-button"
        variant="text"
      >
        <v-icon size="24" class="mb-1">mdi-book</v-icon>
        <span class="nav-label">Recettes</span>
      </v-btn>
      <v-btn 
        to="/grocery" 
        :active="route.path.startsWith('/grocery')"
        class="nav-button"
        variant="text"
      >
        <v-icon size="24" class="mb-1">mdi-cart</v-icon>
        <span class="nav-label">Courses</span>
      </v-btn>
      <v-btn 
        to="/history" 
        :active="route.path.startsWith('/history')"
        class="nav-button"
        variant="text"
      >
        <v-icon size="24" class="mb-1">mdi-clock</v-icon>
        <span class="nav-label">Historique</span>
      </v-btn>
    </v-bottom-navigation>
  </template>
  
  <script setup lang="ts">
  import { useRoute } from 'vue-router'
  const route = useRoute()
  </script>
  
  <style scoped>
  .custom-bottom-nav {
    border-top: 1px solid #e9ecef;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  }

  .nav-button {
    flex-direction: column;
    height: 100%;
    min-width: 80px;
    transition: all 0.3s ease;
    color: #6c757d;
  }

  .nav-button:hover {
    background-color: rgba(0, 123, 255, 0.1);
    color: #007bff;
  }

  .nav-button.v-btn--active {
    color: #007bff;
    background-color: rgba(0, 123, 255, 0.1);
  }

  .nav-button.v-btn--active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 3px;
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    border-radius: 0 0 2px 2px;
  }

  .nav-label {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: none;
    letter-spacing: 0.3px;
  }

  .v-bottom-navigation .v-btn {
    flex-direction: column;
  }
  </style>
  