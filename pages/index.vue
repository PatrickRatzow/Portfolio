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

	export default {
		components: {
			Intro,
			About,
			Projects,
			Contact
		},
		head() {
			return {
				title: "sleeppyy"
			}
		}
	}
</script>