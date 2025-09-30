import Vue, { VueConstructor } from 'vue'
import { createAllEnhancers } from './enhancers'
import './styles/index.scss'

export default {
  install(Vue: VueConstructor<Vue>) {
    const ElTable = Vue.component('ElTable')

    if (!ElTable) {
      console.error('[ElTableEnhancer] Element UI ElTable not found!')
      return
    }

    const EnhancedTable = ElTable.extend({
      ...createAllEnhancers()
    })

    Vue.component('ElTable', EnhancedTable)
  }
}