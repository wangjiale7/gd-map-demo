<template>
  <div id="app">
    <header class="flex-rb-cc">
      <div>网格化智能营销平台</div>
      <div class="header-r">
        <img src="./assets/img/男头像.png" alt="" />
        <span class="name">王武</span>
        <i class="el-icon-switch-button"></i>
        <span>退出</span>
      </div>
    </header>
    <div class="content">
      <gd-map></gd-map>
      <right-pane></right-pane>
    </div>
  </div>
</template>

<script>
  import GdMap from '@/components/GDMap/index.vue'
  import RightPane from '@/components/RightPane.vue'

  export default {
    name: 'App',
    components: {
      GdMap,
      RightPane
    }
  }
</script>

<style lang="less">
  @import url('./assets/css/index.less');

  #app {
    height: 100%;
    min-width: 1200px;
  }
  header {
    padding: 0 12px;
    background: rgb(40, 41, 78);
    height: 60px;
    color: #fff;
    .name {
      position: relative;
      font-size: 14px;
      padding-right: 22px;
      &::after {
        content: '';
        position: absolute;
        right: 10px;
        width: 1px;
        height: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: #fff;
      }
    }
    .header-r {
      display: flex;
      align-items: center;
      font-size: 14px;
      i {
        padding-right: 3px;
      }
      img {
        margin-right: 10px;
        width: 22px;
        height: 22px;
        background: transparent;
      }
    }
  }
  .content {
    position: relative;
    height: calc(100% - 60px);
  }
</style>
