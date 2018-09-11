import Taro, { Component } from '@tarojs/taro'
import { View, Button, Image, Text } from '@tarojs/components'
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
            goodcheckColor: '',
            openId: '',
            orderLists: []
        }
    }

    componentWillMount() {
        const openId = Taro.getStorageSync('openid');
        this.setState({
            openId: openId
        })
    }

    componentDidShow() {
        Taro.request({
            url: 'http://localhost:7001/getorderLists',
            method: 'POST',
            data: {
                openId: this.state.openId
            }
        }).then(res => {
            console.log(res.data);
            this.setState({
                orderLists: res.data
            })
        })
    }

    goodcheckColor() {
        console.log('点击商品');
    }

    render() {

        const orderListsDetails = this.state.orderLists.map((goodsDetail) => {
            return (
                <View className='orderListsDetails' onClick={this.goodcheckHandle}>
                    <View>
                        <AtIcon value='check-circle' size='20' color={this.state.goodcheckColor}></AtIcon>
                    </View>
                    <View className='goodDetail'>
                        <Image className='good-image' mode='aspectFill' src={goodsDetail.titleUrl}></Image>
                        <View className='good-text'>
                            <View className='text-top'>
                                <View>{goodsDetail.name}</View>
                                <View style='font-size: 13px; padding-top: 8px; color: #b7b7b7'>{goodsDetail.subTitle}</View>
                            </View>
                            <View className='text-bottom'>
                                <Text style='color:#FFAC46'>￥{goodsDetail.price}</Text>
                                <Text style='color:#B7B7B7; margin-left: 10px; text-decoration: line-through;'>￥{goodsDetail.oldPrice}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )
        })

        return (
            <View className='container'>
                <View className='mall-address'>
                    <View className='address-top'>
                        <View className='position-icon'>
                            <AtIcon value='map-pin' size='20' color='#59BF73'></AtIcon>
                        </View>
                        <Text>全家享-华盛世纪新城店</Text>
                    </View>
                    <View className='address-bottom'>华盛世纪新城正门</View>
                </View>
                <View className='shopping-goods'>
                    <View className='check-all'>
                        <AtIcon value='check-circle' size='20' color={this.state.checkColor}></AtIcon>
                        <Text className='check-text'>全选</Text>
                    </View>
                    <View>
                        {orderListsDetails}
                    </View>
                </View>
            </View>
        )
    }
}