import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import nullshop from '../../asset/images/nullshop.png'

import './shopcart.scss'


export default class shopcart extends Component {
  config = {
    navigationBarTitleText: '购物车'
  }

  constructor() {
    super();
    this.state = {
      checkColor: '#e4e4e4',
      openId: '',
      cart: [],
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
      url: 'https://home.hhp.im/getUserInfo',
      data: {
        openId: this.state.openId
      }
    }).then(res => {
      console.log(res.data);
      this.setState({
        cart: res.data.cart
      })
      if (res.data.cart.length === 0) {
        console.log('Kong');
      }
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
        checkColor: '#e4e4e4'
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
    if (this.state.checkColor === '#61BA76') {
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
      url: 'https://home.hhp.im/editUserCart',
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
              url: 'https://home.hhp.im/deleteUserCart',
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
        url: 'https://home.hhp.im/editUserCart',
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

  // 跳转至确认订单
  toOrder() {
    let payGoods = [];
    this.state.cart.map((goodsDetail) => {
      if (goodsDetail.goodcheckStatus) {
        payGoods.push(goodsDetail)
      }
    })
    if (payGoods.length === 0) {
      Taro.showToast({
        title: '请选择商品！',
        icon: 'none',
        duration: 2000
      })
    } else {
      Taro.navigateTo({
        url: '../order/order?payGoods=' + JSON.stringify(payGoods)
      })
    }
  }

  render() {
    const cart = this.state.cart
    const nullCart = null
    if (cart.length === 0) {
      nullCart =
        <View className='nullCart'>
          <Image src={nullshop} style='width:70px;height:70px;'></Image>
          <View className='nullCartText'>购物车空空如也~</View>
        </View>
    }

    const cartDetails = this.state.cart.map((goodsDetail) => {
      return (
        <View className='cartDetails'>
          <View onClick={this.goodcheckHandle} data-index='{{index}}'>
            <AtIcon value='check-circle' size='20' color={goodsDetail.goodcheckStatus ? '#61BA76' : '#e4e4e4'}></AtIcon>
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

    return (
      <View className='container'>
        {nullCart}
        <View className='shopping-goods'>
          {/* <View className='check'>
            <AtIcon value='check-circle' size='20' color='#62BB73'></AtIcon>
            <Text className='check-text'>次日到达</Text>
          </View> */}
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
            <View className='pay-button' onClick={this.toOrder}>结算</View>
          </View>
        </View>
        <View style='height:50px'></View>
      </View>
    )
  }
}