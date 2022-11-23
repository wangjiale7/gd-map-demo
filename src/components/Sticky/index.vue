<template>
  <div :style="{ height: height + 'px', zIndex: zIndex }">
    <div
      :class="className"
      :style="{
        top: isSticky ? stickyTop + 'px' : '',
        zIndex: zIndex,
        position: position,
        width: width,
        height: height + 'px',
        transform: `translateX(${left}px)`
      }"
    >
      <slot>
        <div>sticky</div>
      </slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Sticky',
    props: {
      stickyTop: {
        type: Number,
        default: 0
      },
      zIndex: {
        type: Number,
        default: 1
      },
      className: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        active: false,
        position: '',
        width: undefined,
        height: undefined,
        isSticky: false,
        scrollDom: null,
        left: 0
      }
    },
    mounted() {
      this.scrollDom = document.querySelector('#drawer-wrap .el-drawer__body')

      this.height = this.$el.getBoundingClientRect().height
      this.scrollDom.addEventListener('scroll', this.handleScroll)
      this.scrollDom.addEventListener('resize', this.handleResize)
    },
    activated() {
      this.handleScroll()
    },
    destroyed() {
      console.log('destroyed')
      this.scrollDom.removeEventListener('scroll', this.handleScroll)
      this.scrollDom.removeEventListener('resize', this.handleResize)
    },
    methods: {
      sticky() {
        if (this.active) {
          return
        }
        this.position = 'fixed'
        this.active = true
        this.width = this.width + 'px'
        this.isSticky = true
        this.left = -document.documentElement.scrollLeft
      },
      handleReset() {
        if (!this.active) {
          return
        }
        this.reset()
      },
      reset() {
        this.position = ''
        this.width = 'auto'
        this.active = false
        this.isSticky = false
      },
      handleScroll() {
        const width = this.$el.getBoundingClientRect().width
        this.width = width || 'auto'
        const offsetTop = this.$el.getBoundingClientRect().top
        console.log(offsetTop)

        if (offsetTop < this.stickyTop) {
          this.sticky()
          if (offsetTop === 0) {
            this.handleReset()
          }
          return
        }
        this.handleReset()
      },
      handleResize() {
        if (this.isSticky) {
          this.width = this.$el.getBoundingClientRect().width + 'px'
        }
      }
    }
  }
</script>
