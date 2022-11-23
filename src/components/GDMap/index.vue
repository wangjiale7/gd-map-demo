<template>
  <div class="gd-map">
    <div class="search-card">
      <!-- <label style="color: grey">地理编码，根据地址获取经纬度坐标</label> -->
      <section class="gd-search flex-rb flex-wrap">
        <div class="flex-cc">
          <el-select
            v-model="province"
            placeholder="省份"
            filterable
            @change="changeCenter(province, provinceList, 'province')"
          >
            <el-option v-for="item in provinceList" :key="item.adcode" :label="item.name" :value="item.name">
            </el-option>
          </el-select>
          <el-select v-model="city" placeholder="地级市" filterable @change="changeCenter(city, cityList, 'city')">
            <el-option v-for="item in cityList" :key="item.adcode" :label="item.name" :value="item.name"> </el-option>
          </el-select>
          <el-select
            placeholder="区县"
            v-model="district"
            filterable
            @change="changeCenter(district, districtList, 'district')"
          >
            <el-option v-for="item in districtList" :key="item.adcode" :label="item.name" :value="item.name">
            </el-option>
          </el-select>
          <el-select placeholder="街道" v-model="street" filterable @change="setCenter(street, streetList)">
            <el-option v-for="(item, idx) in streetList" :key="item.adcode - idx" :label="item.name" :value="item.name">
            </el-option>
          </el-select>
          <el-select
            id="searchTip"
            v-model="searchTip"
            filterable
            remote
            placeholder="请输入关键词"
            :remote-method="searchPosi"
            :loading="loading"
          >
            <el-option v-for="item in list" :key="item.id" :value="item.name" :label="item.name">
              {{ item.name }}
              <span style="color: #999; margin-left: 10px; font-size: 12px" class="posi-dis">{{ item.district }}</span>
            </el-option>
          </el-select>
          <!-- <i class="el-icon-search" @click="getGeoCode" title="查询"></i> -->
          <el-tooltip class="item" effect="dark" content="清空" placement="right">
            <i class="el-icon-close" @click="resetSearch" title="清空"></i>
          </el-tooltip>
        </div>

        <div class="flex-cc">
          <label for="radius" style="cursor: pointer">选择半径：</label>
          <el-select v-model="km" id="radius" style="width: 90px">
            <el-option v-for="item in kmList" :key="item.value" :value="item.value" :label="item.label"> </el-option>
          </el-select>
        </div>
      </section>
      <!-- <div class="info" :class="[currentPosi.length && 'show']">
        {{ currentPosi }}
        <ul class="serp-list">
          <li v-for="itme in currentPosi" :key="itme.id">
            <div class="poi-info-left">
              <h3 class="poi-title">
                <span class="poi-name" title="都汇中心B座"
                  >1.&nbsp;{{ itme.name }}</span
                >
              </h3>
              <div class="poi-info">
                <p class="poi-addr">{{ itme | realInfo }}</p>
              </div>
            </div>
          </li>
        </ul>
      </div> -->
    </div>
    <div id="container"></div>

    <div id="panel"></div>
  </div>
