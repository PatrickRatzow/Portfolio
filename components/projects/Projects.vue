<template>
	<div>
		<Project
			v-for="(project, i) in processedProjects"
			v-bind:project="project"
			v-bind:id="i"
		/>
	</div>
</template>

<script>
	import Project from "~/components/projects/Project.vue"

  const projects = [
		{ 
      name: "Inventory System", 
      desc: "A highly modular inventory system for Garry's Mod",
      img: "/inventory.jpg",
      url: "https://www.gmodstore.com/market/view/xenin-inventory",
			users: 20000,
			tags: [ "lua", "mysql" ]
    },
    { 
      name: "DarkRP F4 menu", 
      desc: "A polished & stylised F4 Menu for the DarkRP gamemode in Garry's Mod",
      img: "/f4menu.png",
      url: "https://www.gmodstore.com/market/view/xenin-f4-the-darkrp-f4-menu",
			users: 10000,
			tags: [ "lua", "web", "mysql" ]
    },
		{     
			name: "Battle Pass", 
      desc: "A Battle Pass in Garry's Mod.<br/>Similar to Battle Passes from games like Fortnite",
      img: "/bp.png",
      url: "https://www.gmodstore.com/market/view/6747",
			users: 8000,
			tags: [ "lua", "mysql" ]
		},
		{ 
      name: "Care Packages", 
      desc: `A Care Package addon for Garry's Mod.
			<br />
      Heavily inspired by Player Unknown's Battlegrounds
      `,
      img: "/care_packages.jpg",
      url: "https://www.gmodstore.com/market/view/xenin-care-package-the-superior-airdrop-system",
			users: 3000,
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