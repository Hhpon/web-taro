import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { AtIcon, AtBadge } from 'taro-ui'

import './mine.scss'

export default class mine extends Component {
  config = {
    navigationBarBackgroundColor: '#5FC768'
  }

  constructor() {
    super();
    this.state = {
      userInfo: {},
      openId: '',
      pendingPayment: [],
      toBeDelivered: [],
      pendingReceipt: []
    }
  }

  componentWillMount() {
    const openId = Taro.getStorageSync('openid');
    this.setState({
      openId: openId
    })
    Taro.request({
      url: 'http://127.0.0.1:7001/getUserInfo',
      data: {
        openId: openId
      }
    }).then(res => {
      this.setState({
        userInfo: res.data
      })
      console.log(res.data);
    })
  }

  //生命周期 每当这页显示的时候要去后台请求数据库
  componentDidShow() {
    Taro.request({
      url: 'http://127.0.0.1:7001/getOrders',
      method: 'POST',
      data: {
        openId: this.state.openId
      }
    }).then(res => {
      console.log(res.data)
      let pendingPayment = []
      let toBeDelivered = []
      let pendingReceipt = []
      res.data.map((orderItem) => {
        if (orderItem.status === '待付款') {
          pendingPayment.push(orderItem)
        }
        if (orderItem.status === '待发货') {
          toBeDelivered.push(orderItem)
        }
        if (orderItem.status === '待收货') {
          pendingReceipt.push(orderItem)
        }
      })
      this.setState({
        pendingPayment: pendingPayment,
        toBeDelivered: toBeDelivered,
        pendingReceipt: pendingReceipt
      })
    })
  }

  // 跳转至商品订单
  toOrderList(index, e) {
    Taro.navigateTo({
      url: '../orderList/orderList?index=' + index
    })
  }

  render() {
    let pendingPaymentIndex = this.state.pendingPayment.length;
    let toBeDeliveredIndex = this.state.toBeDelivered.length;
    let pendingReceiptIndex = this.state.pendingReceipt.length;

    let pendingPayment = null
    let toBeDelivered = null
    let pendingReceipt = null
    if (pendingPaymentIndex === 0) {
      pendingPayment =
        <AtIcon prefixClass='icon' value='daifukuan' color='#5FC768' size='24'></AtIcon>
    } else {
      pendingPayment =
        <AtBadge value={pendingPaymentIndex} maxValue={99}>
          <AtIcon prefixClass='icon' value='daifukuan' color='#5FC768' size='24'></AtIcon>
        </AtBadge>
    }

    if (toBeDeliveredIndex === 0) {
      toBeDelivered =
        <AtIcon prefixClass='icon' value='daifahuo' color='#5FC768' size='24'></AtIcon>
    } else {
      toBeDelivered =
        <AtBadge value={toBeDeliveredIndex} maxValue={99}>
          <AtIcon prefixClass='icon' value='daifahuo' color='#5FC768' size='24'></AtIcon>
        </AtBadge>
    }

    if (pendingReceiptIndex === 0) {
      pendingReceipt =
        <AtIcon prefixClass='icon' value='daishouhuo' color='#5FC768' size='24'></AtIcon>
    } else {
      pendingReceipt =
        <AtBadge value={pendingReceiptIndex} maxValue={99}>
          <AtIcon prefixClass='icon' value='daishouhuo' color='#5FC768' size='24'></AtIcon>
        </AtBadge>
    }
    return (
      <View>
        <View className='message-container'>
          <View className='image-container'>
            <View style='height:10px;'></View>
            <View className='avatar-con'>
              <View className='avatar'>
                <Image src={this.state.userInfo.avatarUrl} style='width:70px;height:70px;'></Image>
              </View>
            </View>
            <View className='name-con'>{this.state.userInfo.nickName}</View>
          </View>
          <View className='mine-order'>
            <View className='order-top'>
              <Text>我的订单</Text>
              <View className='ordertop-right' onClick={this.toOrderList.bind(this, 1)}>
                <Text>查看全部订单</Text>
                <AtIcon value='chevron-right' size='15' color='#868281'></AtIcon>
              </View>
            </View>
            <View className='order-bottom'>
              <View className='order-icon' onClick={this.toOrderList.bind(this, 2)}>
                {pendingPayment}
                <Text>待付款</Text>
              </View>
              <View className='order-icon' onClick={this.toOrderList.bind(this, 3)}>
                {toBeDelivered}
                <Text>待发货</Text>
              </View>
              <View className='order-icon' onClick={this.toOrderList.bind(this, 4)}>
                {pendingReceipt}
                <Text>待收货</Text>
              </View>
              <View className='order-icon' onClick={this.toOrderList.bind(this, 5)}>
                <AtIcon prefixClass='icon' value='yishouhuo' color='#5FC768' size='24'></AtIcon>
                <Text>已完成</Text>
              </View>
            </View>
          </View>
        </View>
        <View></View>
        <View></View>
      </View>
    )
  }
}