</template>
<script>
  import AMapLoader from '@amap/amap-jsapi-loader'
  import { securityJsCode, AmapKey } from '@/utils/constants'

  window._AMapSecurityConfig = {
    securityJsCode
  }
  const initRadius = 200
  const initPosi = [121.602679, 29.863162] //福明街道
  export default {
    name: 'gd-map',

    data() {
      return {
        map: null,
        AMap: null,
        lnglatValue: null,
        searchTip: '',
        list: [],
        loading: false,
        markers: [],

        provinceList: [],
        province: '浙江省', //浙江省
        cityList: [],
        city: '宁波市', //宁波市
        districtList: [],
        district: '鄞州区', //鄞州区
        streetList: [],
        street: '福明街道', // 福明街道
        kmList: [
          {
            value: 200,
            label: '200米'
          },
          {
            value: 1000,
            label: '1公里'
          },
          {
            value: 2000,
            label: '2公里'
          },
          {
            value: 3000,
            label: '3公里'
          }
        ],
        km: initRadius
      }
    },
    filters: {
      realInfo(item) {
        if (item.address && item.address.length) {
          return item.address
        } else {
          return item.district
        }
      }
    },
    computed: {
      currentPosi: function () {
        return this.list.filter((ele) => ele.name === this.searchTip)
      }
    },
    watch: {
      currentPosi: {
        handler: function (val) {
          console.log('watch => currentPosi', val)
          if (val && val.length && val[0].location) {
            let cpoint = [val[0].location.lng, val[0].location.lat]
            this.setConver(cpoint)
          } else {
            console.error('没有位置')
          }
        }
      }
    },
    created() {},

    mounted() {
      //DOM初始化完成进行地图初始化
      this.init()

      this.$EventBus.$on('setSearch', (val) => {
        this.searchTip = val
        this.searchPosi(val)
      })
    },

    methods: {
      setCenter(value, list) {
        let item = list.find((ele) => ele.name === value)
        console.log(item)
        this.map.setCenter(item.center)
      },
      changeCenter(value, list, keyType) {
        let item = list.find((ele) => ele.name === value)
        let adcode = item.adcode
        console.log(adcode)
        const AMap = this.AMap
        var opts = {
          subdistrict: 1, //返回下一级行政区
          showbiz: false //最后一级返回街道信息
        }
        AMap.plugin('AMap.DistrictSearch', () => {
          var districtSearch = new AMap.DistrictSearch(opts)
          //行政区查询
          //按照adcode进行查询可以保证数据返回的唯一性
          districtSearch.search(adcode, (status, result) => {
            console.log(result)
            if (status === 'complete') {
              this.getData(result.districtList[0], keyType)
            }
          })
        })
      },
      getData(data, level) {
        // console.log(data, level)
        // var bounds = data.boundaries;
        // if (bounds) {
        //   for (var i = 0, l = bounds.length; i < l; i++) {
        //     var polygon = new AMap.Polygon({
        //       map: map,
        //       strokeWeight: 1,
        //       strokeColor: '#0091ea',
        //       fillColor: '#80d8ff',
        //       fillOpacity: 0.2,
        //       path: bounds[i]
        //     });
        //     polygons.push(polygon);
        //   }
        //   map.setFitView();//地图自适应
        // }

        //清空下一级别的下拉列表
        if (level === 'province') {
          this.city = ''
          this.district = ''
          this.street = ''
        } else if (level === 'city') {
          this.district = ''
          this.street = ''
        } else if (level === 'district') {
          this.street = ''
        }

        var subList = data.districtList
        if (subList) {
          var curlevel = subList[0].level
          // console.log(curlevel, subList)
          if (curlevel === 'city') {
            this.cityList = subList
          } else if (curlevel === 'district') {
            this.districtList = subList
          } else if (curlevel === 'street') {
            this.streetList = subList
          }
        }
      },
      setConver(cpoint) {
        this.clearCover()
        const AMap = this.AMap
        const map = this.map
        AMap.plugin(['AMap.PlaceSearch'], () => {
          //构造地点查询类
          var placeSearch = new AMap.PlaceSearch({
            // type: '酒店', // 兴趣点类别
            pageSize: 5, // 单页显示结果条数
            pageIndex: 1, // 页码
            // city: '010', // 兴趣点城市
            // citylimit: true, //是否强制限制在设置的城市内搜索
            map: map, // 展现结果的地图实例
            panel: 'panel', // 结果列表将在此容器中进行展示。
            autoFitView: true // 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
          })

          // var cpoint = [116.405467, 39.907761] //中心点坐标
          placeSearch.searchNearBy('', cpoint, this.km, (status, result) => {
            if (status === 'no_data') {
              map.panTo([this.currentPosi[0].location.lng, this.currentPosi[0].location.lat])
            }
          })
        })
      },
      resetSearch() {
        this.searchTip = null
        this.clearCover()
        let dom = document.querySelector('#panel')
        dom.innerHTML = ''
      },

      getPosiByLnglat(location) {
        const AMap = this.AMap
        AMap.plugin('AMap.Geocoder', () => {
          var geocoder = new AMap.Geocoder({
            // city 指定进行编码查询的城市，支持传入城市名、adcode 和 citycode
            // city: '010',
          })

          var lnglat = [location.lng, location.lat]
          geocoder.getAddress(lnglat, (status, result) => {
            console.log(status, result)
            if (status === 'complete' && result.info === 'OK') {
              this.searchTip = result.regeocode.formattedAddress
              this.searchPosi(this.searchTip)
              // result为对应的地理位置详细信息
            }
          })
        })
      },
      /**
       * @description: 地址正编码
       * @return {*}
       */
      getGeoCode() {
        const AMap = this.AMap
        const map = this.map
        AMap.plugin('AMap.Geocoder', () => {
          var geocoder = new AMap.Geocoder({
            // city 指定进行编码查询的城市，支持传入城市名、adcode 和 citycode, 限制搜索范围
            // city: '010'
          })
          console.log(this.currentPosi)
          if (this.currentPosi && this.currentPosi.length) {
            geocoder.getLocation(this.currentPosi[0].district + this.currentPosi[0].name, (status, result) => {
              console.log(status, result)
              if (status === 'complete' && result.geocodes.length) {
                var lnglat = result.geocodes[0].location
                this.lnglatValue = JSON.stringify(lnglat)
                console.log(lnglat)
                this.clearCover()
                let marker = this.createMark(lnglat)
                let circle = this.createCircle(lnglat)
                this.markers = [marker, circle]
                map.add(marker)
                map.add(circle)
                map.setFitView()
              } else {
                this.$message.error(status + ': ' + result)
              }
            })
          } else {
            this.$message.error('请输入地址查询')
          }
        })
      },
      /**
       * @description: 添加3d
       * @return {*}
       */
      // 清除指定点
      clearCover() {
        this.markers &&
          this.markers.length &&
          this.markers.forEach((ele) => {
            ele.setMap(null)
          })

        // 使用clearMap方法删除所有覆盖物
        this.map.clearMap()
      },
      createMark(location = {}) {
        let { lng, lat } = location
        // 创建一个 Marker 实例：
        // 创建一个 Marker 实例：
        let AMap = this.AMap
        var marker = new AMap.Marker({
          position: new AMap.LngLat(lng, lat) // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
        })
        return marker
      },

      createCircle(location = {}) {
        let { lng, lat } = location
        let AMap = this.AMap
        var circle = new AMap.Circle({
          center: [lng, lat],
          radius: this.km, //半径
          borderWeight: 3,
          strokeColor: '#FF33FF',
          strokeOpacity: 1,
          strokeWeight: 1,
          fillOpacity: 0.4,
          fillColor: '#1791fc',
          zIndex: 50
        })
        return circle
      },
      clickMap(e) {
        const map = this.map
        var text = '您在 [ ' + e.lnglat.getLng() + ',' + e.lnglat.getLat() + ' ] 的位置单击了地图！'
        let cpoint = [e.lnglat.getLng(), e.lnglat.getLat()]

        this.setConver(cpoint)
        // this.clearCover()
        // let marker = this.createMark(e.lnglat)
        // let circle = this.createCircle(e.lnglat)
        // this.markers = [marker, circle]
        // map.add(marker)
        // map.add(circle)
        // // map.setFitView()
        // this.getPosiByLnglat(e.lnglat)
      },

      init() {
        AMapLoader.load({
          key: AmapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
          version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
          plugins: [] // 需要使用的的插件列表，如比例尺'AMap.Scale'等
        })
          .then((AMap) => {
            this.AMap = AMap
            const map = new AMap.Map('container', {
              //设置地图容器id
              // pitch:75, // 地图俯仰角度，有效范围 0 度- 83 度
              terrain: true, // 开启地形图
              viewMode: '3D', //是否为3D地图模式
              center: initPosi, //初始化地图中心点位置
              rotateEnable: true,
              pitchEnable: true,
              zoom: 17,
              pitch: 50,
              rotation: -15,
              zooms: [2, 20]
            })
            this.map = map

            //添加点击事件
            map.on('click', this.clickMap)

            // 组合了旋转、倾斜、复位、缩放在内的地图控件，自V1.4.0版本新增。
            AMap.plugin(['AMap.ControlBar'], function () {
              var controlBar = new AMap.ControlBar({
                position: {
                  left: '10px',
                  top: '10px'
                }
              })
              map.addControl(controlBar)
            })

            //加载工具条
            AMap.plugin(['AMap.ToolBar'], function () {
              var tool = new AMap.ToolBar({
                position: {
                  left: '40px',
                  top: '110px'
                }
              })
              map.addControl(tool)
            })
            AMap.plugin(['AMap.Scale'], function () {
              var Scale = new AMap.Scale({
                position: {
                  bottom: '20px',
                  left: '20px'
                }
              })
              map.addControl(Scale)
            })

            //输入提示

            //--
            // this.setRangeArea()
            //--

            this.getProvince()

            this.getCity()
            this.getRegion()
            this.getStreet()
          })

          .catch((e) => {
            console.log(e)
          })
      },
      setRangeArea() {
        const AMap = this.AMap
        const map = this.map
        AMap.plugin('AMap.DistrictSearch', () => {
          // 创建行政区查询对象
          var district = new AMap.DistrictSearch({
            // 返回行政区边界坐标等具体信息
            extensions: 'all',
            // 设置查询行政区级别为 区
            level: 'district'
          })

          district.search('鄞州区', (status, result) => {
            // 获取朝阳区的边界信息
            var bounds = result.districtList[0].boundaries
            let polygonArr = []
            for (let i = 0, l = bounds.length; i < l; i++) {
              polygonArr.push(bounds[i])
            }
            //生成行政区划polygon
            var polygon = new AMap.Polygon({
              map: map,
              path: polygonArr,
              strokeWeight: 2,
              fillOpacity: 0,
              fillColor: '#CCF3FF',
              strokeColor: '#000'
            })
            // 添加覆盖物点击事件
            polygon.on('click', (e) => {
              this.clickMap(e)
            })
            // 地图自适应
            // map.setFitView()
          })
        })
      },
      getProvince() {
        const AMap = this.AMap
        const map = this.map
        const that = this
        AMap.plugin('AMap.DistrictSearch', function () {
          var districtSearch = new AMap.DistrictSearch({
            // 关键字对应的行政区级别，country表示国家
            level: 'country',
            //  显示下级行政区级数，1表示返回下一级行政区
            subdistrict: 1
          })

          // 搜索所有省/直辖市信息
          districtSearch.search('中国', function (status, result) {
            // 查询成功时，result即为对应的行政区信息
            console.log(JSON.parse(JSON.stringify(result.districtList[0].districtList)))
            that.provinceList = result.districtList[0].districtList
          })
        })
      },
      getCity() {
        const AMap = this.AMap
        const map = this.map
        const that = this
        var districtSearch = new AMap.DistrictSearch({
          level: 'province',
          subdistrict: 1
        })
        // 搜索所有省/直辖市信息
        districtSearch.search(this.province, (status, result) => {
          // 查询成功时，result即为对应的行政区信息

          console.log(JSON.parse(JSON.stringify(result.districtList[0].districtList)))
          this.cityList = result.districtList[0].districtList
        })
      },

      getRegion() {
        const AMap = this.AMap
        const map = this.map
        var districtSearch = new AMap.DistrictSearch({
          level: 'city',
          subdistrict: 1
        })
        // 搜索所有省/直辖市信息
        districtSearch.search(this.city, (status, result) => {
          // 查询成功时，result即为对应的行政区信息
          console.log(JSON.parse(JSON.stringify(result.districtList[0].districtList)))
          this.districtList = result.districtList[0].districtList
        })
      },

      getStreet() {
        const AMap = this.AMap
        const map = this.map
        var districtSearch = new AMap.DistrictSearch({
          level: 'district',
          subdistrict: 1
        })
        districtSearch.search(this.district, (status, result) => {
          console.log(result.districtList[0].districtList)
          this.streetList = result.districtList[0].districtList
        })
      },

      searchPosi(query) {
        // console.log(query)
        const AMap = this.AMap
        if (query !== '') {
          this.loading = true
          // JSAPI 2.0 输入提示插件名称由 AMap.Autocomplete 变更为 AMap.AutoComplete 啦！

          AMap.plugin('AMap.AutoComplete', () => {
            var autoOptions = {
              //city 限定城市，默认全国
              // city: '全国'
              // city: '010' //鄞州区adcode
              city: '330212', // 兴趣点城市
              citylimit: true //是否强制限制在设置的城市内搜索
            }
            // 实例化AutoComplete
            var autoComplete = new AMap.AutoComplete(autoOptions)
            // 根据关键字进行搜索
            autoComplete.search(query, (status, result) => {
              // 搜索成功时，result即是对应的匹配数据
              console.log(status, result)
              this.list = result.tips.map((ele) => ({
                ...ele
              }))
              this.loading = false
            })
          })
        } else {
          this.options = []
        }
      }
    }
  }
