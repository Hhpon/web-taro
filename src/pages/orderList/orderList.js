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
      console.log(res.data);
      this.setState({
        orderList: res.data.reverse()
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


    const orderList = this.state.orderList
    const orders = orderList.map((order) => {
      return (
        <View className='orders'>
          <View className='orderTop'>
            <View className='orderNum'>订单号：{order.out_trade_no}</View>
            <View className='orderStatus'>{order.status}</View>
          </View>
          <View>
            {order.payGoods.map((orderItem) => {
              return (
                <View className='cartDetails'>
                  <View className='goodDetail'>
                    <Image className='good-image' mode='aspectFill' src={orderItem.titleUrl}></Image>
                    <View className='good-text'>
                      <View className='text-top'>
                        <View>{orderItem.name}</View>
                        <View style='font-size: 13px; padding-top: 8px; color: #b7b7b7'>{orderItem.subTitle}</View>
                      </View>
                      <View className='text-bottom'>
                        <View>
                          <Text>￥{orderItem.price}</Text>
                        </View>
                        <View className='edit-button'>
                          <Text style='width:40px;text-align:center;'>
                            x{orderItem.shoppingNum}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
          <View className='orderPrice'>
            <Text>总价：</Text>
            <Text style='color:#fd2844;'>￥{order.total_fee}</Text>            
          </View>
        </View>
      )
    })

    return (
      <View>
        <View className='tabs'>
          {tabs}
        </View>
        <View>
          {orders}
        </View>
      </View>
    )
  }
}