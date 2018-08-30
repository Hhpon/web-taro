import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Swiper, Button } from '@tarojs/components'
import { AtFloatLayout } from 'taro-ui'

import './goodsDetails.scss'

export default class goodsDetails extends Component {
    config = {
        navigationBarTitleText: '商品详情'
    }

    constructor() {
        super();
        this.state = {
            goodDetails: {
                goodsId: "1534647307982",
                name: "白菜",
                oldPrice: "300",
                price: "100",
                saleAmount: 0,
                sell: true,
                sliderView: true,
                subTitle: "10斤 装",
                titleUrl: "http://pczgqj6xt.bkt.clouddn.com/微信截图_20180813212549.png"
            },
            isOpened: false
        }
    }

    componentWillMount() {
        // const goodId = this.$router.params.goodid;
        // Taro.request({
        //     url: 'http://localhost:7001/getGoodDetails',
        //     method: 'POST',
        //     data: {
        //         goodId: goodId
        //     }
        // }).then(res => {
        //     console.log(res.data);
        //     this.setState({
        //         goodsDetails: res.data[0]
        //     })
        // })
    }

    sellButton() {
        this.setState({
            isOpened: true
        })
    }

    render() {
        return (
            <View>
                <View>123</View>
                <AtFloatLayout
                    isOpened={this.state.isOpened}
                    title='这是个标题'
                    onClose={this.handleClose} >
                    这是内容区 随你怎么写这是内容区 随你怎么写这是内容区
                    随你怎么写这是内容区 随你怎么写这是内容区 随你怎么写这是内容区
                    随你怎么写
                </AtFloatLayout>
                <View className='details-tab'>
                    <View className='tab-button'>
                        <View>首页</View>
                        <View>购物车</View>
                    </View>
                    <View className='shop-button'>加入购物车</View>
                    <View onClick={this.sellButton} className='sell-button'>立即购买</View>
                </View>

            </View>
        )
    }
}