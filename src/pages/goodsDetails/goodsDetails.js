import Taro, { Component } from '@tarojs/taro'
import { View, Button, Image } from '@tarojs/components'
import { AtFloatLayout, AtInputNumber, AtIcon } from 'taro-ui'

import './goodsDetails.scss'

export default class goodsDetails extends Component {
  config = {
    navigationBarTitleText: '商品详情'
  }

  constructor() {
    super();
    this.state = {
      goodDetails: {},
      isOpened: false,
      sellNum: 1
    }
  }

  componentWillMount() {
    const goodId = this.$router.params.goodid;
    console.log(goodId);
    Taro.request({
      url: 'http://127.0.0.1:7001/getGoodDetails',
      method: 'POST',
      data: {
        goodId: goodId
      }
    }).then(res => {
      console.log(res.data);
      this.setState({
        goodDetails: res.data[0]
      })
    })
  }

  // 加入购物车按钮
  shopButton() {
    let goodDetail = this.state.goodDetails;
    const openId = Taro.getStorageSync('openid');
    Taro.request({
      url: 'http://127.0.0.1:7001/shoppingCart',
      method: 'POST',
      data: {
        goodDetail: goodDetail,
        shoppingNum: this.state.sellNum,
        openId: openId
      },
      success(res) {
        console.log(res);
        if (res.data === 100) {
          Taro.showToast({
            title: '商品已经添加！',
            icon: 'success',
            duration: 1000
          })
        } else {
          Taro.showToast({
            title: '添加成功！',
            icon: 'success',
            duration: 1000
          })
        }
      },
      fail(res) {
        Taro.showToast({
          title: '请稍后重试！',
          icon: 'none',
          duration: 1000
        })
      }
    })
  }

  // 立即购买按钮(显示浮动弹窗)
  sellButton() {
    this.setState({
      isOpened: true
    })
  }

  // 首页按钮
  hometabButton() {
    console.log('首页');
    Taro.switchTab({
      url: '/pages/index/index'
    })
  }

  // 购物车按钮
  carttabButton() {
    console.log('购物车');
    Taro.switchTab({
      url: '/pages/shopcart/shopcart'
    })
  }

  // 点击减号的方法
  subtractHandle() {
    if (this.state.sellNum > 1) {
      this.setState({
        sellNum: this.state.sellNum - 1
      })
    }
  }

  //点击加号的方法
  addHandle() {
    this.setState({
      sellNum: this.state.sellNum + 1
    })
  }

  // 立即购买按钮(实际动作而非弹窗)
  sellNowButton() {
    const openId = Taro.getStorageSync('openid');
    Taro.request({
      url: 'http://127.0.0.1:7001/shoppingCart',
      method: 'POST',
      data: {
        shoppingNum: this.state.sellNum,
        goodDetail: this.state.goodDetails,
        openId: openId
      }
    }).then(res => {
      console.log(res);
      Taro.switchTab({
        url: '/pages/shopcart/shopcart'
      })
    })
  }

  // 关闭弹窗按钮
  closeButton() {
    this.setState({
      isOpened: false
    })
  }

  render() {
    const goodDetails = this.state.goodDetails;
    const isOpened = this.state.isOpened;
    const details = goodDetails.detailsUrl.map(detailUrl => {
      return (
        <Image mode='widthFix' style='width:100%' src={detailUrl}></Image>
      )
    })
    return (
      <View>
        <View>
          <View>
            <Image mode='widthFix' style='width:100%' src={goodDetails.titleUrl}></Image>
          </View>
          <View className='price-container'>
            <View className='price-left'>
              <Text className='price'>￥{goodDetails.price}</Text>
              <Text className='oldprice'>￥{goodDetails.oldPrice}</Text>
            </View>
            <View className='price-right'>
              已抢{goodDetails.saleAmount}件
            </View>
          </View>
          <View className='title-container'>
            <View className='title-left'>
              <View className='titleleft-top'>{goodDetails.name}</View>
              <View className='titleleft-bottom'>{goodDetails.subTitle}/剩余{goodDetails.amount}件</View>
            </View>
            <View className='title-right'>
              <Button className='iconShare' openType='share'>
                <AtIcon prefixClass='icon' value='fenxiang'></AtIcon>
              </Button>
              <Text style='font-size:12px;'>分享</Text>
            </View>
          </View>
          <View style='border-bottom: 10px solid #f7f7f7;'></View>
          <View>
            <View style='padding:15px;font-size:20px;font-weight:blod'>商品详情</View>
            <View>
              {details}
            </View>
            <View style='height:50px;'>
            </View>
          </View>
        </View>
        <View className='details-tab'>
          <View className='tab-button'>
            <View className='button-left' onClick={this.hometabButton}>
              <AtIcon prefixClass='icon' value='zhuye-copy' color='#707070' size='25'></AtIcon>
              <Text>首页</Text>
            </View>
            <View className='button-left' onClick={this.carttabButton}>
              <AtIcon prefixClass='icon' value='hongjiuchengicongouwuche' color='#707070' size='25'></AtIcon>
              <Text>购物车</Text>
            </View>
          </View>
          <View onClick={this.shopButton} className='shop-button'>加入购物车</View>
          <View onClick={this.sellButton} className='sell-button'>立即购买</View>
        </View>
        {
          isOpened &&
          <View className='floatlayout-container'>
            <View className='floatlayout-info'>
              <View className='floatlayout-header'>
                <AtIcon value='close' size='15' color='#B7B7B7' onClick={this.closeButton}></AtIcon>
              </View>
              <View className='floatlayout-mes'>
                <View>
                  <Image mode='widthFix' src={goodDetails.titleUrl} style='width: 25vw;'></Image>
                </View>
                <View className='floatlayout-right'>
                  <View>{goodDetails.name}</View>
                  <View className='floatlayout-price'>
                    <Text style='color:#FFAC46;'>￥{goodDetails.price}</Text>
                    <Text style='color:#B7B7B7;'>库存{goodDetails.amount}件</Text>
                  </View>
                </View>
              </View>
              <View className='floatlayout-select'>
                <View className='select-text'>规格</View>
                <View className='select-specification'>1份</View>
                <View className='select-text'>数量</View>
                <View className='select-num'>
                  <View onClick={this.subtractHandle}>
                    <AtIcon value='subtract-circle' color='#E3E3E3'></AtIcon>
                  </View>
                  <Text style='width:40px;text-align:center;color:#FFAC46'>
                    {this.state.sellNum}
                  </Text>
                  <View onClick={this.addHandle}>
                    <AtIcon value='add-circle' color='#E3E3E3'></AtIcon>
                  </View>
                </View>
              </View>
              <View onClick={this.sellNowButton} className='floatlayout-sellhandle'>立即购买</View>
            </View>
          </View>
        }
      </View>
    )
  }
}