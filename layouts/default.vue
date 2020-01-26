<template>
  <div class="portfolio-container p-4 background w-screen min-h-screen">
    <Navbar />
    <nuxt />
    <Footer />
  </div>
</template>

<script>
  import Navbar from '~/components/Navbar.vue'
  import Footer from '~/components/Footer.vue'

  export default {
    components: {
      Navbar,
      Footer
    }
  }
</script>

<style>
  html {
    font-family: 'Montserrat Regular', sans-serif;
    font-size: 16px;
    word-spacing: 1px;
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    box-sizing: border-box;
    background: linear-gradient(
      90deg,
      rgb(24, 24, 24),
      rgb(36, 36, 36)
    );

    -ms-overflow-style: none;
  }

  ::-webkit-scrollbar {
    display: none;
  }

  *,
  *:before,
  *:after {
    box-sizing: border-box;
    margin: 0;
  }

 .portfolio-container {
    max-width: 720px;
    @apply block justify-center items-center text-center mx-auto pb-4;
  }
  
  .fadeIn {
    animation: fadeIn 0.5s ease-in;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
