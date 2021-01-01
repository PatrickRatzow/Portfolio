<template>
  <Category title="About Me" border-color="border-red-600">
    <p>
      I'm a 20 year old software developer, always interested in learning new things. 
      I love the gratification of creating things that solves people's problems, while creating a product that's simple but nicely designed.
    </p>
    <br/>
    <p>
      Currently studying Computer Science at 
      <a class="text-blue-400 hover:text-blue-600 transition-all" href="https://www.ucn.dk/english/home">University College of Northern Denmark</a>
      while working on the side developing high quality commerical Garry's Mod products. 
    </p>
  </Category>
</template>

<script>
  import Category from "~/components/Category.vue"

  export default {
    components: {
      Category
    }
  }
</script>