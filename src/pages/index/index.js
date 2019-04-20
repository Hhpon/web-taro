import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Swiper } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import { HOST } from '@common/js/config.js'

import './index.scss'

export default class Index extends Component {
  config = {
    navigationBarTitleText: '健康家园'
  }

  constructor() {
    super();
    this.state = {
      currentIndex: "0",
      sliderGoods: [],
      Goods: [],
      imgheights: 0,
      imgUrls: [],
      isUserOpened: false,
      openId: ''
    }
  }

  //生命周期 - 页面加载过程中请求商品title以及对新用户进行授权处理
  componentWillMount() {
    this.getGoods(this.state.currentIndex);
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
  navActive(index, e) {
    console.log(index);
    console.log(e);
    this.setState({
      currentIndex: index
    })
    this.getGoods();
  }

  // 跳转到商品详情页
  goodsActive(e) {
    const goodId = e.currentTarget.dataset.goodid;
    Taro.navigateTo({
      url: '../goodsDetails/goodsDetails?goodid=' + goodId
    })
  }

  // 上传类目请求数据
  getGoods() {
    Taro.request({
      url: `${HOST}/getGoods`,
      method: 'GET'
    }).then(res => {
      const data = res.data.reverse(); // 把返回的数组调换顺序
      console.log(data)

      const sliderGoods = []
      const Goods = []

      data.forEach(element => {
        if (element.sliderView) {
          const num = sliderGoods.length;
          if (num < 3) {
            sliderGoods.push(element)
          }
        }
      });

      data.forEach(element => {
        if (element.classifyValue.indexOf(this.state.currentIndex) !== -1) {
          Goods.push(element)
        }
      })

      this.setState({
        sliderGoods: sliderGoods,
        Goods: Goods
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
          console.log(res);
          Taro.request({
            url: `${HOST}/onLogin`,
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
              Taro.showToast({
                title: '授权成功',
                icon: 'success',
                duration: 2000
              })
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
    e.stopPropagation();
    let goodDetail = e.currentTarget.dataset.gooddetail;
    let openId = this.state.openId;
    Taro.request({
      url: `${HOST}/shoppingCart`,
      method: 'POST',
      data: {
        shoppingNum: 1,
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

    const navList = [{ index: "0", text: '热卖' }, { index: "1", text: '水果' }, { index: "2", text: '生鲜' }, { index: "3", text: '速食' }, { index: "4", text: '日百' }, { index: "5", text: '生活服务' }]
    const navHeader = navList.map((nav) => {
      return (
        // <View className="{{index === navNum?'hover-nav':'nav'}}" onClick={this.navActive} data-index='{{index}}'>{nav}</View>
        <Text key={nav.index} className={`nav ${nav.index === this.state.currentIndex ? 'hover-nav' : null}`} onClick={this.navActive.bind(this, nav.index)}>{nav.text}</Text>
      )
    })

    const imgList = this.state.sliderGoods.map((sliderGood) => {
      return (
        <Swiper-item key={sliderGood.goodsId}>
          <Image mode='widthFix' onClick={this.goodsActive} data-goodid='{{sliderGood.goodsId}}' onLoad={this.imageLoad} className='image' src={sliderGood.sliderUrl} />
        </Swiper-item>
      )
    })

    const goodsDetails = this.state.Goods.map((good) => {
      return (
        <View key={good.goodsId} className='goods-container' onClick={this.goodsActive} data-goodid='{{good.goodsId}}'>
          <Image className='goods-image' src={good.titleUrl}></Image>
          <View className='goods-message'>
            <View className='message-title'>
              <View className='title-top'>{good.name}</View>
              <View className='title-bottom'>{good.subTitle}</View>
            </View>
            <View className='message-price'>
              <View className='price-left'>
                <Text className='price'>￥{good.price}</Text>
                <Text className='oldprice'>￥{good.oldPrice}</Text>
              </View>
              <View data-goodDetail={good} onClick={this.shopButton}>
                <AtIcon prefixClass='icon' value='gouwuche' size='34' color='#63BA74'></AtIcon>
              </View>
            </View>
          </View>
        </View>
      )
    })

    return (
      <View className='container'>
        <View className='nav-container'>
          {navHeader}
        </View>

        <View style='height:43px;'></View>

        <Swiper autoplay indicator-dots circular className='swiper' style='height:{{imgheights}}px'>
          {imgList}
        </Swiper>

        <View style='height:5px'></View>

        <View>
          {goodsDetails}
        </View>

        {
          isUserOpened &&
          <View className='getUserinfo-button'>
            <View className='getUserinfo'>
              <View className='title'>访问授权</View>
              <View className='text'>请授权后使用！</View>
              <Button className='btn' type='prime' open-type='getUserInfo' onGetUserInfo={this.getUserinfo}>立即授权</Button>
            </View>
          </View>
        }

      </View>
    )
  }
}