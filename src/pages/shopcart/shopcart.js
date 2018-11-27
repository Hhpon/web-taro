import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
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
            url: 'https://home.hhp.im/getorderLists',
            method: 'POST',
            data: {
                openId: this.state.openId
            }
        }).then(res => {
            console.log(res.data);
            this.setState({
                orderLists: res.data
            })
            this.ischeckColor(res.data);
            this.counttotalPrices(res.data);
        })
    }

    // 页面更新触发的生命周期
    componentDidUpdate() {
        let orderLists = this.state.orderLists;

        // this.ischeckColor(orderLists);
        // this.counttotalPrices(orderLists);
    }

    // 判断全选按钮状态
    ischeckColor(orderLists) {
        let statusNum = 0;
        orderLists.map((goodsDetail) => {
            if (goodsDetail.goodcheckStatus) {
                statusNum += 1;
            }
        })
        if (statusNum === orderLists.length) {
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
    counttotalPrices(orderLists) {
        let totalPrices = 0;
        orderLists.map((goodsDetail) => {
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
        let orderLists = this.state.orderLists[index];
        if (orderLists.goodcheckStatus) {
            orderLists.goodcheckStatus = false;
            this.setState({
                orderLists: this.state.orderLists
            }, () => {
                let orderLists = this.state.orderLists;

                this.ischeckColor(orderLists);
                this.counttotalPrices(orderLists);
            })
        } else {
            orderLists.goodcheckStatus = true;
            this.setState({
                orderLists: this.state.orderLists,
            }, () => {
                let orderLists = this.state.orderLists;

                this.ischeckColor(orderLists);
                this.counttotalPrices(orderLists);
            })
        }
    }

    //点击全选的方法
    checkallHandle() {
        if (this.state.checkColor) {
            this.state.orderLists.map((goodsDetail) => {
                goodsDetail.goodcheckStatus = false;
            })
            this.setState({
                orderLists: this.state.orderLists
            }, () => {
                let orderLists = this.state.orderLists;

                this.ischeckColor(orderLists);
                this.counttotalPrices(orderLists);
            })
        } else {
            this.state.orderLists.map((goodsDetail) => {
                goodsDetail.goodcheckStatus = true;
            })
            this.setState({
                orderLists: this.state.orderLists
            }, () => {
                let orderLists = this.state.orderLists;

                this.ischeckColor(orderLists);
                this.counttotalPrices(orderLists);
            })
        }
    }

    //增加商品购买数量
    addHandle(e) {
        const index = e.currentTarget.dataset.index;
        let orderLists = this.state.orderLists[index];
        let openId = this.state.openId;
        let goodsId = orderLists.goodsId;
        orderLists.shoppingNum += 1;

        if (!orderLists.goodcheckStatus) {
            orderLists.goodcheckStatus = true;
            this.setState({
                orderLists: this.state.orderLists
            }, () => {
                let orderLists = this.state.orderLists;

                this.ischeckColor(orderLists);
                this.counttotalPrices(orderLists);
            })
        } else {
            let orderLists = this.state.orderLists;

            this.counttotalPrices(orderLists);
        }

        // 把更改的数据上传到数据库
        Taro.request({
            url: 'https://home.hhp.im/editUserOrderList',
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
        let orderLists = this.state.orderLists[index];
        let openId = this.state.openId;
        let goodsId = orderLists.goodsId;
        if (orderLists.shoppingNum > 0) {
            orderLists.shoppingNum -= 1;
        }

        let that = this;

        if (orderLists.shoppingNum === 0) {
            Taro.showModal({
                title: '提示',
                content: '确定从购物车删除该商品？',
                success: function (res) {
                    if (res.confirm) {
                        Taro.request({
                            url: 'https://home.hhp.im/deleteUserOrderList',
                            method: 'POST',
                            data: {
                                openId: openId,
                                goodsId: goodsId
                            }
                        }).then(res => {
                            that.setState({
                                orderLists: res.data
                            }, () => {
                                console.log(that.state.orderLists);
                                let orderLists = that.state.orderLists;

                                that.ischeckColor(orderLists);
                                that.counttotalPrices(orderLists);
                            })
                        })
                    } else if (res.cancel) {
                        orderLists.shoppingNum = 1;
                        this.setState({
                            orderLists: this.state.orderLists
                        }, () => {
                            let orderLists = this.state.orderLists;

                            this.ischeckColor(orderLists);
                            this.counttotalPrices(orderLists);
                        })
                    }
                }
            })
        } else {
            if (!orderLists.goodcheckStatus) {
                orderLists.goodcheckStatus = true;
                this.setState({
                    orderLists: this.state.orderLists
                }, () => {
                    let orderLists = this.state.orderLists;
    
                    this.ischeckColor(orderLists);
                    this.counttotalPrices(orderLists);
                })
            } else {
                this.setState({
                    orderLists: this.state.orderLists
                }, () => {
                    let orderLists = this.state.orderLists;

                    this.ischeckColor(orderLists);
                    this.counttotalPrices(orderLists);
                })
            }
            Taro.request({
                url: 'https://home.hhp.im/editUserOrderList',
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

    render() {

        const orderListsDetails = this.state.orderLists.map((goodsDetail) => {
            return (
                <View className='orderListsDetails'>
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
                    <View className='check-all' onClick={this.checkallHandle}>
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
                <View style='height:50px'></View>
            </View>
        )
    }
}