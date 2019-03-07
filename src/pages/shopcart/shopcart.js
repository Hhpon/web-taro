import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button } from '@tarojs/components'
import { AtIcon } from 'taro-ui'

import './shopcart.scss'


export default class shopcart extends Component {
  config = {
    navigationBarTitleText: '购物车'
  }

  constructor() {
    super();
    this.state = {
      checkColor: '',
      openId: '',
      cart: [],
      address: {},
      isChooseAddress: false,
      totalPrices: 0
    }
  }

  // 页面刚刚加载出来的时候获取本地内存中的openid
  componentWillMount() {
    const openId = Taro.getStorageSync('openid');
    this.setState({
      openId: openId
    })
  }

  //生命周期 每当这页显示的时候要去后台请求数据库
  componentDidShow() {
    Taro.request({
      url: 'http://127.0.0.1:7001/getUserInfo',
      data: {
        openId: this.state.openId
      }
    }).then(res => {
      console.log(res.data);
      this.setState({
        cart: res.data.cart
      })
      this.ischeckColor(res.data.cart);
      this.counttotalPrices(res.data.cart);
    })
  }

  // 页面更新触发的生命周期
  componentDidUpdate() {
    let cart = this.state.cart;

    // this.ischeckColor(cart);
    // this.counttotalPrices(cart);
  }

  // 判断全选按钮状态
  ischeckColor(cart) {
    let statusNum = 0;
    cart.map((goodsDetail) => {
      if (goodsDetail.goodcheckStatus) {
        statusNum += 1;
      }
    })
    if (statusNum === cart.length) {
      console.log('1');
      this.setState({
        checkColor: '#61BA76'
      })
    } else {
      console.log('no');
      this.setState({
        checkColor: ''
      });
    }
  }

  // 算出购物车内商品价格
  counttotalPrices(cart) {
    let totalPrices = 0;
    cart.map((goodsDetail) => {
      if (goodsDetail.goodcheckStatus) {
        totalPrices += goodsDetail.price * goodsDetail.shoppingNum;
      }
    })
    this.setState({
      totalPrices: totalPrices
    })
  }

  //点击选择商品的对号
  goodcheckHandle(e) {
    const index = e.currentTarget.dataset.index;
    let cart = this.state.cart[index];
    if (cart.goodcheckStatus) {
      cart.goodcheckStatus = false;
      this.setState({
        cart: this.state.cart
      }, () => {
        let cart = this.state.cart;

        this.ischeckColor(cart);
        this.counttotalPrices(cart);
      })
    } else {
      cart.goodcheckStatus = true;
      this.setState({
        cart: this.state.cart,
      }, () => {
        let cart = this.state.cart;

        this.ischeckColor(cart);
        this.counttotalPrices(cart);
      })
    }
  }

  //点击全选的方法
  checkallHandle() {
    if (this.state.checkColor) {
      this.state.cart.map((goodsDetail) => {
        goodsDetail.goodcheckStatus = false;
      })
      this.setState({
        cart: this.state.cart
      }, () => {
        let cart = this.state.cart;

        this.ischeckColor(cart);
        this.counttotalPrices(cart);
      })
    } else {
      this.state.cart.map((goodsDetail) => {
        goodsDetail.goodcheckStatus = true;
      })
      this.setState({
        cart: this.state.cart
      }, () => {
        let cart = this.state.cart;

        this.ischeckColor(cart);
        this.counttotalPrices(cart);
      })
    }
  }

  //增加商品购买数量
  addHandle(e) {
    const index = e.currentTarget.dataset.index;
    let cart = this.state.cart[index];
    let openId = this.state.openId;
    let goodsId = cart.goodsId;
    cart.shoppingNum += 1;

    if (!cart.goodcheckStatus) {
      cart.goodcheckStatus = true;
      this.setState({
        cart: this.state.cart
      }, () => {
        let cart = this.state.cart;

        this.ischeckColor(cart);
        this.counttotalPrices(cart);
      })
    } else {
      let cart = this.state.cart;

      this.counttotalPrices(cart);
    }

    // 把更改的数据上传到数据库
    Taro.request({
      url: 'http://127.0.0.1:7001/editUserCart',
      method: 'POST',
      data: {
        kindof: 'add',
        openId: openId,
        goodsId: goodsId
      },
      success(res) {
        console.log(res);
      }
    })
  }