</script>

<style scoped lang="less">
  .gd-map {
    height: 100%;
    display: flex;
    flex-direction: column;
    #container {
      flex: 1;
    }
  }
  #panel {
    position: fixed;
    background-color: white;
    max-height: 90%;
    overflow-y: auto;
    top: 140px;
    right: 10px;
    width: 280px;
    // border-bottom: solid 1px silver;
  }
  .search-card {
    // position: fixed;
    // left: 15px;
    // top: 15px;
    // width: 200px;
    // border: solid 1px #000;
    background-color: #fff;

    .gd-search {
      padding: 12px 12px;
      border-radius: 3px;
      // height: 45px;
      box-shadow: 0 2px 2px rgb(0 0 0 / 15%);

      // padding: 10px 0;
      label img {
        width: 50px;
        height: 50px;
      }
      .el-select:nth-of-type(5) {
        width: 350px;
      }
      .el-select {
        width: 120px;
        border-radius: 0;
        /deep/ .el-input__inner {
          border-radius: 0;
        }
      }

      i {
        padding: 0 12px;
        font-size: 20px;
        height: 100%;
        line-height: 40px;
        cursor: pointer;

        &:hover {
          color: lighten(#999, 0.5);
        }
      }
    }

    .info {
      // padding: 0;
      // padding: 12px 16px;
      box-shadow: 1px 2px 1px rgb(0 0 0 / 10%);
      max-height: 0;
      // display: none;
      transition: all 0.3s ease-in-out;
      overflow: hidden;

      ul {
        list-style: none;

        li {
        }
      }

      .poi-info {
        font-size: 14px;
        color: #999;
      }

      &.show {
        max-height: 200px;
        // transition: none !important;
        // display: block;
      }
    }
  }
</style>
