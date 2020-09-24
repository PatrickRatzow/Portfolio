<template>
  <Category title="Selected Projects" border-color="border-green-600">
    <p>Most of my easy to showcase public projects are in Lua, because that's simply the most fun for me.</p>
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
