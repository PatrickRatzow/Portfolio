interface Project {
  name: string
  desc: string
  img: string
  alt: string
  url: string
  users?: number
  disabled?: boolean
  priority?: boolean
  tags: string[]
}

interface Tag {
  name: string
  styling: string
}

interface Tags {
  [key: string]: Tag
}

interface Skill {
  name: string
  icon: string
  styling?: string
}

interface Link {
  name: string
  url: string
}
