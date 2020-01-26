<template>
  <Category title="Projects" border-color="border-green-600">
    <p>A more extensive list of projects I've done</p>
    <Projects />
  </Category>
</template>

<script>
  import Category from "~/components/Category.vue"
  import Projects from "~/components/projects/Projects.vue"

  export default {
    components: {
      Category,
      Projects
    },
    head() {
      return {
        title: "Projects"
      }
    }
  }
</script>
