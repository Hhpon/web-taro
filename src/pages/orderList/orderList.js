import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button } from '@tarojs/components'

import './orderList.scss'


export default class orderList extends Component {
  config = {
    navigationBarTitleText: '商品订单'
  }

  constructor() {
    super();
    this.state = {
      openId: '',
      orderList: [],
      currentIndex: 1
    }
  }

  // 页面刚刚加载出来的时候获取本地内存中的openid
  componentWillMount() {
    const openId = Taro.getStorageSync('openid')
    this.setState({
      openId: openId
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
      this.setState({
        orderList: res.data
      })
    })
  }

  // 页面更新触发的生命周期
  componentDidUpdate() {
  }

  showOrder() {
    if (this.state.currentIndex === 1) {
      
    }
  }

  // 改变被选中的tab
  changeTab(index, e) {
    this.setState({
      currentIndex: index
    })
  }

  render() {
    const tabList = [{ index: 1, text: '全部' }, { index: 2, text: '待付款' }, { index: 3, text: '待发货' }, { index: 4, text: '待收货' }, { index: 5, text: '已完成' }]

    const tabs = tabList.map((tabItem) => {
      return (
        <Text className={`tabsItem ${tabItem.index === this.state.currentIndex ? 'tabsItemActive' : null}`} onClick={this.changeTab.bind(this, tabItem.index)}>{tabItem.text}</Text>
      )
    })

    return (
      <View>
        <View className='tabs'>
          {tabs}
        </View>
      </View>
    )
  }
}