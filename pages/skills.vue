<template>
  <Category title="My Skills" border-color="border-purple-600">
    <p>Skills I'm proficient or very proficient with.</p>

    <div
      class="
        grid grid-cols-1
        sm:grid-cols-2
        md:grid-cols-3
        gap-4
        auto-rows-fr
        mt-2
      "
    >
      <div
        v-for="skill in skills"
        :key="skill.name"
        class="skill w-full background"
      >
        <div
          class="
            text-center
            skill-box
            pb-2
            rounded
            relative
            hover:shadow-lg
            transition-all
            top-0
          "
        >
          <div v-if="isImage(skill.icon)" class="pt-4 pb-2">
            <nuxt-img
              class="mx-auto"
              :src="skill.icon"
              width="42"
              height="48"
              format="webp"
              loading="lazy"
            />
          </div>
          <i
            v-else
            :class="[skill.icon, skill.styling]"
            class="fas fa-3x block pt-4 pb-1"
          />

          <p class="text-gray-300">{{ skill.name }}</p>
        </div>
      </div>
    </div>
  </Category>
</template>

<script lang="ts">
import Vue from "vue"
import Category from "~/components/Category.vue"

export default Vue.extend({
  components: {
    Category
  },
  data() {
    return {
      skills: [
        { name: "C#", icon: "/skills/cs.png" },
        { name: "TypeScript", icon: "/skills/ts.png" },
        { name: "Lua", icon: "/skills/lua.svg" },
        { name: "SQL", icon: "fa-database", styling: "text-purple-700" },
        { name: "Vue.js", icon: "/skills/vue.png" },
        { name: "Git", icon: "/skills/git.png" },
        { name: "Docker", icon: "/skills/docker.png" },
        { name: "HTML", icon: "/skills/html.png" },
        { name: "CSS", icon: "/skills/css.png" }
      ] as Skill[]
    }
  },
  head() {
    return {
      title: "Skills",
      meta: [
        { charset: "utf-8" },
        {
          hid: "og:description",
          name: "og:description",
          content: "A few of my skills"
        }
      ]
    }
  },
  methods: {
    isImage: (img: string) =>
      img.includes(".png") || img.includes(".jpg") || img.includes(".svg")
  }
})
</script>

<style>
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
