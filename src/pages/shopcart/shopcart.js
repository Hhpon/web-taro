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
            orderLists: [],
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

    //点击选择商品的对号
    goodcheckHandle() {
        console.log('点击全选');
    }

    //增加商品购买数量
    addHandle(e) {
        const index = e.currentTarget.dataset.index;
        let orderLists = this.state.orderLists[index];
        let openId = this.state.openId;
        let goodsId = orderLists.goodsId;
        orderLists.shoppingNum += 1;

        Taro.request({
            url: 'http://localhost:7001/editUserOrderList',
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

        this.setState({
            orderLists: this.state.orderLists
        })
    }

    //减少商品购买数量
    subtractHandle(e) {
        const index = e.currentTarget.dataset.index;
        let orderLists = this.state.orderLists[index];
        let openId = this.state.openId;
        let goodsId = orderLists.goodsId;
        orderLists.shoppingNum -= 1;

        let that = this;

        if (orderLists.shoppingNum === 0) {
            Taro.showModal({
                title: '提示',
                content: '确定从购物车删除该商品？',
                success: function (res) {
                    if (res.confirm) {
                        Taro.request({
                            url: 'http://localhost:7001/deleteUserOrderList',
                            method: 'POST',
                            data: {
                                openId: openId,
                                goodsId: goodsId
                            }
                        }).then(res => {
                            that.setState({
                                orderLists: res.data
                            })
                        })
                    } else if (res.cancel) {
                        orderLists.shoppingNum = 1;
                        that.setState({
                            orderLists: that.state.orderLists
                        })
                    }
                }
            })
        } else {
            Taro.request({
                url: 'http://localhost:7001/editUserOrderList',
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
            this.setState({
                orderLists: this.state.orderLists
            })
        }
    }

    render() {

        const orderListsDetails = this.state.orderLists.map((goodsDetail) => {
            return (
                <View className='orderListsDetails'>
                    <View onClick={this.goodcheckHandle}>
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
                                <View>
                                    <Text style='color:#FFAC46'>￥{goodsDetail.price}</Text>
                                    <Text style='color:#B7B7B7; margin-left: 10px; text-decoration: line-through;'>￥{goodsDetail.oldPrice}</Text>
                                </View>
                                <View className='edit-button'>
                                    <View onClick={this.addHandle} data-index='{{index}}'>
                                        <AtIcon value='add-circle' color='#E3E3E3'></AtIcon>
                                    </View>
                                    <Text style='width:40px;text-align:center;color:#FFAC46'>
                                        {goodsDetail.shoppingNum}
                                    </Text>
                                    <View onClick={this.subtractHandle} data-index='{{index}}'>
                                        <AtIcon value='subtract-circle' color='#E3E3E3'></AtIcon>
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
                    <View className='check'>
                        <AtIcon value='check-circle' size='20' color='#62BB73'></AtIcon>
                        <Text className='check-text'>次日到达</Text>
                    </View>
                    <View>
                        {orderListsDetails}
                    </View>
                </View>
                <View className='pay-container'>
                    <View className='check-all'>
                        <AtIcon value='check-circle' color={this.state.checkColor} className='icon-class'></AtIcon>
                        <Text className='all-text'>全选</Text>
                    </View>
                    <View className='pay-handle'>
                        <View className='totle-amount'>
                            总计:
                            <Text className='amount-text'>￥{this.state.totalPrices}</Text>
                        </View>
                        <View className='pay-button'>结算</View>
                    </View>
                </View>
            </View>
        )
    }
}