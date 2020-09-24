<template>
  <div>
    <Project
      v-for="(project, i) in processedProjects"
      v-bind:project="project"
      v-bind:key="i"
      v-bind:id="i"
    />
  </div>
</template>

<script>
  import Project from "~/components/projects/Project.vue"

  const projects = [
    { 
      name: "DarkRP F4 menu", 
      desc: "A polished & stylised F4 Menu for the DarkRP gamemode in Garry's Mod",
      img: "/f4menu.png",
      alt: "F4 Menu GmodStore script banner",
      url: "https://www.gmodstore.com/market/view/xenin-f4-the-darkrp-f4-menu",
      users: 125000,
      tags: [ "lua", "web", "mysql" ]
    },
    { 
      name: "Inventory System", 
      desc: "A highly modular inventory system for Garry's Mod",
      img: "/inventory.png",
      alt: "Inventory System GmodStore script banner",
      url: "https://www.gmodstore.com/market/view/xenin-inventory",
      users: 50000,
      tags: [ "lua", "mysql" ]
    },
    {     
      name: "Battle Pass", 
      desc: "A Battle Pass in Garry's Mod.<br/>Similar to Battle Passes from games like Fortnite",
      img: "/bp.png",
      alt: "Battle Pass GmodStore script banner",
      url: "https://www.gmodstore.com/market/view/6747",
      users: 25000,
      tags: [ "lua", "mysql" ]
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
      users: 23000,
      tags: [ "lua", "mysql" ]
    }
  ]

  export default {
    components: {
      Project
    },
    props: {
      shownAmount: String
    },
    computed: {
      processedProjects() {
        if (this.shownAmount) {
          return projects.slice(0, this.shownAmount)
        }

        return projects
      }
    },
    data() {
      return {
        projects
      }
    }
  }
</script>