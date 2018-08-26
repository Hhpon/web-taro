import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Swiper } from '@tarojs/components'

import './index.scss'

export default class Index extends Component {
  config = {
    navigationBarTitleText: '全家享'
  }

  constructor() {
    super();
    this.state = {
      navName: ['热卖', '水果', '生鲜', '速食', '日百', '生活服务'],
      sliderGoods: [],
      Goods: [],
      imgheights: 0,
      imgUrls: []
    }
  }

  componentWillMount() {
    this.getGoods(0);
  }

  componentDidMount() { }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  navActive(event) {
    const index = event.currentTarget.dataset.index;
    this.getGoods(index);
  }

  goodsActive(event) {
    const goodId = event.currentTarget.dataset.goodid;
    Taro.navigateTo({
      url: '../goodsDetails/goodsDetails?goodid=' + goodId
    })
  }

  getGoods(index) {
    this.state.sliderGoods = [];
    this.state.Goods = [];
    Taro.request({
      url: 'http://localhost:7001/getGoods',
      method: 'POST',
      data: {
        index: index
      }
    }).then(res => {

      const data = res.data.reverse(); // 把返回的数组调换顺序

      const sliderGoods = [];
      data.forEach(element => {
        if (element.sliderView) {
          const num = sliderGoods.length;
          if (num < 3) {
            sliderGoods.push(element);
          }
        } else {
          this.state.Goods.push(element);
        }
      });
      this.setState({
        sliderGoods: sliderGoods
      })
    })
  }

  imageLoad(e) {
    var imgwidth = e.detail.width, imgheight = e.detail.height, ratio = imgwidth / imgheight;
    //计算的高度值
    var sysInfoWidth = Taro.getSystemInfoSync().windowWidth;
    var imgheights = sysInfoWidth / ratio;
    this.setState({
      imgheights: imgheights,
    });
  }

  render() {
    const navHeader = this.state.navName.map((nav) => {
      return (
        <Text onClick={this.navActive} data-index='{{index}}'>{nav}</Text>
      )
    })

    const imgList = this.state.sliderGoods.map((sliderGood) => {
      return (
        <Swiper-item>
          <Image mode='widthFix' onClick={this.goodsActive} data-goodid='{{sliderGood.goodsId}}' onLoad={this.imageLoad} className='image' src={sliderGood.sliderUrl} />
        </Swiper-item>
      )
    })

    const goodsDebli = this.state.Goods.map((good) => {
      return (
        <View>
          <Image mode='widthFix' style='width:100%' src={good.titleUrl}></Image>
          <View className='goods-container'>
            <View className='goods-title'>{good.name}</View>
            <View className='goods-button'>去抢购</View>
          </View>
          <View className='price-container'>
            <View className='goods-price'>{good.price}</View>
          </View>
        </View>
      )
    })

    return (
      <View>
        <View className='nav-container'>
          {navHeader}
        </View>
        <Swiper autoplay indicator-dots circular className='swiper' style='height:{{imgheights}}px'>
          {imgList}
        </Swiper>
        <View style='height:5px'></View>
        <View>
          {goodsDebli}
        </View>
      </View>
    )
  }
}