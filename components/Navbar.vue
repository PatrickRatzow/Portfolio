<template>
  <nav class="fadeIn mx-auto pb-12">
      <nuxt-link :to="link.url" class="nav-link" v-for="link in links">{{ link.name }}</nuxt-link>
      <a class="nav-link-gitlab" target="_blank" href="https://gitlab.com/sleeppyy/">GitLab</a>
  </nav>
</template>

<style>
  .nav-link {
    @apply lowercase text-gray-600 text-base mx-2 transition-all
  }
  .nav-link:hover {
    @apply text-white
  }
  .nav-link-active {
    @apply text-white
  }

  .nav-link-gitlab {
    margin-left: 0px !important;
    color: #E24329;
    @apply transition-all lowercase;
  }
  .nav-link-gitlab:hover {
    @apply text-orange-400;
  }
</style>

<script>
  const links = [
    { name: "home", url: "/" },
    { name: "skills", url: "/skills" },
    { name: "projects", url: "/projects" }
  ]

  export default {
    data() {
      return {
        links
      }
    }
  }
</script>
