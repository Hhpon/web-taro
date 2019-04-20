import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { AtIcon, AtBadge } from 'taro-ui'
import { HOST } from '@common/js/config.js'
import avatar from '../../asset/images/avatar.jpg'

import './contact.scss'

export default class contact extends Component {
  config = {
    navigationBarTitleText: '联系卖家'
  }

  constructor() {
    super();
    this.state = {
    }
  }

  componentWillMount() {
  }

  //生命周期 每当这页显示的时候要去后台请求数据库
  componentDidShow() {
  }

  render() {
    return (
      <View>
        <View className='image-container'>
          <View style='height:10px;'></View>
          <View className='avatar-con'>
            <View className='avatar'>
              <Image src={avatar} style='width:90px;height:90px;'></Image>
            </View>
          </View>
          <View className='name-con'>姓名：杨鹏</View>
          <View className='name-con'>微信号：pengpeng828549</View>
          <View className='name-con'>联系电话：18163627106</View>
        </View>
      </View>
    )
  }
}