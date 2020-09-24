<template>
  <Category title="My Skills" border-color="border-teal-600">
    <p>Skills I have used at a professional level, ordered by proficiency</p>

    <div class="flex flex-wrap justify-center mt-2">
      <div v-bind:key="skill.name" v-for="(skill) in skills" class="skill w-3/6 sm:w-2/6 py-2 background">
        <div class="text-center skill-box pb-2 rounded relative hover:shadow-lg transition-all top-0">
          <div v-if="isImage(skill.icon)" class="pt-4 pb-2">
            <img :src="skill.icon" class="mx-auto">
          </div>
          <i v-else :class="[skill.icon, skill.styling]" class="fas fa-3x block pt-4 pb-2"/>

          <p class="text-gray-300">{{ skill.name }}</p>
        </div>
      </div>
    </div>
  </Category>
</template>

<script>
  import Category from "~/components/Category.vue"

  const skills = [
    { name: "Lua", icon: "/skills/lua.svg" },
    { name: "MySQL", icon: "fa-database", styling: "text-purple-700" },
    { name: "JavaScript", icon: "/skills/javascript.png" },
    { name: "HTML", icon: "/skills/html.png" },
    { name: "CSS", icon: "/skills/css.png" },
    { name: "Vue.js", icon: "/skills/vue.png" },
    { name: "PHP", icon: "/skills/php.png" },
    { name: "XSLT", icon: "fa-code", styling: "text-green-700" }
  ]

  export default {
    methods: {
      isImage: img => img.includes(".png") || img.includes(".jpg") || img.includes(".svg"),
      getSkill: skill => skills[skill]
    },
    components: {
      Category
    },
    data() {
      return {
        skills
      }
    },
    head() {
      return {
        title: "Skills"
      }
    }
  }
</script>

<style>
  .skill {
    @apply rounded pr-4;
  }
  .skill:nth-of-type(3n) {
    @apply pr-0;
  }
  /* TODO Improve this */
  @media(max-width: 639px) {
    .skill:nth-of-type(2n) {
      @apply pr-0;
    }
    .skill:nth-of-type(3n) {
      @apply pr-0;
    }
    .skill:nth-of-type(3) {
      @apply pr-4;
    }
  }

  .skill-box {
    background: rgb(44, 44, 44);
  }
  .skill-box:hover {
    top: -4px;
  }
  .skill img {
    width: 42px;
    height: 48px;
  }
</style>
