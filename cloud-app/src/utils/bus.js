/**
 * 事件总线
 * 使用 mitt 替代 Vue 2 的 $bus
 */
import mitt from 'mitt'

const emitter = mitt()

export default emitter
