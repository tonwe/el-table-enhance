// 列高亮增强功能
export function createColumnHighlightEnhancer() {
  return {
    props: {
      highlightCurrentCol: {
        type: Boolean,
        default: false
      }
    },

    methods: {
      handleCellMouseEnter(row: any, column: any, cell: HTMLElement, event: Event): void {
        const vm = this as any
        vm.highlightRowAndColumn(cell)
        const raw = vm.$listeners['cell-mouse-enter'] as Function | undefined
        if (raw) raw(row, column, cell, event)
      },

      handleCellMouseLeave(row: any, column: any, cell: HTMLElement, event: Event): void {
        const vm = this as any
        vm.clearHighlight(cell)
        const raw = vm.$listeners['cell-mouse-leave'] as Function | undefined
        if (raw) raw(row, column, cell, event)
      },

      handleHeaderMouseEnter(event: Event): void {
        const vm = this as any
        if (!vm.highlightCurrentCol) return
        const target = event.target as HTMLElement
        // 找到最近的 th 元素（可能事件目标是 th 内部的元素）
        const th = target.closest('th') as HTMLElement
        if (th) {
          vm.highlightColumn(th)
        }
      },

      handleHeaderMouseLeave(event: Event): void {
        const vm = this as any
        if (!vm.highlightCurrentCol) return
        const target = event.target as HTMLElement
        // 找到最近的 th 元素
        const th = target.closest('th') as HTMLElement
        if (th) {
          vm.clearColumnHighlight(th)
        }
      },

      // 仅高亮列（用于表头）
      highlightColumn(cell: HTMLElement): void {
        const row = cell.parentNode as HTMLElement
        if (!row) return
        const tableElement = row.closest('.el-table') as HTMLElement
        if (!tableElement) return

        const cellIndex = Array.from(row.children).indexOf(cell)
        
        // 高亮表头对应的列
        const thead = tableElement.querySelector('.el-table__header-wrapper')
        if (thead) {
          const headerRows = thead.querySelectorAll('tr')
          headerRows.forEach(tr => {
            const th = tr.children[cellIndex] as HTMLElement
            if (th) {
              th.classList.add('el-table-enhanced-col-hover')
            }
          })
        }
        
        // 高亮表体对应的列
        const tbody = tableElement.querySelector('.el-table__body-wrapper')
        if (tbody) {
          const bodyRows = tbody.querySelectorAll('tr')
          bodyRows.forEach(tr => {
            const td = tr.children[cellIndex] as HTMLElement
            if (td) {
              td.classList.add('el-table-enhanced-col-hover')
            }
          })
        }
      },

      // 清除列高亮（用于表头）
      clearColumnHighlight(cell: HTMLElement): void {
        const row = cell.parentNode as HTMLElement
        if (!row) return
        const tableElement = row.closest('.el-table') as HTMLElement
        if (!tableElement) return

        const cellIndex = Array.from(row.children).indexOf(cell)
        
        // 清除表头对应列的高亮
        const thead = tableElement.querySelector('.el-table__header-wrapper')
        if (thead) {
          const headerRows = thead.querySelectorAll('tr')
          headerRows.forEach(tr => {
            const th = tr.children[cellIndex] as HTMLElement
            if (th) {
              th.classList.remove('el-table-enhanced-col-hover')
            }
          })
        }
        
        // 清除表体对应列的高亮
        const tbody = tableElement.querySelector('.el-table__body-wrapper')
        if (tbody) {
          const bodyRows = tbody.querySelectorAll('tr')
          bodyRows.forEach(tr => {
            const td = tr.children[cellIndex] as HTMLElement
            if (td) {
              td.classList.remove('el-table-enhanced-col-hover')
            }
          })
        }
      },

      highlightRowAndColumn(cell: HTMLElement): void {
        const vm = this as any
        const row = cell.parentNode as HTMLElement
        if (!row) return
        const tableElement = row.closest('.el-table') as HTMLElement
        if (!tableElement) return

        row.classList.add('el-table-enhanced-row-hover')

        if (!vm.highlightCurrentCol) return

        const cellIndex = Array.from(row.children).indexOf(cell)
        
        // 高亮表头对应的列
        const thead = tableElement.querySelector('.el-table__header-wrapper')
        if (thead) {
          const headerRows = thead.querySelectorAll('tr')
          headerRows.forEach(tr => {
            const th = tr.children[cellIndex] as HTMLElement
            if (th) {
              th.classList.add('el-table-enhanced-col-hover')
            }
          })
        }
        
        // 高亮表体对应的列
        const tbody = tableElement.querySelector('.el-table__body-wrapper')
        if (tbody) {
          const bodyRows = tbody.querySelectorAll('tr')
          bodyRows.forEach(tr => {
            const td = tr.children[cellIndex] as HTMLElement
            if (td) {
              td.classList.add('el-table-enhanced-col-hover')
            }
          })
        }
      },

      clearHighlight(cell: HTMLElement): void {
        const vm = this as any
        const row = cell.parentNode as HTMLElement
        if (!row) return
        const tableElement = row.closest('.el-table') as HTMLElement
        if (!tableElement) return

        row.classList.remove('el-table-enhanced-row-hover')

        if (!vm.highlightCurrentCol) return

        const cellIndex = Array.from(row.children).indexOf(cell)
        
        // 清除表头对应列的高亮
        const thead = tableElement.querySelector('.el-table__header-wrapper')
        if (thead) {
          const headerRows = thead.querySelectorAll('tr')
          headerRows.forEach(tr => {
            const th = tr.children[cellIndex] as HTMLElement
            if (th) {
              th.classList.remove('el-table-enhanced-col-hover')
            }
          })
        }
        
        // 清除表体对应列的高亮
        const tbody = tableElement.querySelector('.el-table__body-wrapper')
        if (tbody) {
          const bodyRows = tbody.querySelectorAll('tr')
          bodyRows.forEach(tr => {
            const td = tr.children[cellIndex] as HTMLElement
            if (td) {
              td.classList.remove('el-table-enhanced-col-hover')
            }
          })
        }
      }
    },

    created() {
      const vm = this as any
      // 包装原始的事件监听器
      vm.$on('cell-mouse-enter', vm.handleCellMouseEnter)
      vm.$on('cell-mouse-leave', vm.handleCellMouseLeave)
    },

    mounted() {
      const vm = this as any
      // 使用事件委托为表头添加鼠标事件监听器，适应动态数据变化
      if (vm.highlightCurrentCol) {
        vm.$nextTick(() => {
          const headerWrapper = vm.$el.querySelector('.el-table__header-wrapper')
          if (headerWrapper) {
            headerWrapper.addEventListener('mouseover', vm.handleHeaderMouseEnter)
            headerWrapper.addEventListener('mouseout', vm.handleHeaderMouseLeave)
          }
        })
      }
    },

    beforeDestroy() {
      const vm = this as any
      // 清理表头事件监听器
      if (vm.highlightCurrentCol) {
        const headerWrapper = vm.$el.querySelector('.el-table__header-wrapper')
        if (headerWrapper) {
          headerWrapper.removeEventListener('mouseover', vm.handleHeaderMouseEnter)
          headerWrapper.removeEventListener('mouseout', vm.handleHeaderMouseLeave)
        }
      }
    }
  }
}