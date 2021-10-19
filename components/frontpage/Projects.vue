<template>
  <Category title="Selected Projects" border-color="border-green-600">
    <p>Some of my personal public projects.</p>
    <p>None of my freelance projects are shown due to customer discretion</p>
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
