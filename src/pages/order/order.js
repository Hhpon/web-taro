import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button } from '@tarojs/components'
import { AtIcon, AtFloatLayout, AtInput } from 'taro-ui'

import './order.scss'

export default class order extends Component {
  config = {
    navigationBarTitleText: '确认订单'
  }

  constructor() {
    super();
    this.state = {
      
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
        address: res.data.address
      })
      console.log(res.data.address);
    })
  }

  render() {
   
    return (
      <View>
        
      </View >
    )
  }
}