<template>
  <nav class="fadeIn mx-auto pb-12">
    <nuxt-link
      v-for="link in links"
      :key="link.url"
      :to="link.url"
      class="nav-link"
    >
      {{ link.name }}
    </nuxt-link>
    <a
      class="nav-link-source"
      rel="noopener"
      target="_blank"
      href="https://github.com/patrickratzow/portfolio"
    >
      source code
    </a>
  </nav>
</template>

<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  data() {
    return {
      links: [
        { name: "home", url: "/" },
        { name: "skills", url: "/skills" },
        { name: "projects", url: "/projects" }
      ] as Link[]
    }
  }
})
</script>

<style>
.nav-link {
  @apply lowercase text-gray-500 text-base mx-2 transition-all;
}
.nav-link:hover {
  @apply text-white;
}
.nav-link-active {
  @apply text-white;
}

.nav-link-source {
  margin-left: 0px !important;
  color: #e24329;
  @apply ml-0 transition-all lowercase whitespace-nowrap;
}
.nav-link-source:hover {
  color: #f6ad55;
}
</style>
