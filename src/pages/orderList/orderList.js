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
      allList: [],
      pendingPayment: [],
      toBeDelivered: [],
      pendingReceipt: [],
      completed: [],
      currentIndex: 0
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
      console.log(res.data)
      const index = Number(this.$router.params.index)
      let pendingPayment = []
      let toBeDelivered = []
      let pendingReceipt = []
      let completed = []
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
        if (orderItem.status === '已完成') {
          completed.push(orderItem)
        }
      })
      this.setState({
        allList: res.data.reverse(),
        pendingPayment: pendingPayment,
        toBeDelivered: toBeDelivered,
        pendingReceipt: pendingReceipt,
        completed: completed,
        currentIndex: index
      }, (res) => {
        this.changeTab(index)
      })
    })
  }

  // 页面更新触发的生命周期
  componentDidUpdate() {
  }

  // 改变被选中的tab
  changeTab(index, e) {
    if (index === 1) {
      this.setState({
        currentIndex: index,
        orderList: this.state.allList
      })
    }
    if (index === 2) {
      this.setState({
        currentIndex: index,
        orderList: this.state.pendingPayment
      })
    }
    if (index === 3) {
      this.setState({
        currentIndex: index,
        orderList: this.state.toBeDelivered
      })
    }
    if (index === 4) {
      this.setState({
        currentIndex: index,
        orderList: this.state.pendingReceipt
      })
    }
    if (index === 5) {
      this.setState({
        currentIndex: index,
        orderList: this.state.completed
      })
    }
  }

  // 跳转至订单详情
  toOrderDetail(out_trade_no, e) {
    Taro.navigateTo({
      url: '../orderDetail/orderDetail?out_trade_no=' + out_trade_no
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
        <View className='orders' onClick={this.toOrderDetail.bind(this, order.out_trade_no)}>
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