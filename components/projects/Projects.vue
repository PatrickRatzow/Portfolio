<template>
  <div>
    <Project
      v-for="(project, i) in processedProjects"
      :id="i"
      :key="i"
      :project="project"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue"
import Project from "~/components/projects/Project.vue"

export default Vue.extend({
  components: {
    Project,
  },
  props: {
    shownAmount: { type: Number, required: true } as PropOptions<number>,
  },
  data() {
    return {
      projects: [
        {
          name: "DarkRP F4 menu",
          desc: "A polished & stylised F4 Menu for the DarkRP gamemode in Garry's Mod",
          img: "/f4menu.png",
          alt: "F4 Menu GmodStore script banner",
          url: "https://www.gmodstore.com/market/view/xenin-f4-the-darkrp-f4-menu",
          users: 247600,
          tags: ["lua", "web", "mysql"],
        },
        {
          name: "Inventory System",
          desc: "A highly modular inventory system for Garry's Mod",
          img: "/inventory.png",
          alt: "Inventory System GmodStore script banner",
          url: "https://www.gmodstore.com/market/view/xenin-inventory",
          users: 109000,
          tags: ["lua", "mysql"],
        },
        {
          name: "Deathscreen",
          desc: "A modern take on a deathscreen for Garry's Mod, with the ability for users to express themselves",
          img: "/deathscreen.png",
          alt: "Deathscreen GmodStore script banner",
          url: "https://www.gmodstore.com/market/view/xenin-deathscreen-the-premier-deathscreen",
          users: 57000,
          tags: ["lua", "mysql", "python"],
        },
        {
          name: "Battle Pass",
          desc: "A Battle Pass in Garry's Mod.<br/>Similar to Battle Passes from games like Fortnite",
          img: "/bp.png",
          alt: "Battle Pass GmodStore script banner",
          url: "https://www.gmodstore.com/market/view/6747",
          users: 69000,
          tags: ["lua", "mysql"],
        },
        {
          name: "Care Packages",
          desc: `A Care Package addon for Garry's Mod.
      <br />
      Heavily inspired by Player Unknown's Battlegrounds
      `,
          img: "/care_packages.png",
          alt: "Care Packages GmodStore script banner",
          url: "https://www.gmodstore.com/market/view/xenin-care-package-the-superior-airdrop-system",
          users: 37000,
          tags: ["lua", "mysql"],
        },
        {
          name: "despawn.gg",
          desc: `An in-development full-scale TTT platform coming soon for <a class="text-blue-400 hover:text-blue-500 transition-all" href="https://sbox.facepunch.com">s&box</a>`,
          img: "/despawn.png",
          alt: "Banner for despawn.gg",
          url: "https://despawn.gg",
          priority: true,
          tags: ["cs", "vue", "mysql"],
        },
      ] as Project[],
    }
  },
  computed: {
    processedProjects(): Project[] {
      let activeProjects = this.projects
        .filter((project) => project.disabled !== true)
        .sort((a, b) => (a.priority ? -1 : (b.users ?? 0) - (a.users ?? 0)))

      if (this.shownAmount) {
        activeProjects = activeProjects.slice(0, this.shownAmount)
      }

      return activeProjects
    },
  },
})
</script>

<style>
.bg-teal-700 {
  background-color: #2c7a7b;
}
</style>
