<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
  import * as echarts from 'echarts'

  import resize from './mixins/resize'

  const animationDuration = 1000

  export default {
    mixins: [resize],
    props: {
      xRotate: {
        type: Boolean,
        default: false
      },
      className: {
        type: String,
        default: 'chart'
      },
      width: {
        type: String,
        default: '100%'
      },
      height: {
        type: String,
        default: '300px'
      },
      title: {
        type: String
      },
      chartData: {
        type: Array,
        required: true,
        default: () => {
          return []
        }
      }
    },
    data() {
      return {
        chart: null
      }
    },
    watch: {
      chartData: {
        deep: true,
        handler(val) {
          this.setOptions(val)
        }
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.initChart()
      })
    },
    beforeDestroy() {
      if (!this.chart) {
        return
      }
      this.chart.dispose()
      this.chart = null
    },
    methods: {
      initChart() {
        this.chart = echarts.init(this.$el, 'macarons')
        this.setOptions(this.chartData)
      },
      setOptions(data) {
        if (!data || data.length === 0) {
          return
        }
        this.chart.setOption({
          title: {
            text: this.title
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              // 坐标轴指示器，坐标轴触发有效
              type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
            }
          },

          // tooltip: {
          //   trigger: 'item',
          //   // formatter: '{a} <br/>{b} : {d}%'
          //   formatter: '{b} : {d}%'
          // },
          
          // legend: {
          // data: ['pageA', 'pageB', 'pageC']
          // },
          grid: {
            top: this.title != null ? 45 : 10,
            left: 0,
            right: 0,
            bottom: 0,
            containLabel: true
          },

          xAxis: [
            {
              type: 'category',
              data: data.map((ele) => {
                return ele.name
              }),
              axisTick: {
                show: false,
                alignWithLabel: true
              },
              axisLabel: {
                interval: 0, //隔几项显示一个标签
                rotate: this.xRotate ? '45' : 0 //标签倾斜的角度，旋转的角度是-90到90度
              }
            }
          ],
          yAxis: [
            {
              show: true,
              type: 'value',
              axisTick: {
                show: false
              }
            }
          ],
          series: [
            {
              name: this.title,
              type: 'bar',
              barWidth: '60%',
              data,
              animationDuration,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  { offset: 0, color: '#777CFF ' },
                  { offset: 1, color: '#4A50FE' }
                ])
              }
            }
          ]
        })
      }
    }
  }
</script>
