import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { AtIcon } from 'taro-ui'

import './mine.scss'

export default class mine extends Component {
  config = {
    navigationBarBackgroundColor: '#5FC768'
  }

  constructor() {
    super();
    this.state = {
      userInfo: {},
    }
  }

  componentWillMount() {
    const openId = Taro.getStorageSync('openid');
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

  // 跳转至商品订单
  toOrderList() {
    Taro.navigateTo({
      url: '../orderList/orderList'
    })
  }

  render() {
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
              <View className='ordertop-right' onClick={this.toOrderList}>
                <Text>查看全部订单</Text>
                <AtIcon value='chevron-right' size='15' color='#868281'></AtIcon>
              </View>
            </View>
            <View className='order-bottom'>
              <View className='order-icon'>
                <AtIcon prefixClass='icon' value='daifukuan' color='#5FC768' size='24'></AtIcon>
                <Text>待付款</Text>
              </View>
              <View className='order-icon'>
                <AtIcon prefixClass='icon' value='daifahuo' color='#5FC768' size='24'></AtIcon>
                <Text>待发货</Text>
              </View>
              <View className='order-icon'>
                <AtIcon prefixClass='icon' value='daishouhuo' color='#5FC768' size='24'></AtIcon>
                <Text>待收货</Text>
              </View>
              <View className='order-icon'>
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