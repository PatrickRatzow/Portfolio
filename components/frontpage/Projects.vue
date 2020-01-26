<template>
  <Category title="Selected Projects" border-color="border-green-600">
    <p>Lua is by far my best language with over 7 years of experience.</p>
    <p>It's what I find the most fun, and most of my projects are Lua.</p>
    <Projects shown-amount="2" />
  </Category>
</template>

<script>
  import Category from "~/components/Category.vue"
  import Projects from "~/components/projects/Projects.vue"

  export default {
    components: {
      Category,
      Projects
    }
  }
</script>
