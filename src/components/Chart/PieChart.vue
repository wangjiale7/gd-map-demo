<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
  import * as echarts from 'echarts'
  import resize from './mixins/resize'

  export default {
    mixins: [resize],
    props: {
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
        // let data = [
        //   { value: 320, name: '性别' },
        //   { value: 240, name: '年龄' },
        //   { value: 149, name: '工资' },
        //   { value: 100, name: '人数' }
        // ]

        this.chart.setOption({
          title: {
            top: '16px',
            text: this.title
          },
          tooltip: {
            trigger: 'item',
            // formatter: '{a} <br/>{b} : {d}%'
            formatter: '{b} : {d}%'
          },
          legend: {
            orient: 'vertical',
            left: 0,
            top: 'middle',
            itemHeight: 16,
            itemWidth: 16

            // data: data.map((ele) => ele.name)
          },
          color: ['#578BF3', '#57EFE8', '#96EA67', '#D5E95F', '#EEA858 ', '#D3D3D3'],
          series: [
            {
              label: {
                show: false,
                position: 'center'
              },
              labelLine: {
                show: false
              },
              name: this.title,
              type: 'pie',
              // roseType: 'radius',
              radius: [55, 90],
              center: ['54%', '50%'],
              data: data,
              animationEasing: 'cubicInOut',
              animationDuration: 2600,
              avoidLabelOverlap: false,
              emphasis: {
                label: {
                  show: true,
                  fontSize: '30',
                  fontWeight: 'bold'
                }
              }
            }
          ]
        })
      }
    }
  }
</script>
