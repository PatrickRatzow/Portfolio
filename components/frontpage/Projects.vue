<template>
  <Category title="Select Projects" border-color="border-green-600">
    <p>
      Select public projects of mine. None of my freelance projects are shown
      here due to client discretion. If you want to see more of my projects,
      send me an email
    </p>
    <Projects :shown-amount="3" />
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
})
</script>
