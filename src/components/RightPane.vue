<template>
  <div class="right-pane">
    <el-tooltip class="item" effect="dark" content="展开" placement="bottom">
      <div v-show="!drawer" class="toggle middle-right" @click="drawer = true">
        <i class="el-icon-d-arrow-left"></i>
      </div>
    </el-tooltip>

    <el-drawer
      style="position: absolute"
      :modal="false"
      id="drawer-wrap"
      title="我是标题"
      :visible.sync="drawer"
      :with-header="false"
      size="50%"
    >
      <el-backtop target=".el-drawer__body"></el-backtop>
      <el-tabs @tab-click="handleClick">
        <el-tab-pane label="群体画像" lazy>
          <section>
            <div class="flex-rb-cc">
              <h3>区域流量变化</h3>
              <el-radio-group v-model="flowType" :size="buttonSize">
                <el-radio-button v-for="(item, idx) in flows" :key="idx" :label="item"></el-radio-button>
              </el-radio-group>
            </div>
            <p style="padding: 12px 0; color: #999">
              客流指数：
              <count-to :target="flowTypeFilter.index"></count-to>
            </p>
            <bar-chart :chartData="flowTypeFilter.list"></bar-chart>
          </section>
          <sticky :z-index="10" :stickyTop="40 + 60">
            <el-radio-group v-model="portraitSwitch" :size="buttonSize">
              <el-radio-button v-for="(item, idx) in populations" :key="idx" :label="item"></el-radio-button>
            </el-radio-group>
          </sticky>

          <div class="flex-rc-cc column hot-bg">
            <div>
              <count-to :target="groupPortraitFilter.index"></count-to>
            </div>
            <div>人群指数</div>
          </div>

          <div class="box">
            <div class="chart-box">
              <pie-chart :chartData="groupPortraitFilter[age]" :title="age"></pie-chart>
            </div>
            <div class="chart-box">
              <pie-chart :chartData="groupPortraitFilter[sex]" :title="sex"></pie-chart>
            </div>
            <div class="chart-box">
              <pie-chart :chartData="groupPortraitFilter[education]" :title="education"></pie-chart>
            </div>
            <div class="chart-box">
              <pie-chart :chartData="groupPortraitFilter[marriage]" :title="marriage"></pie-chart>
            </div>
            <div class="chart-box">
              <pie-chart :chartData="groupPortraitFilter[car]" :title="car"></pie-chart>
            </div>
            <div class="chart-box">
              <pie-chart :chartData="groupPortraitFilter[birth]" :title="birth"></pie-chart>
            </div>
          </div>
          <div>
            <bar-chart style="margin: 16px 0" :chartData="groupPortraitFilter[asset]" :title="asset"></bar-chart>
            <bar-chart :chartData="groupPortraitFilter[industry]" :title="industry" :xRotate="true"></bar-chart>
          </div>
        </el-tab-pane>
        <el-tab-pane label="热点区域" lazy>
          <el-radio-group v-model="populationType" :size="buttonSize">
            <el-radio-button v-for="(item, idx) in populations.slice(0, 3)" :key="idx" :label="item"></el-radio-button>
          </el-radio-group>
          <div class="flex-re" style="padding: 0 0 12px 0">
            <el-select v-model="hotTopType" placeholder="请选择">
              <el-option v-for="(val, key, idx) in topType" :key="idx" :label="val" :value="val"> </el-option>
            </el-select>
          </div>
          <el-table v-bind="tableCssAttr" :data="hotRegionFilter" style="width: 100%">
            <el-table-column type="index" width="120" align="center">
              <template slot="header"> 序号 </template>
            </el-table-column>
            <el-table-column prop="region" label="名称" align="center">
              <template slot-scope="scope">
                <el-link @click="setSearch(scope.row.region)" type="primary">{{ scope.row.region }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="value" label="流量指数" align="center"> </el-table-column>
            <!-- <el-table-column prop="top" label="top" align="center"> </el-table-column>
            <el-table-column prop="type" label="type" align="center"> </el-table-column> -->
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="客户营销" lazy>
          <div class="hot-1 flex-cc">
            <div class="label">客户数据来源：</div>
            <el-checkbox-group v-model="checkboxGroup1" :size="buttonSize">
              <el-checkbox-button v-for="item in custOrigin" :label="item" :key="item">{{ item }}</el-checkbox-button>
            </el-checkbox-group>
          </div>
          <div class="hot-1">
            <template v-for="(item, idx) in custMark">
              <el-radio-group class="radio-item" v-model="formRadius[item.key]" :key="idx" :size="buttonSize">
                <el-radio-button v-for="(subit, subid) in item.list" :key="subid" :label="subit"></el-radio-button>
              </el-radio-group>
            </template>
          </div>
          <div class="hot-1 flex-cc">
            <div class="label">风险偏好：</div>
            <el-checkbox-group v-model="checkboxGroup2" :size="buttonSize">
              <el-checkbox-button v-for="item in riskPreference" :label="item" :key="item">{{
                item
              }}</el-checkbox-button>
            </el-checkbox-group>
          </div>

          <el-table v-bind="tableCssAttr" :data="tableData" style="width: 100%">
            <el-table-column align="center" prop="prop1" label="客户名称"> </el-table-column>
            <el-table-column align="center" prop="prop2" label="联系方式"> </el-table-column>
            <el-table-column align="center" prop="prop3" label="薪酬水平"> </el-table-column>
            <el-table-column align="center" prop="prop4" label="上月消费笔数"> </el-table-column>
            <el-table-column align="center" prop="prop5" label="上月消费金额"> </el-table-column>
            <el-table-column align="center" prop="prop6" width="160" label="推荐产品">
              <template slot-scope="scope">
                <el-tag style="margin-right: 5px" v-for="item in scope.row.prop6" :key="item">{{ item }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <el-tooltip class="item" effect="dark" content="收起" placement="bottom">
        <div class="toggle upper-right" @click="drawer = false">
          <i class="el-icon-d-arrow-right"></i>
        </div>
      </el-tooltip>
    </el-drawer>
  </div>
</template>
<script>
  import BarChart from '@/components/Chart/BarChart'
  import PieChart from '@/components/Chart/PieChart'
  import CountTo from '@/components/CountTo.vue'
  import Sticky from './Sticky/index.vue'
  import {
    flows,
    custFlow,
    groupPortrait,
    topType,
    hotRegion,
    populations,
    sex,
    age,
    education,
    marriage,
    car,
    birth,
    asset,
    industry,
    custMark
  } from '@/utils/mockData'
  export default {
    data() {
      return {
        drawer: false,

        buttonSize: 'small',
        tableCssAttr: { border: true, stripe: true, headerCellStyle: { background: '#e5ecfa', color: '#4C4C4C' } },
        flows,
        custFlow,
        flowType: flows[0],

        groupPortrait,
        sex,
        age,
        education,
        marriage,
        car,
        birth,
        asset,
        industry,
        populations,
        portraitSwitch: populations[0],
        populationType: populations[0],

        hotTopType: topType.type1,
        topType,
        hotRegion,
        tbHeight: 470,

        tableData: [
          {
            prop1: '周XX',
            prop2: '137****5678',
            prop3: '1万-2万',
            prop4: '20-30笔',
            prop5: '1万-10万',
            prop6: ['XX贷', 'XX理财']
          },
          {
            prop1: '王XX',
            prop2: '132****0987',
            prop3: '1万-2万',
            prop4: '20-30笔',
            prop5: '1万-10万',
            prop6: ['XX理财']
          },
          {
            prop1: '张XX',
            prop2: '132****2345',
            prop3: '1万-2万',
            prop4: '20-30笔',
            prop5: '1万-10万',
            prop6: ['XX贷']
          }
        ],
        custOrigin: ['借记卡', '个贷', 'ETC', '社保/医保', '代发/代扣'],

        riskPreference: ['积极型', '稳健型', '保守型', '激进型', '平衡型'],
        checkboxGroup1: ['个贷', '代发/代扣'],
        checkboxGroup2: ['积极型', '稳健型'],

        custMark,
        formRadius: {
          radius1: '',
          radius2: '',
          radius3: '',
          radius4: '',
          radius5: '',
          radius6: ''
        }
      }
    },
    components: {
      PieChart,
      BarChart,
      CountTo,
      Sticky
    },
    computed: {
      hotRegionFilter: function () {
        return this.hotRegion.filter((ele) => ele.top === this.hotTopType && ele.type === this.populationType)
      },
      groupPortraitFilter: function () {
        return this.groupPortrait[this.portraitSwitch]
      },
      flowTypeFilter: function () {
        return this.custFlow[this.flowType]
      }
    },
    mounted() {
      let index = 0
      for (const key in this.formRadius) {
        this.formRadius[key] = this.custMark[index].list[0]
        index++
      }
      this.$nextTick(() => {})
    },
    methods: {
      setSearch(val) {
        this.drawer = false
        this.$EventBus.$emit('setSearch', val)
      },
      handleClick() {
        // let scrollDom = document.querySelector('#drawer-wrap .el-drawer__body')
        // scrollDom.scrollIntoView({
        //   behavior: 'smooth', // 平滑过渡
        //   top: 0
        // })
      }
    }
  }
</script>
<style scoped lang="less">
  @color: #5a9cf8;
  @fs: 24px;
  @lineColor: #f1f1f1;

  /deep/ .el-drawer__body {
    padding: 0 16px 16px 16px;
  }
  .el-tabs {
  }
  // 固定tab
  /deep/ .el-tabs__header {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    z-index: 99;
    background: #fff;
    .el-tabs__nav-wrap::after {
      height: 1px;
    }
    .el-tabs__item {
      font-size: 16px;
    }
  }
  .upper-right {
    position: absolute;
    right: 0;
    top: 0;
    i {
      animation: run 1s linear;
      animation-iteration-count: infinite;
    }
  }
  .middle-right {
    position: absolute;
    right: 0;
    top: 46%;
    transform: translateY(-50%);
    i {
      animation: run 1s linear;
      animation-direction: reverse;
      animation-iteration-count: infinite;
    }
  }
  .toggle {
    z-index: 99;
    background: @color;
    color: #fff;
    padding: 10px;
    cursor: pointer;
    &:hover {
    }
    @keyframes run {
      from {
        transform: translateX(-3px);
      }
      to {
        transform: translateX(3px);
      }
    }
  }

  section {
    margin-bottom: 16px;
  }

  .right-pane {
    .el-button.toggle {
      position: fixed;
      right: 0;
      top: 70px;
    }
  }
  .hot-bg {
    background: url('../assets/img/bg@2x.png') no-repeat;
    background-size: 100% 100%;
    box-shadow: 1px 2px 4px 0 rgba(0, 0, 0, 0.07);
    margin: 12px 0;
    padding: 12px;
    border-radius: 2px;
    div {
      font-size: 12px;
      &:nth-child(1) {
        font-size: @fs;
        color: @color;
        padding: 0 0 10px 0;
      }
    }
  }

  .box {
    display: flex;
    flex-wrap: wrap;
    .chart-box {
      width: 50%;
      position: relative;
      border-bottom: 1px solid @lineColor;
      &:nth-child(odd)::after {
        content: '';
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        height: 160px;
        background: @lineColor;
        width: 1px;
      }
    }
  }

  .hot-1 {
    padding-bottom: 16px;
    .label {
      margin-right: 20px;
      font-size: 14px;
    }
    .el-switch {
      margin: 0 20px 16px 0;
    }
    &:nth-child(2) {
      padding-bottom: 0;
    }
    .radio-item {
      margin: 0 16px 16px 0;
    }
  }
</style>
