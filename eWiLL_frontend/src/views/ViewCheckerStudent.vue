<template>
  <div>
    <h1>Abgabe 1</h1>
    <span> {{ meineErsteVariable }}</span>
  </div>
</template>

<script lang="ts" setup>
import Diagram from '../model/diagram/Diagram';

let meineErsteVariable: Diagram = {} as Diagram;
meineErsteVariable.id = 1;	
meineErsteVariable.name = "Test";

</script>

<style lang="scss" scoped></style>
