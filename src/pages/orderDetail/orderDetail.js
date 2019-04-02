import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button } from '@tarojs/components'
import { AtIcon } from 'taro-ui'

import './orderDetail.scss'


export default class orderDetail extends Component {
  config = {
    navigationBarTitleText: '订单详情'
  }

  constructor() {
    super();
    this.state = {
      openId: ''
    }
  }

  // 页面刚刚加载出来的时候获取本地内存中的openid
  componentWillMount() {
    const openId = Taro.getStorageSync('openid');
  }

  //生命周期 每当这页显示的时候要去后台请求数据库
  componentDidShow() {
  }

  // 页面更新触发的生命周期
  componentDidUpdate() {
  }
  render() {
    return (
      <View>
        
      </View>
    )
  }
}