// 增强器组合工具
import { createColumnHighlightEnhancer } from './column-highlight'
import { createColumnResizeEnhancer } from './column-resize'

// 合并多个增强器的工具函数
export function combineEnhancers(...enhancers: any[]) {
  const combined: any = {
    props: {},
    data() {
      return {}
    },
    methods: {},
    created() {},
    mounted() {},
    updated() {},
    beforeDestroy() {}
  }

  enhancers.forEach(enhancer => {
    const enhancerObj = typeof enhancer === 'function' ? enhancer() : enhancer

    // 合并 props
    if (enhancerObj.props) {
      Object.assign(combined.props, enhancerObj.props)
    }

    // 合并 data
    if (enhancerObj.data) {
      const originalData = combined.data
      combined.data = function() {
        const originalResult = originalData.call(this)
        const enhancerResult = enhancerObj.data.call(this)
        return { ...originalResult, ...enhancerResult }
      }
    }

    // 合并 methods
    if (enhancerObj.methods) {
      Object.assign(combined.methods, enhancerObj.methods)
    }

    // 合并生命周期钩子
    const lifecycleHooks = ['created', 'mounted', 'updated', 'beforeDestroy']
    lifecycleHooks.forEach(hook => {
      if (enhancerObj[hook]) {
        const originalHook = combined[hook]
        combined[hook] = function() {
          originalHook.call(this)
          enhancerObj[hook].call(this)
        }
      }
    })
  })

  return combined
}

// 导出所有可用的增强器
export function createAllEnhancers() {
  return combineEnhancers(
    createColumnHighlightEnhancer,
    createColumnResizeEnhancer
  )
}