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
            checkColor: ''
        }
    }

    componentWillMount() {
        
    }

    render() {
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
                </View>
            </View>
        )
    }
}