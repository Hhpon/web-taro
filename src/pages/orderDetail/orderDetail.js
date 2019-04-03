import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button } from '@tarojs/components'
import { AtIcon, AtButton } from 'taro-ui'

import './orderDetail.scss'


export default class orderDetail extends Component {
  config = {
    navigationBarTitleText: '订单详情'
  }

  constructor() {
    super();
    this.state = {
      openId: '',
      out_trade_no: '',
      order: {},
      status: ''
    }
  }

  // 页面刚刚加载出来的时候获取本地内存中的openid
  componentWillMount() {
    const openId = Taro.getStorageSync('openid')
    // const out_trade_no = this.$router.params.out_trade_no
    const out_trade_no = '201904031554277508665'
    this.setState({
      openId: openId,
      out_trade_no: out_trade_no
    })
  }

  //生命周期 每当这页显示的时候要去后台请求数据库
  componentDidShow() {
    Taro.request({
      url: 'http://127.0.0.1:7001/getOrderDetail',
      method: 'POST',
      data: {
        out_trade_no: this.state.out_trade_no
      }
    }).then(res => {
      console.log(res.data[0]);
      this.setState({
        order: res.data[0]
      }, (res) => {
        this.orderStatus()
      })
    })
  }

  // 页面更新触发的生命周期
  componentDidUpdate() {
  }

  // 判断订单状态
  orderStatus() {
    const status = this.state.order.status
    if (status === 'pendingPayment') {
      this.setState({
        status: '待付款'
      })
    } else if (status === 'toBedelivered') {
      this.setState({
        status: '待发货'
      })
    } else if (status === 'pendingReceipt') {
      this.setState({
        status: '待收货'
      })
    } else if (status === 'completed') {
      this.setState({
        status: '已完成'
      })
    } else if (status === 'closed') {
      this.setState({
        status: '已关闭'
      })
    } else if (status === 'refunding') {
      this.setState({
        status: '退款中'
      })
    }
  }

  render() {
    const order = this.state.order

    const goodDetails = order.payGoods.map((goodDetail) => {
      return (
        <View className='cartDetails'>
          <View className='goodDetail'>
            <Image className='good-image' mode='aspectFill' src={goodDetail.titleUrl}></Image>
            <View className='good-text'>
              <View className='text-top'>
                <View>{goodDetail.name}</View>
                <View style='font-size: 13px; padding-top: 8px; color: #b7b7b7'>{goodDetail.subTitle}</View>
              </View>
              <View className='text-bottom'>
                <View>
                  <Text>￥{goodDetail.price}</Text>
                </View>
                <View className='edit-button'>
                  <Text style='width:40px;text-align:center;'>
                    x{goodDetail.shoppingNum}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )
    })

    return (
      <View>
        <View className='top'>
          <View style='color:#63BA74;margin-bottom:10px;'>订单状态： {this.state.status}</View>
          <View>订单号： {this.state.out_trade_no}</View>
        </View>
        <View className='top'>
          <View>收货人： {order.address.userName}</View>
          <View style='margin:10px 0;'>联系方式： {order.address.telNumber}</View>
          <View>收货地址： {order.address.addressDetail}</View>
        </View>
        <View className='bottom'>
          <View>
            {goodDetails}
          </View>
          <View className='box'>
            <View className='item'>
              <Text>商品总额：</Text>
              <Text>￥{order.total_fee}</Text>
            </View>
          </View>
          <View className='box'>
            <View className='item'>
              <Text>下单时间：</Text>
              <Text>2019-04-02</Text>
            </View>
            <View className='item'>
              <Text>实付金额：</Text>
              <Text style='color:#ff0a0a;'>￥{order.total_fee}</Text>
            </View>
          </View>
          <View className='btns'>
            <Button className='cancelPayBtn'>取消支付</Button>
            <Button className='payBtn'>立即支付</Button>
          </View>
        </View>
        <View>
          <Button className='backBtn'>回首页逛逛</Button>
        </View>
      </View>
    )
  }
}