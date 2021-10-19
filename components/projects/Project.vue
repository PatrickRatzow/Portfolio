<template>
  <div class="project-background relative top-0 rounded my-4">
    <a
      :href="project.url"
      target="_blank"
      class="flex flex-wrap"
      :class="{ 'flex-row-reverse': id % 2 == 0 }"
    >
      <span class="sm:w-4/6 w-full">
        <img
          class="rounded w-full h-full"
          :src="project.img"
          :alt="project.alt"
        />
      </span>
      <div class="p-4 w-full sm:w-2/6">
        <h3 class="text-gray-200">{{ project.name }}</h3>
        <p class="text-gray-400 text-xs" v-html="project.desc"></p>
        <p class="text-gray-300 text-xs mb-2">
          <br />
          <template v-if="project.users">
            Experienced by {{ formatNumber(project.users) }}+ people in-game
          </template>
          <template v-else>Beta testing begins Spring 2022</template>
        </p>
        <span
          v-for="tag in projectTags(project)"
          :key="tag.name"
          class="inline-block p-2 pt-1 pb-1 rounded text-white text-xs mr-1"
          :class="tag.styling"
        >
          {{ tag.name }}
        </span>
      </div>
    </a>
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue"

export default Vue.extend({
  props: {
    id: { type: Number, required: true } as PropOptions<number>,
    project: { type: Object, required: true } as PropOptions<Project>,
  },
  data() {
    return {
      tags: {
        lua: { name: "Lua", styling: "bg-blue-700" },
        mysql: { name: "MySQL", styling: "bg-pink-700" },
        web: { name: "Web", styling: "bg-teal-700" },
        python: { name: "Python", styling: "bg-indigo-700" },
        cs: { name: "C#", styling: "bg-purple-700" },
        vue: { name: "Vue", styling: "bg-green-500" },
      } as Tags,
    }
  },
  methods: {
    formatNumber: (number: number) => Number(number).toLocaleString(),
    projectTags(project: Project): Tag[] {
      return project.tags.map((tag) => this.tags[tag])
    },
  },
})
</script>

<style>
.project-background {
  background: rgb(44, 44, 44);
  @apply transition-all;
}

.project-background:hover {
  top: -4px;
  @apply shadow-lg;
}
</style>
