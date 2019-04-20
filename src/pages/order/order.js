import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import { HOST } from '@common/js/config.js'

import './order.scss'


export default class order extends Component {
  config = {
    navigationBarTitleText: '确认订单'
  }

  constructor() {
    super();
    this.state = {
      openId: '',
      address: {},
      isChooseAddress: false,
      payGoods: [],
      totalPrices: 0,
      out_trade_no: ''
    }
  }

  // 页面刚刚加载出来的时候获取本地内存中的openid
  componentWillMount() {
    const openId = Taro.getStorageSync('openid');
    const payGoods = JSON.parse(this.$router.params.payGoods);
    this.setState({
      openId: openId,
      payGoods: payGoods
    })
  }

  //生命周期 每当这页显示的时候要去后台请求数据库
  componentDidShow() {
    this.counttotalPrices(this.state.payGoods)
  }

  // 页面更新触发的生命周期
  componentDidUpdate() {
  }

  // 算出商品总价
  counttotalPrices(payGoods) {
    let totalPrices = 0;
    payGoods.forEach(element => {
      if (element.goodcheckStatus) {
        totalPrices += element.price * element.shoppingNum
      }
    })
    this.setState({
      totalPrices: (totalPrices).toFixed(2)
    })
  }

  // 选择地址
  toAddress() {
    // 获取收货地址成功
    if (Taro.chooseAddress) {
      let that = this
      Taro.chooseAddress({
        success: function (res) {
          if (res.errMsg === "chooseAddress:ok") {
            let userName = res.userName
            let telNumber = res.telNumber
            let addressDetail = res.provinceName + res.cityName + res.countyName + res.detailInfo
            that.setState({
              address: {
                userName: userName,
                telNumber: telNumber,
                addressDetail: addressDetail
              },
              isChooseAddress: true
            })
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
      content: '需要获取您的收货地址，请确认授权，否则将无法继续购买商品',
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

  // 确认支付？
  checked() {
    // 若没有选择地址
    if (this.state.isChooseAddress === false) {
      Taro.showToast({
        title: '请先选择地址！',
        icon: 'none',
        duration: 2000
      })
    } else {
      // 选择地址后弹出弹窗询问是否确认支付
      let that = this;
      Taro.showModal({
        title: '提示',
        content: '确认支付订单？',
        success: function (res) {
          if (res.confirm) {
            that.toRePay();
          } else if (res.cancel) {
            console.log('cancel');
          }
        }
      })
    }
  }

  // 统一下单、支付
  toRePay() {
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
      url: `${HOST}/toRePay`,
      method: 'POST',
      data: {
        openId: this.state.openId,
        appId: 'wx083cd7624c4db2ec',
        mch_id: '1513854421',
        body: '健康家园-商品',
        out_trade_no: out_trade_no,
        total_fee: this.state.totalPrices * 100,
        spbill_create_ip: '127.0.0.1',
        notify_url: `${HOST}/getWechatMes`,
        trade_type: 'JSAPI'
      }
    }).then(res => {
      const orderMes = JSON.stringify(res.data);
      const prepay_id = orderMes.split('prepay_id')[1].slice(10, -5);

      // 再次签名
      Taro.request({
        url: `${HOST}/signAgain`,
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
                url: `${HOST}/checkOrder`,
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
                url: `${HOST}/checkOrder`,
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

  // 支付失败关闭订单
  payFail() {
    Taro.showToast({
      title: '支付失败！',
      icon: 'success',
      duration: 2000
    })
    this.saveOrder('待付款') //生成待付款订单
  }

  // 生成订单存入数据库
  saveOrder(status) {
    Taro.request({
      url: `${HOST}/addOrder`,
      method: 'POST',
      data: {
        openId: this.state.openId,
        address: this.state.address,
        payGoods: this.state.payGoods,
        out_trade_no: this.state.out_trade_no,
        total_fee: this.state.totalPrices,
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
      url: `${HOST}/changeAmount`,
      method: 'POST',
      data: {
        payGoods: this.state.payGoods
      }
    }).then((res) => {
      console.log(res.data);
    })
  }

  // 删除购物车中该商品
  deleteCartGood() {
    this.state.payGoods.forEach(element => {
      Taro.request({
        url: `${HOST}/deleteUserCart`,
        method: 'POST',
        data: {
          openId: this.state.openId,
          goodsId: element.goodsId
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
    const isChooseAddress = this.state.isChooseAddress
    let addressDetail = null
    if (isChooseAddress === true) {
      addressDetail =
        <View className='mall-address'>
          <View className='address-top'>
            <Text className='text'>{this.state.address.userName}</Text>
            <Text className='text'>{this.state.address.telNumber}</Text>
          </View>
          <View className='address-bottom'>
            <View className='position-icon'>
              <AtIcon value='map-pin' size='20' color='#59BF73'></AtIcon>
            </View>
            <Text>{this.state.address.addressDetail}</Text>
          </View>
        </View>
    } else {
      addressDetail =
        <View className='addAddress'>
          <Button className='btn' onClick={this.toAddress}>选择地址</Button>
        </View>
    }

    const cartDetails = this.state.payGoods.map((goodsDetail) => {
      return (
        <View className='cartDetails' key={goodsDetail.goodsId}>
          <View className='goodDetail'>
            <Image className='good-image' mode='aspectFill' src={goodsDetail.titleUrl}></Image>
            <View className='good-text'>
              <View className='text-top'>
                <View>{goodsDetail.name}</View>
                <View style='font-size: 13px; padding-top: 8px; color: #b7b7b7'>{goodsDetail.subTitle}</View>
              </View>
              <View className='text-bottom'>
                <View>
                  <Text style='color:#FFAC46'>￥{goodsDetail.price}</Text>
                  <Text style='color:#B7B7B7; margin-left: 10px; text-decoration: line-through;'>￥{goodsDetail.oldPrice}</Text>
                </View>
                <View className='edit-button'>
                  <Text style='width:40px;text-align:center;color:#B7B7B7'>
                    x{goodsDetail.shoppingNum}
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
        <View>{addressDetail}</View>
        <View>
          {cartDetails}
        </View>
        <View className='pay-container'>
          <View className='totle-amount'>
            总计：
              <Text className='amount-text'>￥{this.state.totalPrices}</Text>
          </View>
          <View className='pay-button' onClick={this.checked}>结算</View>
        </View>
        <View style='height:50px'></View>
      </View>
    )
  }
}