<template>
  <Category title="Selected Projects" border-color="border-green-600">
    <p>A large majority of my public projects with a front-end worth showing off is in Lua. Therefore all the selected projects are Lua projects.</p>
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
