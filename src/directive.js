import Vue from 'vue'
// 给固定头设置样式
function doFix(dom, top) {
  dom.style.position = 'fixed'
  dom.style.zIndex = '2001'
  dom.style.top = top + 'px'
  dom.parentNode.style.paddingTop = top + 'px'
}
// 给固定头取消样式
function removeFix(dom) {
  dom.parentNode.style.paddingTop = 0
  dom.style.position = 'static'
  dom.style.top = '0'
  dom.style.zIndex = '0'
}
// 给固定头添加class
function addClass(dom, fixtop) {
  const old = dom.className
  if (!old.includes('fixed')) {
    dom.setAttribute('class', old + ' fixed')
    doFix(dom, fixtop)
  }
}
// 给固定头移除class
function removeClass(dom) {
  const old = dom.className
  const idx = old.indexOf('fixed')
  if (idx !== -1) {
    const newClass = old.substr(0, idx - 1)
    dom.setAttribute('class', newClass)
    removeFix(dom)
  }
}
// 具体判断是否固定头的主函数
function fixHead(parent, el, top) {
  /**
   * myTop 当前元素距离滚动父容器的高度，
   * fixtop 当前元素需要设置的绝对定位的高度
   * parentHeight 滚动父容器的高度
   */
  let myTop, fixtop, parentHeight
  // 表头DOM节点
  const dom = el.children[1]

  if (parent.tagName) {
    // 如果是DOM内局部滚动
    // 当前元素距离滚动父容器的高度= 当前元素距离父元素的高度-父容器的滚动距离-表头的高度
    myTop = el.offsetTop - parent.scrollTop - dom.offsetHeight
    // 父元素高度
    const height = getComputedStyle(parent).height
    parentHeight = Number(height.slice(0, height.length - 2))
    // 绝对定位高度 = 滚动父容器相对于视口的高度 + 传入的吸顶高度
    fixtop = top + parent.getBoundingClientRect().top
    // 如果自己距离顶部距离大于父元素的高度，也就是自己还没在父元素滚动出来，直接return
    if (myTop > parentHeight) {
      return
    }
  } else {
    // document节点滚动
    // 当前元素距离滚动父容器的高度 = 当前元素距离视口顶端的距离
    myTop = el.getBoundingClientRect().top
    // 父元素高度 = 视口的高度
    parentHeight = window.innerHeight
    //  绝对定位高度 = 传入的吸顶高度
    fixtop = top
    // 如果自己距离顶部距离大于父元素的高度，也就是自己还没在父元素滚动出来，直接return
    if (myTop > document.documentElement.scrollTop + parentHeight) {
      return
    }
  }
  // 如果 已经滚动的上去不在父容器显示了。直接return 
  if (Math.abs(myTop) > el.offsetHeight + 100) {
    return
  }
  if (myTop < 0 && Math.abs(myTop) > el.offsetHeight) {
    // 如果当前表格已经完全滚动到父元素上面，也就是不在父元素显示了。则需要去除fixed定位
    removeClass(dom)
  } else if (myTop <= 0) {
    // 如果表头滚动到 父容器顶部了。fixed定位
    addClass(dom, fixtop)
  } else if (myTop > 0) {
    // 如果表格向上滚动 又滚动到父容器里。取消fixed定位
    removeClass(dom)
  } else if (Math.abs(myTop) < el.offsetHeight) {
    // 如果滚动的距离的绝对值小于自身的高度，也就是说表格向上滚动，刚刚显示出表格的尾部是需要将表头fixed定位
    addClass(dom, fixtop)
  }
}
// 设置头部固定时表头外容器的宽度写死为表格body的宽度
function setHeadWidth(el) {
  // 获取到当前表格个表格body的宽度
  const width = getComputedStyle(
    el.getElementsByClassName('el-table__body-wrapper')[0]
  ).width
  // 给表格设置宽度。这里默认一个页面中的多个表格宽度是一样的。所以直接遍历赋值，也可以根据自己需求，单独设置
  const tableParent = el.getElementsByClassName('el-table__header-wrapper')
  for (let i = 0; i < tableParent.length; i++) {
    tableParent[i].style.width = width
  }
}
/**
 * 这里有三个全局对象。用于存放监听事件。方便组件销毁后移除监听事件
 */
const fixFunObj = {}      // 用于存放滚动容器的监听scroll事件
const setWidthFunObj = {}   // 用于存放页面resize后重新计算head宽度事件
const autoMoveFunObj ={}    // 用户存放如果是DOM元素内局部滚动时，document滚动时，fix布局的表头也需要跟着document一起向上滚动

// 全局注册 自定义事件
Vue.directive('sticky', {
  // 当被绑定的元素插入到 DOM 中时……
  inserted(el, binding, vnode) {
    // 首先设置表头宽度
    setHeadWidth(el)
    // 获取当前vueComponent的ID。作为存放各种监听事件的key
    const uid = vnode.componentInstance._uid
    // 当window resize时 重新计算设置表头宽度，并将监听函数存入 监听函数对象中，方便移除监听事件
    window.addEventListener(
      'resize',
      (setWidthFunObj[uid] = () => {
        setHeadWidth(el)
      })
    )
    // 获取当前滚动的容器是什么。如果是document滚动。则可默认不传入parent参数
    const scrollParent =
      document.querySelector(binding.value.parent) || document
    // 给滚动容器加scroll监听事件。并将监听函数存入 监听函数对象中，方便移除监听事件
    scrollParent.addEventListener(
      'scroll',
      (fixFunObj[uid] = () => {
        fixHead(scrollParent, el, binding.value.top)
      })
    )
    // 如果是局部DOM元素内滚动。则需要监听document滚动，document滚动是同步让表头一起滚动。并将监听函数存入 监听函数对象中，方便移除监听事件
    if (binding.value.parent) {
      document.addEventListener('scroll', autoMoveFunObj[uid] = ()=> {
        // 获取到表头DOM节点
        const dom = el.children[1]
        // 如果当前表头是fixed定位。则跟着document滚动一起滚
        if(getComputedStyle(dom).position=== 'fixed'){
          // 滚动的距离是： 滚动父容器距离视口顶端高度 + 传入的吸顶固定距离 
          const fixtop =
          binding.value.top + scrollParent.getBoundingClientRect().top
          doFix(dom, fixtop, 'fixed')
        }
      })
    }
  },
  // component 更新后。重新计算表头宽度
  componentUpdated(el) {
    setHeadWidth(el)
  },
  // 节点取消绑定时 移除各项监听事件。
  unbind(el, binding, vnode) {
    const uid = vnode.componentInstance._uid
    window.removeEventListener('resize', setWidthFunObj[uid])
    const scrollParent =
      document.querySelector(binding.value.parent) || document
    scrollParent.removeEventListener('scroll', fixFunObj[uid])
    if (binding.value.parent) {
      document.removeEventListener('scroll', autoMoveFunObj[uid])
    }
  }
})
