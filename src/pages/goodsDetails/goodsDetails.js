import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Swiper } from '@tarojs/components'

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
            }
        }
    }

    componentWillMount() {
        const goodId = this.$router.params.goodid;
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

    render() {
        return (
            <View>
                <View>123</View>
                <View className='details-tab'>
                    <View className='tab-button'>
                        <View>首页</View>
                        <View>购物车</View>
                    </View>
                    <View className='shop-button'>加入购物车</View>
                    <View className='sell-button'>立即购买</View>
                </View>
            </View>
        )
    }
}