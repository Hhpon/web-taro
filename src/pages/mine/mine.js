import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'

import './mine.scss'

export default class mine extends Component {
    config = {
        navigationBarBackgroundColor: '#5FC768'
    }

    constructor() {
        super();
        this.state = {
        }
    }

    render() {
        return (
            <View>123</View>
        )
    }
}