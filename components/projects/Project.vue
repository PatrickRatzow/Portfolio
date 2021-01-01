<template>
  <div class="cursor-pointer project-background relative top-0 rounded my-4">
    <div class="flex flex-wrap" v-bind:class="{ 'flex-row-reverse': id % 2 == 0 }" @click="openURL(project.url)">
      <span class="sm:w-4/6 w-full">
        <img class="rounded w-full h-full" :src="project.img" :alt="project.alt"/>
      </span>
      <div class="p-4 w-full sm:w-2/6">
        <h3 class="text-gray-200">{{ project.name }}</h3>
        <p class="text-gray-500 text-xs" v-html="project.desc"></p>
        <p class="text-gray-400 text-xs mb-2">
          <br/>
          Experienced by {{ formatNumber(project.users) }}+ people
        </p>
        <span class="inline-block p-2 pt-1 pb-1 rounded text-white text-xs mr-1" v-bind:class="getTag(tag).styling" v-for="tag in project.tags">
          {{ getTag(tag).name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
  const tags = {
    lua: { name: "Lua", styling: "bg-blue-700" },
    mysql: { name: "MySQL", styling: "bg-purple-700" },
    web: { name: "Web", styling: "bg-teal-700" },
    python: { name: "Python", styling: "bg-indigo-700" }
  }

  export default {
    methods: {
      getTag: tag => tags[tag],
      formatNumber: number => Number(number).toLocaleString(),
      openURL: url => {
        const win = window.open(url, '_blank')
        win.focus()
      }
    },
    props: {
      id: Number,
      project: Object
    }
  }
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
