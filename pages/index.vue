<template>
  <div class="fadeIn m-auto max-width">
    <Intro />
    <About />
    <Projects />
    <Contact />
  </div>
</template>

<script>
  import Intro from '~/components/frontpage/Intro.vue'
  import About from '~/components/frontpage/About.vue'
  import Projects from '~/components/frontpage/Projects.vue'
  import Contact from '~/components/frontpage/Contact.vue'
  import ogImage from '~/static/me.png';

  export default {
    components: {
      Intro,
      About,
      Projects,
      Contact
    },
    head() {
      return {
        title: "sleeppyy",
        meta: [
          { charset: "utf-8" },
          { hid: "og:description", name: "og:description", content: "Patrick Ratzow's portfolio" },
          { hid: "og:image", name: "og:image", content: "https://sleeppyy.com" + ogImage }
        ]
      }
    }
  }
</script>