  //减少商品购买数量
  subtractHandle(e) {
    const index = e.currentTarget.dataset.index;
    let cart = this.state.cart[index];
    let openId = this.state.openId;
    let goodsId = cart.goodsId;
    if (cart.shoppingNum > 0) {
      cart.shoppingNum -= 1;
    }

    let that = this;

    if (cart.shoppingNum === 0) {
      Taro.showModal({
        title: '提示',
        content: '确定从购物车删除该商品？',
        success: function (res) {
          if (res.confirm) {
            Taro.request({
              url: 'http://127.0.0.1:7001/deleteUserCart',
              method: 'POST',
              data: {
                openId: openId,
                goodsId: goodsId
              }
            }).then(res => {
              that.setState({
                cart: res.data
              }, () => {
                console.log(that.state.cart);
                let cart = that.state.cart;

                that.ischeckColor(cart);
                that.counttotalPrices(cart);
              })
            })
          } else if (res.cancel) {
            cart.shoppingNum = 1;
            this.setState({
              cart: this.state.cart
            }, () => {
              let cart = this.state.cart;

              this.ischeckColor(cart);
              this.counttotalPrices(cart);
            })
          }
        }
      })
    } else {
      if (!cart.goodcheckStatus) {
        cart.goodcheckStatus = true;
        this.setState({
          cart: this.state.cart
        }, () => {
          let cart = this.state.cart;

          this.ischeckColor(cart);
          this.counttotalPrices(cart);
        })
      } else {
        this.setState({
          cart: this.state.cart
        }, () => {
          let cart = this.state.cart;

          this.ischeckColor(cart);
          this.counttotalPrices(cart);
        })
      }
      Taro.request({
        url: 'http://127.0.0.1:7001/editUserCart',
        method: 'POST',
        data: {
          kindof: 'subtract',
          openId: openId,
          goodsId: goodsId
        },
        success(res) {
          console.log(res);
        }
      })
    }
  }

  // 选择地址
  toAddress() {
    if (Taro.chooseAddress) {
      let that = this
      Taro.chooseAddress({
        success: function (res) {
          console.log(JSON.stringify(res))
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
        fail: function (err) {
          console.log(JSON.stringify(err))
        }
      })
    } else {
      console.log('当前微信版本不支持chooseAddress');
    }
  }


  // 结算
  toPay() {
    // 根据下单时间设置商户订单号
    let myDate = new Date()
    let year = myDate.getFullYear().toString()
    let month = ((myDate.getMonth() + 1).toString().length === 1) ? '0' + (myDate.getMonth() + 1).toString() : (myDate.getMonth() + 1).toString()
    let date = (myDate.getDate().toString().length === 1) ? '0' + myDate.getDate().toString() : myDate.getDate().toString()
    let time = myDate.getTime().toString()
    let out_trade_no = year + month + date + time
    
    Taro.request({
      url: 'http://127.0.0.1:7001/toPay',
      method: 'POST',
      data: {
        openId: this.state.openId,
        appId: 'wx083cd7624c4db2ec',
        mch_id: '1513854421',
        body: '健康家园-商品',
        out_trade_no: out_trade_no,
        total_fee: this.state.totalPrices * 100,
        spbill_create_ip: '127.0.0.1',
        notify_url: 'https://home.hhp.im/getWechatMes',
        trade_type: 'JSAPI'
      }
    }).then(res => {
      console.log(res);
    })
  }


  render() {

    const cartDetails = this.state.cart.map((goodsDetail) => {
      return (
        <View className='cartDetails'>
          <View onClick={this.goodcheckHandle} data-index='{{index}}'>
            <AtIcon value='check-circle' size='20' color={goodsDetail.goodcheckStatus ? '#61BA76' : ''}></AtIcon>
          </View>
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
                  <View onClick={this.subtractHandle} data-index='{{index}}'>
                    <AtIcon value='subtract-circle' color='#E3E3E3'></AtIcon>
                  </View>
                  <Text style='width:40px;text-align:center;color:#FFAC46'>
                    {goodsDetail.shoppingNum}
                  </Text>
                  <View onClick={this.addHandle} data-index='{{index}}'>
                    <AtIcon value='add-circle' color='#E3E3E3'></AtIcon>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      )
    })

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


    return (
      <View className='container'>
        <View>
          {addressDetail}
        </View>
        <View className='shopping-goods'>
          <View className='check'>
            <AtIcon value='check-circle' size='20' color='#62BB73'></AtIcon>
            <Text className='check-text'>次日到达</Text>
          </View>
          <View>
            {cartDetails}
          </View>
        </View>
        <View className='pay-container'>
          <View className='check-all' onClick={this.checkallHandle}>
            <AtIcon value='check-circle' color={this.state.checkColor} className='icon-class'></AtIcon>
            <Text className='all-text'>全选</Text>
          </View>
          <View className='pay-handle'>
            <View className='totle-amount'>
              总计:
              <Text className='amount-text'>￥{this.state.totalPrices}</Text>
            </View>
            <View className='pay-button' onClick={this.toPay}>结算</View>
          </View>
        </View>
        <View style='height:50px'></View>
      </View>
    )
  }
}