import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { AtIcon } from 'taro-ui'

import './mine.scss'

export default class mine extends Component {
    config = {
        navigationBarBackgroundColor: '#5FC768'
    }

    constructor() {
        super();
        this.state = {
            userInfo: {}
        }
    }

    componentWillMount() {
        const openId = Taro.getStorageSync('openid');
        Taro.request({
            url: 'http://localhost:7001/getUserinfo',
            data: {
                openId: openId
            }
        }).then(res => {
            this.setState({
                userInfo: res.data
            })
            console.log(res.data);
        })
    }

    render() {
        return (
            <View>
                <View className='message-container'>
                    <View className='image-container'>
                        <View style='height:10px;'></View>
                        <View className='avatar-con'>
                            <View className='avatar'>
                                <Image src={this.state.userInfo.avatarUrl} style='width:70px;height:70px;'></Image>
                            </View>
                        </View>
                        <View className='name-con'>{this.state.userInfo.nickName}</View>
                    </View>
                    <View className='mine-order'>
                        <View className='order-top'>
                            <Text>我的订单</Text>
                            <View className='ordertop-right'>
                                <Text>查看全部订单 &nbsp;</Text>
                                <AtIcon value='chevron-right' size='15' color='#868281' className='right-icon'></AtIcon>
                            </View>
                        </View>
                        <View></View>
                    </View>
                    <View></View>
                </View>
                <View></View>
                <View></View>
            </View>
        )
    }
}