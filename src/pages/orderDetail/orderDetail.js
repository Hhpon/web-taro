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
      status: '',
      payBtn: false,
      refundBtn: false,
      refund: false
    }
  }

  // 页面刚刚加载出来的时候获取本地内存中的openid
  componentWillMount() {
    const openId = Taro.getStorageSync('openid')
    const out_trade_no = this.$router.params.out_trade_no
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
        order: res.data[0],
        status: res.data[0].status
      }, (res) => {
        this.orderStatus()
      })
    })
  }

  // 页面更新触发的生命周期
  componentDidUpdate() {
  }

  // 判断订单是否需要付款按钮
  orderStatus() {
    const status = this.state.status
    if (status === '待付款') {
      this.setState({
        payBtn: true,
        refundBtn: false
      })
    }
    if (status === '待发货' || status === '待收货') {
      this.setState({
        payBtn: false,
        refundBtn: true
      })
    }
    if (status === '退款成功') {
      this.setState({
        refund: true
      })
    }
  }

  // 返回首页
  backIndex() {
    Taro.switchTab({
      url: '../index/index'
    })
  }

  // 取消支付
  cancelPay() {
    let that = this
    Taro.showModal({
      title: '取消支付',
      content: '好不容易挑选出来，确定要取消支付吗？',
      success: function (res) {
        if (res.confirm) {
          Taro.request({
            url: 'http://127.0.0.1:7001/changeOrderStatus',
            method: 'POST',
            data: {
              out_trade_no: that.state.out_trade_no,
              status: '已关闭'  //关闭订单
            }
          }).then(res => {
            if (res.data[0].status === "已关闭") {
              Taro.showToast({
                title: '操作成功！',
                icon: 'success',
                duration: 2000
              })
              Taro.redirectTo({
                url: '../orderList/orderList?index=' + 1
              })
            }
          })
        }
      }
    })
  }

  // 立即支付
  pay() {
    // 删除原订单
    Taro.request({
      url: 'http://127.0.0.1:7001/deleteOrder',
      method: 'POST',
      data: {
        out_trade_no: this.state.out_trade_no
      }
    }).then(res => {
      if (res.data === '删除订单成功！') {
        // 重新下单支付
        // 根据下单时间设置商户订单号
        let myDate = new Date()
        let year = myDate.getFullYear().toString()
        let month = ((myDate.getMonth() + 1).toString().length === 1) ? '0' + (myDate.getMonth() + 1).toString() : (myDate.getMonth() + 1).toString()
        let date = (myDate.getDate().toString().length === 1) ? '0' + myDate.getDate().toString() : myDate.getDate().toString()
        let time = myDate.getTime().toString()
        let out_trade_no = year + month + date + time

        this.setState({
          out_trade_no: out_trade_no
        })

        // 统一下单返回预支付信息
        Taro.request({
          url: 'http://127.0.0.1:7001/toRePay',
          method: 'POST',
          data: {
            openId: this.state.openId,
            appId: 'wx083cd7624c4db2ec',
            mch_id: '1513854421',
            body: '健康家园-商品',
            out_trade_no: out_trade_no,
            total_fee: this.state.order.total_fee * 100,
            spbill_create_ip: '127.0.0.1',
            notify_url: 'https://home.hhp.im/getWechatMes',
            trade_type: 'JSAPI'
          }
        }).then(res => {
          const orderMes = JSON.stringify(res.data);
          const prepay_id = orderMes.split('prepay_id')[1].slice(10, -5);

          // 再次签名
          Taro.request({
            url: 'http://127.0.0.1:7001/signAgain',
            method: 'POST',
            data: {
              prepay_id: prepay_id,
              appId: 'wx083cd7624c4db2ec',
              timeStamp: new Date().getTime().toString(),
              signType: 'MD5'
            }
          }).then(result => {
            // 发起支付
            let that = this;
            Taro.requestPayment({
              timeStamp: result.data.timeStamp,
              nonceStr: result.data.nonceStr,
              package: 'prepay_id=' + result.data.prepay_id,
              signType: 'MD5',
              paySign: result.data.paySign,
              // 支付成功
              success: function (res) {
                if (res.errMsg === 'requestPayment:ok') {
                  that.saveOrder('待发货'); //生成待发货订单
                  that.changeAmount(); //改变库存
                } else {
                  // 其他情况先查询订单是否支付成功
                  Taro.request({
                    url: 'http://127.0.0.1:7001/checkOrder',
                    method: 'POST',
                    data: {
                      appid: 'wx083cd7624c4db2ec',
                      mch_id: '1513854421',
                      out_trade_no: that.state.out_trade_no
                    }
                  }).then(res => {
                    let trade_state = res.data.split("trade_state")[1].slice(10, -5)
                    if (trade_state === "SUCCESS") {
                      that.saveOrder('待发货'); //生成待发货订单
                      that.changeAmount(); //改变库存
                    } else {
                      Taro.showToast({
                        title: '出错啦！',
                        icon: 'none',
                        duration: 2000
                      })
                    }
                  })
                }
              },
              // 支付失败
              fail: function (res) {
                if (res.errMsg === 'requestPayment:fail cancel') {
                  that.payFail()
                } else {
                  // 其他失败情况先查询订单是否未支付
                  Taro.request({
                    url: 'http://127.0.0.1:7001/checkOrder',
                    method: 'POST',
                    data: {
                      appid: 'wx083cd7624c4db2ec',
                      mch_id: '1513854421',
                      out_trade_no: that.state.out_trade_no
                    }
                  }).then(res => {
                    let trade_state = res.data.split("trade_state")[1].slice(10, -5)
                    if (trade_state === "NOTPAY") {
                      that.payFail()
                    } else {
                      Taro.showToast({
                        title: '出错啦！',
                        icon: 'none',
                        duration: 2000
                      })
                    }
                  })
                }
              },
              complete: function (res) {
                console.log(res);
              }
            })
          })
        })
      }
    })
  }

  // 支付失败关闭订单
  payFail() {
    Taro.showToast({
      title: '支付失败！',
      icon: 'success',
      duration: 2000
    })
    this.saveOrder('待付款') //生成待付款订单
    let that = this
    setTimeout(function () {
      Taro.request({
        url: 'http://127.0.0.1:7001/changeOrderStatus',
        method: 'POST',
        data: {
          out_trade_no: that.state.out_trade_no,
          status: '已关闭'
        }
      }).then(res => {
        if (res.data[0].status === "已关闭") {
          Taro.request({
            url: 'http://127.0.0.1:7001/closeOrder',
            method: 'POST',
            data: {
              appid: 'wx083cd7624c4db2ec',
              mch_id: '1513854421',
              out_trade_no: that.state.out_trade_no
            }
          })
        }
      })
    }, 1800000)
  }

  // 是否申请退款
  toRefund() {
    let that = this
    Taro.showModal({
      title: '申请退款',
      content: '好不容易挑选出来的商品，是否确认申请退款？',
      success: function (res) {
        if (res.confirm) {
          Taro.request({
            url: 'http://127.0.0.1:7001/changeOrderStatus',
            method: 'POST',
            data: {
              out_trade_no: that.state.out_trade_no,
              status: '退款中'
            }
          }).then(res => {
            if (res.data[0].status === "退款中") {
              Taro.showToast({
                title: '操作成功！',
                icon: 'success',
                duration: 2000
              })
              that.toOrderDetail()
            }
          })
        }
      }
    })
  }

  // 确认收货
  confirmReceipt() {
    let that = this
    Taro.showModal({
      title: '确认收货',
      content: '确认收货后不可进行退款退货，是否确认收货？',
      success: function (res) {
        if (res.confirm) {
          Taro.request({
            url: 'http://127.0.0.1:7001/changeOrderStatus',
            method: 'POST',
            data: {
              out_trade_no: that.state.out_trade_no,
              status: '已完成'  //完成订单
            }
          }).then(res => {
            if (res.data[0].status === "已完成") {
              Taro.showToast({
                title: '操作成功！',
                icon: 'success',
                duration: 2000
              })
              Taro.redirectTo({
                url: '../orderList/orderList?index=' + 1
              })
            }
          })
        }
      }
    })
  }

  // 生成订单存入数据库
  saveOrder(status) {
    Taro.request({
      url: 'http://127.0.0.1:7001/addOrder',
      method: 'POST',
      data: {
        openId: this.state.openId,
        address: this.state.order.address,
        payGoods: this.state.order.payGoods,
        out_trade_no: this.state.out_trade_no,
        total_fee: this.state.order.total_fee,
        status: status
      }
    }).then(res => {
      if (res.data === '生成订单成功！') {
        this.toOrderDetail();
        this.deleteCartGood();
      } else {
        console.log(res.data);
      }
    })
  }

  // 改变库存数量
  changeAmount() {
    Taro.request({
      url: 'http://127.0.0.1:7001/changeAmount',
      method: 'POST',
      data: {
        payGoods: this.state.order.payGoods
      }
    }).then((res) => {
      console.log(res.data);
    })
  }

  // 删除购物车中该商品
  deleteCartGood() {
    this.state.order.payGoods.map((goodsDetail) => {
      Taro.request({
        url: 'http://127.0.0.1:7001/deleteUserCart',
        method: 'POST',
        data: {
          openId: this.state.openId,
          goodsId: goodsDetail.goodsId
        }
      }).then(res => {
        console.log(res.data);
      })
    })
  }

  // 跳转至订单详情
  toOrderDetail() {
    Taro.redirectTo({
      url: '../orderDetail/orderDetail?out_trade_no=' + this.state.out_trade_no
    })
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
                <View style='font-size:13px;padding-top:8px;color:#b7b7b7'>{goodDetail.subTitle}</View>
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

    const payBtn = this.state.payBtn
    const refundBtn = this.state.refundBtn
    const Btns = null
    if (payBtn === true) {
      Btns =
        <View className='btns'>
          <Button className='cancelPayBtn' onClick={this.cancelPay}>取消支付</Button>
          <Button className='payBtn' onClick={this.pay}>立即支付</Button>
        </View>
    }
    if (refundBtn === true) {
      Btns =
        <View className='btns'>
          <Button className='cancelPayBtn' openType='contact'>联系卖家</Button>
          <Button className='cancelPayBtn' onClick={this.toRefund}>申请退款</Button>
          <Button className='payBtn' onClick={this.confirmReceipt}>确认收货</Button>
        </View>
    }

    const refundMsg = null
    const refund = this.state.refund
    if (refund === true) {
      refundMsg =
        <View style='color:#b7b7b7;margin-bottom:10px;font-size:13px;'>（退款1-3个工作日内退还，逾期未退还请及时联系卖家）</View>
    }

    return (
      <View>
        <View className='top'>
          <View style='color:#63BA74;margin-bottom:10px;'>订单状态： {this.state.status}</View>
          {refundMsg}
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
          <View className='box1'>
            <View className='item'>
              <Text>下单时间：</Text>
              <Text>{this.state.out_trade_no.slice(0, 4)}-{this.state.out_trade_no.slice(4, 6)}-{this.state.out_trade_no.slice(6, 8)}</Text>
            </View>
            <View className='item'>
              <Text>实付金额：</Text>
              <Text style='color:#ff0a0a;'>￥{order.total_fee}</Text>
            </View>
          </View>
          <View>{Btns}</View>
        </View>
        <View>
          <Button className='backBtn' onClick={this.backIndex}>回首页逛逛</Button>
        </View>
        <View style='height:50px'></View>
      </View >
    )
  }
}