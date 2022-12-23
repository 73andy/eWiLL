<template>
  <div>Überprüfung</div>
  <ModelingTool :mode="Mode.VIEW"></ModelingTool>
</template>

<script setup lang="ts">
import ModelingTool from '../components/ModelingTool.vue';
import Mode from '../enums/Mode';
</script>
