// 列宽度调整增强功能
export function createColumnResizeEnhancer() {
  return {
    props: {
      resizable: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        isResizing: false,
        currentColumn: null as HTMLElement | null,
        currentResizingColumn: null as HTMLElement | null,
        startX: 0,
        startWidth: 0,
        minColumnWidth: 50,
        resizeHandles: [] as HTMLElement[]
      }
    },

    methods: {
      initColumnResize(): void {
        const vm = this as any
        if (!vm.resizable) return

        vm.$nextTick(() => {
          vm.cleanupResizeHandles()
          
          const headerWrapper = vm.$el.querySelector('.el-table__header-wrapper')
          if (!headerWrapper) return

          const thElements = headerWrapper.querySelectorAll('th')
          
          thElements.forEach((th: HTMLElement, index: number) => {
            // 跳过最后一列，避免表格宽度问题
            if (index === thElements.length - 1) return
            vm.addResizeHandle(th)
          })
        })
      },

      cleanupResizeHandles(): void {
        const vm = this as any
        vm.resizeHandles.forEach((handle: HTMLElement) => {
          if (handle.parentNode) {
            handle.parentNode.removeChild(handle)
          }
        })
        vm.resizeHandles = []
      },

      addResizeHandle(th: HTMLElement): void {
        const vm = this as any
        
        // 避免重复添加
        if (th.querySelector('.el-table-resize-handle')) return

        const resizeHandle = document.createElement('div')
        resizeHandle.className = 'el-table-resize-handle'

        // 拖拽事件
        resizeHandle.addEventListener('mousedown', (e: MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
          vm.startResize(e, th, resizeHandle)
        })

        // 设置表头单元格样式
        if (getComputedStyle(th).position === 'static') {
          th.style.position = 'relative'
        }
        th.style.overflow = 'visible'
        
        th.appendChild(resizeHandle)
        vm.resizeHandles.push(resizeHandle)
      },

      startResize(e: MouseEvent, th: HTMLElement, handle: HTMLElement): void {
        const vm = this as any
        
        vm.isResizing = true
        vm.currentColumn = th
        vm.currentResizingColumn = th
        vm.startX = e.clientX
        vm.startWidth = th.offsetWidth

        // 绑定全局事件
        document.addEventListener('mousemove', vm.onResize)
        document.addEventListener('mouseup', vm.stopResize)

        // 设置拖拽状态样式
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
        
        // 添加拖拽状态类到当前列和表格
        th.classList.add('el-table-resizing-column')
        vm.$el.classList.add('el-table-is-resizing')
        handle.classList.add('is-resizing')
      },

      onResize(e: MouseEvent): void {
        const vm = this as any
        if (!vm.isResizing || !vm.currentColumn) return

        const deltaX = e.clientX - vm.startX
        const newWidth = Math.max(vm.startWidth + deltaX, vm.minColumnWidth)
        
        vm.setColumnWidth(vm.currentColumn, newWidth)
      },

      stopResize(): void {
        const vm = this as any
        
        vm.isResizing = false
        
        // 清理拖动状态的列标记
        if (vm.currentResizingColumn) {
          vm.currentResizingColumn.classList.remove('el-table-resizing-column')
          vm.currentResizingColumn = null
        }
        
        // 移除表格的拖动状态类
        vm.$el.classList.remove('el-table-is-resizing')
        
        vm.currentColumn = null

        // 清理全局事件
        document.removeEventListener('mousemove', vm.onResize)
        document.removeEventListener('mouseup', vm.stopResize)

        // 恢复样式
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        
        // 移除拖拽状态类
        vm.resizeHandles.forEach((handle: HTMLElement) => {
          handle.classList.remove('is-resizing')
        })
      },

      setColumnWidth(th: HTMLElement, width: number): void {
        const vm = this as any
        const row = th.parentNode as HTMLElement
        const columnIndex = Array.from(row.children).indexOf(th)

        // 强制表格使用固定布局
        const tableElement = vm.$el.querySelector('.el-table__body table')
        const headerTable = vm.$el.querySelector('.el-table__header table')
        
        if (tableElement) {
          tableElement.style.setProperty('table-layout', 'fixed', 'important')
        }
        if (headerTable) {
          headerTable.style.setProperty('table-layout', 'fixed', 'important')
        }

        // 更新 Element UI 内部列配置
        if (vm.columns && vm.columns[columnIndex]) {
          vm.columns[columnIndex].width = width
          vm.columns[columnIndex].realWidth = width
          vm.columns[columnIndex].minWidth = width
        }

        // 设置表头宽度
        th.style.setProperty('width', width + 'px', 'important')
        th.style.setProperty('min-width', width + 'px', 'important')
        th.style.setProperty('max-width', width + 'px', 'important')

        // 设置 colgroup 元素宽度（关键）
        const headerColgroup = vm.$el.querySelector('.el-table__header colgroup')
        const bodyColgroup = vm.$el.querySelector('.el-table__body colgroup')
        
        if (headerColgroup && headerColgroup.children[columnIndex]) {
          const headerCol = headerColgroup.children[columnIndex] as HTMLElement
          headerCol.style.setProperty('width', width + 'px', 'important')
        }
        
        if (bodyColgroup && bodyColgroup.children[columnIndex]) {
          const bodyCol = bodyColgroup.children[columnIndex] as HTMLElement
          bodyCol.style.setProperty('width', width + 'px', 'important')
        }

        // 设置表体列宽度
        const bodyWrapper = vm.$el.querySelector('.el-table__body-wrapper')
        if (bodyWrapper) {
          const bodyRows = bodyWrapper.querySelectorAll('tr')
          bodyRows.forEach((tr: HTMLElement) => {
            const td = tr.children[columnIndex] as HTMLElement
            if (td) {
              td.style.setProperty('width', width + 'px', 'important')
              td.style.setProperty('min-width', width + 'px', 'important')
              td.style.setProperty('max-width', width + 'px', 'important')
            }
          })
        }

        // 触发表格重新布局
        vm.$nextTick(() => {
          vm.doLayout && vm.doLayout()
        })
      }
    },

    mounted() {
      const vm = this as any
      if (vm.resizable) {
        vm.$nextTick(() => {
          vm.initColumnResize()
        })
      }
    },

    updated() {
      const vm = this as any
      if (vm.resizable) {
        vm.$nextTick(() => {
          vm.initColumnResize()
        })
      }
    },

    beforeDestroy() {
      const vm = this as any
      // 清理资源
      document.removeEventListener('mousemove', vm.onResize)
      document.removeEventListener('mouseup', vm.stopResize)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      vm.cleanupResizeHandles()
    }
  }
}