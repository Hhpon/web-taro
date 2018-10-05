import Taro, { Component } from '@tarojs/taro'
import { View, Button, Image } from '@tarojs/components'
import { AtFloatLayout, AtInputNumber, AtIcon } from 'taro-ui'

import './goodsDetails.scss'

export default class goodsDetails extends Component {
    config = {
        navigationBarTitleText: '商品详情'
    }

    constructor() {
        super();
        this.state = {
            goodDetails: {},
            isOpened: false,
            sellNum: 1
        }
    }

    componentWillMount() {
        const goodId = this.$router.params.goodid;
        Taro.request({
            url: 'http://localhost:7001/getGoodDetails',
            method: 'POST',
            data: {
                goodId: goodId
            }
        }).then(res => {
            console.log(res.data);
            this.setState({
                goodDetails: res.data[0]
            })
        })
    }

    sellButton() {
        this.setState({
            isOpened: true
        })
    }
    sellNumChange(value) {
        this.setState({
            sellNum: value
        })
    }
    sellNowButton(e) {
        console.log(this.state.sellNum);
        console.log(this.state.goodDetails);
        Taro.request({
            url: 'http://localhost:7001/sellHandle',
            method: 'POST',
            data: {
                sellNum: this.state.sellNum,
                goodDetails: this.state.goodDetails
            }
        }).then(res => {
            console.log(res);
        })
    }


    render() {
        const goodDetails = this.state.goodDetails;
        const details = goodDetails.detailsUrl.map(detailUrl => {
            return (
                <Image mode='widthFix' style='width:100%' src={detailUrl}></Image>
            )
        })
        return (
            <View>
                <View>
                    <View>
                        <Image mode='widthFix' style='width:100%' src={goodDetails.titleUrl}></Image>
                    </View>
                    <View className='price-container'>
                        <View className='price-left'>
                            <Text className='price'>￥{goodDetails.price}</Text>
                            <Text className='oldprice'>￥{goodDetails.oldPrice}</Text>
                        </View>
                        <View className='price-right'>
                            已抢{goodDetails.saleAmount}件
                        </View>
                    </View>
                    <View className='title-container'>
                        <View className='title-left'>
                            <View className='titleleft-top'>{goodDetails.name}</View>
                            <View className='titleleft-bottom'>{goodDetails.subTitle}</View>
                        </View>
                        <View className='title-right'>
                            <AtIcon prefixClass='icon' value='fenxiang'></AtIcon>
                            <Text style='font-size:12px;'>分享</Text>
                        </View>
                    </View>
                    <View>
                        <View style='padding:15px;font-size:20px;font-weight:blod'>商品详情</View>
                        <View>
                            {details}
                        </View>
                        <View style='height:50px;'>
                        </View>
                    </View>
                </View>
                <AtFloatLayout
                    isOpened={this.state.isOpened}
                    title='请输入购买量'
                    onClose={this.handleClose} >
                    <AtInputNumber
                        min={1}
                        value={this.state.sellNum}
                        onChange={this.sellNumChange}
                    />
                    <Button onClick={this.sellNowButton}>立即购买</Button>
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