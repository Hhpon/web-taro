import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'

import './modelbox.scss'

export default class Modelbox extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (
            <View className='model-box'>
                <View className='container'>
                    <View className='header-con'>提示</View>
                    <View className='content-con'>2</View>
                    <View>1</View>
                </View>
            </View>
        )
    }
}