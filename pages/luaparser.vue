<template>
  <div>
    <Category title="Lua Parser" border-color="border-blue-400">
      <textarea id="codemirror" />
      <div class="flex flex-wrap justify-center mt-2">
        <button class="button border-blue-600 hover:bg-blue-600 text-blue-600 hover:text-white mr-2"
          v-on:click="postLuaCode">Submit</button>
      </div>
    </Category>
  </div>
</template>

<script>
  import Category from "~/components/Category.vue"

  export default {
    components: {
      Category
    },
    data() {
      return {
        editor: false
      }
    },
    mounted() {
      if (process.client) {
        document.addEventListener("DOMContentLoaded", () => {
          const textarea = document.getElementById("codemirror")
          const editor = CodeMirror.fromTextArea(textarea, {
            value: "-- Your code",
            mode: "text/x-lua",
            lineNumbers: true,
            theme: "dracula"
          })

          this.$set(this, "editor", editor)
        })
      }
    },
    methods: {
      async postLuaCode() {
        const code = this.editor.getValue()

        const resp = await this.$axios.$post("http://localhost:3201/luaparse", {
          code
        })
        console.log(resp)
      }
    },
    head: {
      script: [
        { src: "https://cdn.jsdelivr.net/npm/codemirror@5.51.0/lib/codemirror.min.js" }
      ],
      link: [
        { rel: "stylesheet", href: "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.51.0/codemirror.min.css" }
      ]
    }
  }
</script>

<style>
  /*

      Name:       dracula
      Author:     Michael Kaminsky (http://github.com/mkaminsky11)

      Original dracula color scheme by Zeno Rocha (https://github.com/zenorocha/dracula-theme)

  */


  .cm-s-dracula.CodeMirror, .cm-s-dracula .CodeMirror-gutters {
    background-color: #282a36 !important;
    color: #f8f8f2 !important;
    border: none;
  }
  .cm-s-dracula .CodeMirror-gutters { color: #282a36; }
  .cm-s-dracula .CodeMirror-cursor { border-left: solid thin #f8f8f0; }
  .cm-s-dracula .CodeMirror-linenumber { color: #6D8A88; }
  .cm-s-dracula .CodeMirror-selected { background: rgba(255, 255, 255, 0.10); }
  .cm-s-dracula .CodeMirror-line::selection, .cm-s-dracula .CodeMirror-line > span::selection, .cm-s-dracula .CodeMirror-line > span > span::selection { background: rgba(255, 255, 255, 0.10); }
  .cm-s-dracula .CodeMirror-line::-moz-selection, .cm-s-dracula .CodeMirror-line > span::-moz-selection, .cm-s-dracula .CodeMirror-line > span > span::-moz-selection { background: rgba(255, 255, 255, 0.10); }
  .cm-s-dracula span.cm-comment { color: #6272a4; }
  .cm-s-dracula span.cm-string, .cm-s-dracula span.cm-string-2 { color: #f1fa8c; }
  .cm-s-dracula span.cm-number { color: #bd93f9; }
  .cm-s-dracula span.cm-variable { color: #50fa7b; }
  .cm-s-dracula span.cm-variable-2 { color: white; }
  .cm-s-dracula span.cm-def { color: #50fa7b; }
  .cm-s-dracula span.cm-operator { color: #ff79c6; }
  .cm-s-dracula span.cm-keyword { color: #ff79c6; }
  .cm-s-dracula span.cm-atom { color: #bd93f9; }
  .cm-s-dracula span.cm-meta { color: #f8f8f2; }
  .cm-s-dracula span.cm-tag { color: #ff79c6; }
  .cm-s-dracula span.cm-attribute { color: #50fa7b; }
  .cm-s-dracula span.cm-qualifier { color: #50fa7b; }
  .cm-s-dracula span.cm-property { color: #66d9ef; }
  .cm-s-dracula span.cm-builtin { color: #50fa7b; }
  .cm-s-dracula span.cm-variable-3, .cm-s-dracula span.cm-type { color: #ffb86c; }

  .cm-s-dracula .CodeMirror-activeline-background { background: rgba(255,255,255,0.1); }
  .cm-s-dracula .CodeMirror-matchingbracket { text-decoration: underline; color: white !important; }
</style>
