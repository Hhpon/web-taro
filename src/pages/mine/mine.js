import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { AtIcon, AtBadge } from 'taro-ui'
import { HOST } from '@common/js/config.js'

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
  }

  //生命周期 每当这页显示的时候要去后台请求数据库
  componentDidShow() {
    const openId = Taro.getStorageSync('openid');
    this.setState({
      openId: openId
    })
    Taro.request({
      url: `${HOST}/getUserInfo`,
      data: {
        openId: openId
      }
    }).then(res => {
      this.setState({
        userInfo: res.data
      })
      console.log(res.data);
    })
    Taro.request({
      url: `${HOST}/getOrders`,
      method: 'POST',
      data: {
        openId: this.state.openId
      }
    }).then(res => {
      let pendingPayment = []
      let toBeDelivered = []
      let pendingReceipt = []
      res.data.forEach(element => {
        if (element.status === '待付款') {
          let time = new Date().getTime() - Number(element.out_trade_no.slice(8))
          if (time > 1800000) {
            Taro.request({
              url: `${HOST}/changeOrderStatus`,
              method: 'POST',
              data: {
                out_trade_no: element.out_trade_no,
                status: '已关闭'
              }
            }).then(res => {
              if (res.data[0].status === "已关闭") {
                Taro.request({
                  url: `${HOST}/closeOrder`,
                  method: 'POST',
                  data: {
                    appid: 'wx083cd7624c4db2ec',
                    mch_id: '1513854421',
                    out_trade_no: element.out_trade_no
                  }
                })
              }
            })
          } else {
            pendingPayment.push(element)
          }
        }
        if (element.status === '待发货') {
          toBeDelivered.push(element)
        }
        if (element.status === '待收货') {
          let time = new Date().getTime() - Number(element.out_trade_no.slice(8))
          if (time > 1296000000) {
            Taro.request({
              url: `${HOST}/changeOrderStatus`,
              method: 'POST',
              data: {
                out_trade_no: element.out_trade_no,
                status: '已完成'
              }
            })
          } else {
            pendingReceipt.push(element)
          }
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

  // 联系卖家
  contact() {
    Taro.navigateTo({
      url: '../contact/contact'
    })
  }

  // 我的地址
  myAddress() {
    // 获取收货地址成功
    if (Taro.chooseAddress) {
      let that = this
      Taro.chooseAddress({
        success: function (res) {
          if (res.errMsg === "chooseAddress:ok") {
            console.log('success');
          }
        },
        // 获取收货地址失败
        fail: function (err) {
          // 查看用户授权信息
          Taro.getSetting({
            success(res) {
              // 若收货地址未授权弹出弹窗让用户授权
              if (res.authSetting['scope.address'] === false) {
                // 让用户授权地址
                that.settingAddress()
              }
            }
          })
        }
      })
    } else {
      console.log('当前微信版本不支持chooseAddress');
    }
  }

  // 让用户授权地址
  settingAddress() {
    Taro.showModal({
      title: '是否授权收货地址',
      content: '需要获取您的收货地址，请确认授权',
      success(res) {
        if (res.confirm) {
          // 用户同意授权则调出用户设置页面让用户授权
          Taro.openSetting({
            success(res) {
              if (res.authSetting['scope.address'] === true) {
                Taro.showToast({
                  title: '授权成功!',
                  icon: 'success',
                  duration: 2000
                })
              }
            }
          })
        } else if (res.cancel) {
          // 授权失败
          Taro.showToast({
            title: '授权失败!',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  }

  // 授权信息
  authorization() {
    Taro.openSetting({
      success(res) {
        console.log('success');
      }
    })
  }

  render() {
    let pendingPaymentIndex = this.state.pendingPayment.length;
    let toBeDeliveredIndex = this.state.toBeDelivered.length;
    let pendingReceiptIndex = this.state.pendingReceipt.length;

    let pendingPaymentOrder = null
    let toBeDeliveredOrder = null
    let pendingReceiptOrder = null
    if (pendingPaymentIndex === 0) {
      pendingPaymentOrder =
        <AtIcon prefixClass='icon' value='daifukuan' color='#5FC768' size='24'></AtIcon>
    } else {
      pendingPaymentOrder =
        <AtBadge value={pendingPaymentIndex} maxValue={99}>
          <AtIcon prefixClass='icon' value='daifukuan' color='#5FC768' size='24'></AtIcon>
        </AtBadge>
    }

    if (toBeDeliveredIndex === 0) {
      toBeDeliveredOrder =
        <AtIcon prefixClass='icon' value='daifahuo' color='#5FC768' size='24'></AtIcon>
    } else {
      toBeDeliveredOrder =
        <AtBadge value={toBeDeliveredIndex} maxValue={99}>
          <AtIcon prefixClass='icon' value='daifahuo' color='#5FC768' size='24'></AtIcon>
        </AtBadge>
    }

    if (pendingReceiptIndex === 0) {
      pendingReceiptOrder =
        <AtIcon prefixClass='icon' value='daishouhuo' color='#5FC768' size='24'></AtIcon>
    } else {
      pendingReceiptOrder =
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
                {pendingPaymentOrder}
                <Text>待付款</Text>
              </View>
              <View className='order-icon' onClick={this.toOrderList.bind(this, 3)}>
                {toBeDeliveredOrder}
                <Text>待发货</Text>
              </View>
              <View className='order-icon' onClick={this.toOrderList.bind(this, 4)}>
                {pendingReceiptOrder}
                <Text>待收货</Text>
              </View>
              <View className='order-icon' onClick={this.toOrderList.bind(this, 5)}>
                <AtIcon prefixClass='icon' value='yishouhuo' color='#5FC768' size='24'></AtIcon>
                <Text>已完成</Text>
              </View>
            </View>
          </View>
          <View className='others'>
            <View className='others-top'>
              <Text>其他服务</Text>
            </View>
            <View className='others-bottom'>
              <View className='others-item' onClick={this.myAddress}>
                <AtIcon value='map-pin' size='24' color='#5FC768'></AtIcon>
                <Text>我的地址</Text>
              </View>
              <View className='others-item' onClick={this.contact}>
                <AtIcon value='phone' size='24' color='#5FC768'></AtIcon>
                <Text>联系卖家</Text>
              </View>
              <View className='others-item' onClick={this.authorization}>
                <AtIcon value='user' size='24' color='#5FC768'></AtIcon>
                <Text>授权信息</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    )
  }
}