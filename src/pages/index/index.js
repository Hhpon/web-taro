import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Swiper, Navigator } from '@tarojs/components'

import './index.scss'

export default class Index extends Component {
  config = {
    navigationBarTitleText: '全家享'
  }

  constructor() {
    super();
    this.state = {
      navName: ['热卖', '水果', '生鲜', '速食', '日百', '生活服务'],
      navNum: 0,
      sliderGoods: [],
      Goods: [],
      imgheights: 0,
      imgUrls: [],
      isUserOpened: false,
      openId: '',
    }
  }

  //生命周期 - 页面加载过程中请求商品title以及对新用户进行授权处理
  componentWillMount() {
    this.getGoods(0);
    Taro.getSetting({
      success: (res) => {
        const userInfo = res.authSetting['scope.userInfo'];
        if (!userInfo) {
          console.log('未授权');
          this.setState({
            isUserOpened: true
          })
        } else {
          console.log('已授权');
          const openId = Taro.getStorageSync('openid');
          this.setState({
            openId: openId
          })
        }
      }
    })
  }

  componentDidMount() { }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  // 定义导航栏的点击事件
  navActive(event) {
    const index = event.currentTarget.dataset.index;
    this.setState({
      navNum: index
    })
    this.getGoods(index);
  }

  // 跳转到商品详情页
  goodsActive(event) {
    const goodId = event.currentTarget.dataset.goodid;
    Taro.navigateTo({
      url: '../goodsDetails/goodsDetails?goodid=' + goodId
    })
  }

  // 上传类目请求数据
  getGoods(index) {
    this.state.sliderGoods = [];
    this.state.Goods = [];
    Taro.request({
      url: 'http://localhost:7001/getGoods',
      method: 'POST',
      data: {
        index: index
      }
    }).then(res => {

      const data = res.data.reverse(); // 把返回的数组调换顺序

      const sliderGoods = [];
      data.forEach(element => {
        if (element.sliderView) {
          const num = sliderGoods.length;
          if (num < 3) {
            sliderGoods.push(element);
          }
        } else {
          this.state.Goods.push(element);
        }
      });
      this.setState({
        sliderGoods: sliderGoods
      })
    })
  }

  // 小程序图片的宽度处理
  imageLoad(e) {
    var imgwidth = e.detail.width, imgheight = e.detail.height, ratio = imgwidth / imgheight;
    //计算的高度值
    var sysInfoWidth = Taro.getSystemInfoSync().windowWidth;
    var imgheights = sysInfoWidth / ratio;
    this.setState({
      imgheights: imgheights,
    });
  }

  // 授权后获取用户信息
  getUserinfo(e) {
    console.log(e.detail)
    const userInfo = e.detail.userInfo;
    const that = this;
    if (e.detail.errMsg === 'getUserInfo:ok') {
      this.setState({
        isUserOpened: false
      })
      Taro.login({
        success(res) {
          Taro.request({
            url: 'http://localhost:7001/onLogin',
            method: 'POST',
            data: {
              code: res.code,
              userInfo: userInfo
            }
          }).then(res => {
            console.log(res);
            that.setState({
              openId: res.data
            })
            Taro.setStorage({ key: 'openid', data: res.data }).then(res => {
              console.log('存储成功');
            })
          })
        }
      })
    }
  }

  handleConfirm() {
    console.log('确认按钮')
  }

  shopButton(e) {
    let goodDetail = e.currentTarget.dataset.gooddetail;
    let openId = this.state.openId;
    Taro.request({
      url: 'http://localhost:7001/shoppingCart',
      method: 'POST',
      data: {
        goodDetail: goodDetail,
        openId: openId
      },
      success(res) {
        console.log(res);
        if (res.data === 100) {
          Taro.showToast({
            title: '商品已经添加！',
            icon: 'success',
            duration: 1000
          })
        } else {
          Taro.showToast({
            title: '添加成功！',
            icon: 'success',
            duration: 1000
          })
        }
      },
      fail(res) {
        Taro.showToast({
          title: '请稍后重试！',
          icon: 'none',
          duration: 1000
        })
      }
    })
  }

  render() {
    const isUserOpened = this.state.isUserOpened;
    const isToastOpened = this.state.isToastOpened;
    const navHeader = this.state.navName.map((nav) => {
      return (
        <View className="{{index === navNum?'hover-nav':'nav'}}" onClick={this.navActive} data-index='{{index}}'>{nav}</View>
      )
    })

    const imgList = this.state.sliderGoods.map((sliderGood) => {
      return (
        <Swiper-item>
          <Image mode='widthFix' onClick={this.goodsActive} data-goodid='{{sliderGood.goodsId}}' onLoad={this.imageLoad} className='image' src={sliderGood.sliderUrl} />
        </Swiper-item>
      )
    })

    const goodsDebli = this.state.Goods.map((good) => {
      return (
        <View>
          <Image mode='widthFix' style='width:100%' src={good.titleUrl}></Image>
          <View className='goods-container'>
            <View className='goods-title'>{good.name}</View>
            <View className='goods-button' data-goodDetail={good} onClick={this.shopButton}>去抢购</View>
          </View>
          <View className='price-container'>
            <View className='goods-price'>{good.price}</View>
          </View>
        </View>
      )
    })

    return (
      <View className='container'>
        <View className='nav-container'>
          {navHeader}
        </View>

        <AtTabBar
          tabList={[
            { title: '待办事项', text: 8 },
            { title: '拍照' },
            { title: '通讯录', dot: true }
          ]}
        />

        <View style='height:43px;'></View>
        <Swiper autoplay indicator-dots circular className='swiper' style='height:{{imgheights}}px'>
          {imgList}
        </Swiper>
        <View style='height:5px'></View>
        <View>
          {goodsDebli}
        </View>

        {
          isUserOpened &&
          <View className='getUserinfo-button'>
            <Button type='prime' open-type='getUserInfo' onGetUserInfo={this.getUserinfo}>授权</Button>
          </View>
        }

      </View>
    )
  }
}