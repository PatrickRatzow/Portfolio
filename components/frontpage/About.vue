<template>
  <Category title="About Me" border-color="border-red-600">
    <p>
      I'm a 21 years old software developer, always interested in learning new
      things. I love the creative process of solving complex problems, and
      seeing the results of all the work.
      <br />
      Especially proficient at understanding customers businesses, and
      optimising their specific workflows.
    </p>
    <br />
    <p>
      Currently studying Computer Science at
      <a
        class="text-blue-400 hover:text-blue-500 transition-all"
        href="https://www.ucn.dk/english/home"
        >UCN</a
      >
      while working on the side freelancing & developing hobby projects
    </p>
  </Category>
</template>

<script lang="ts">
import Vue from "vue"
import Category from "~/components/Category.vue"

export default Vue.extend({
  components: {
    Category,
  },
})
</script>
