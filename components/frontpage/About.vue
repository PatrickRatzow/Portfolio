<template>
	<Category title="About Me" border-color="border-red-600">
		<p>I'm a 20 year old aspiring to become a professional Software Developer.</p>
		<p>Some people might also know me as sleeppyy.</p>
		<p class="mt-4">
			Currently studying Applied Computer Science, while working part time as a Software Developer at 
			<a class="text-blue-400 hover:text-blue-600 transition-all" href="https://tigermedia.dk/">Tiger Media A/S</a> 
			in Aalborg, Denmark.
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