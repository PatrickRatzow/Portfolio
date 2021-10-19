<template>
  <Category title="Projects" border-color="border-green-600">
    <p>A more extensive list of projects I've done</p>
    <Projects />
  </Category>
</template>

<script lang="ts">
import Vue from "vue"
import Category from "~/components/Category.vue"
import Projects from "~/components/projects/Projects.vue"

export default Vue.extend({
  components: {
    Category,
    Projects,
  },
  head() {
    return {
      title: "Projects",
      meta: [
        { charset: "utf-8" },
        {
          hid: "og:description",
          name: "og:description",
          content: "Some of the projects I've made",
        },
      ],
    }
  },
})
</script>
