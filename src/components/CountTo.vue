<template>
  <countTo :startVal="startVal" :endVal="target" :duration="duration"></countTo>
</template>

<script>
  import countTo from 'vue-count-to'
  export default {
    components: { countTo },
    props: {
      target: {
        type: Number,
        default: 2000
      },
      duration: {
        type: Number,
        default: 1000
      }
    },
    data() {
      return {
        startVal: 0
        // endVal: 2020
      }
    }
  }
</script>
