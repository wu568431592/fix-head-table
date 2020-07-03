import Vue from 'vue'

function doFix(dom, top, position) {
  dom.style.position = position
  dom.style.zIndex = '2001'
  dom.style.top = top + 'px'
  dom.parentNode.style.paddingTop = top + 'px'
}
function removeFix(dom) {
  dom.parentNode.style.paddingTop = 0
  dom.style.position = 'static'
  dom.style.top = '0'
  dom.style.zIndex = '0'
}
function addClass(dom, fixtop, position) {
  const old = dom.className
  if (!old.includes('fixed')) {
    dom.setAttribute('class', old + ' fixed')
    doFix(dom, fixtop, position)
  }
}
function removeClass(dom) {
  const old = dom.className
  const idx = old.indexOf('fixed')
  if (idx !== -1) {
    const newClass = old.substr(0, idx - 1)
    dom.setAttribute('class', newClass)
    removeFix(dom)
  }
}

function fixHead(parent, el, top) {
  let myTop, position, fixtop, parentHeight
  const dom = el.children[1]
  if (parent.tagName) {
    // dom 节点滚动
    myTop = el.offsetTop - parent.scrollTop - dom.offsetHeight
    const height = getComputedStyle(parent).height
    parentHeight = Number(height.slice(0, height.length - 2))
    position = 'fixed'
    fixtop = top + parent.getBoundingClientRect().top
    if (myTop > parentHeight) {
      return
    }
  } else {
    // document节点滚动 元素内部滚动
    myTop = el.getBoundingClientRect().top
    parentHeight = window.innerHeight
    position = 'fixed'
    fixtop = top
    if (myTop > document.documentElement.scrollTop + parentHeight) {
      return
    }
  }
  if (Math.abs(myTop) > el.offsetHeight + 100) {
    return
  }
  if (myTop < 0 && Math.abs(myTop) > el.offsetHeight) {
    removeClass(dom)
  } else if (myTop < 0) {
    addClass(dom, fixtop, position)
  } else if (myTop > 0) {
    removeClass(dom)
  } else if (Math.abs(myTop) < el.offsetHeight) {
    addClass(dom, fixtop, position)
  }
}
function setHeadWidth(el) {
  const width = getComputedStyle(
    el.getElementsByClassName('el-table__body-wrapper')[0]
  ).width
  const tableParent = el.getElementsByClassName('el-table__header-wrapper')
  for (let i = 0; i < tableParent.length; i++) {
    tableParent[i].style.width = width
  }
}
const fixFunObj = {}
const setWidthFunObj = {}
const autoMoveFunObj ={}
Vue.directive('sticky', {
  // 当被绑定的元素插入到 DOM 中时……
  inserted(el, binding, vnode) {
    setHeadWidth(el)
    const uid = vnode.componentInstance._uid
    window.addEventListener(
      'resize',
      (setWidthFunObj[uid] = () => {
        setHeadWidth(el)
      })
    )
    const scrollParent =
      document.querySelector(binding.value.parent) || document
    scrollParent.addEventListener(
      'scroll',
      (fixFunObj[uid] = () => {
        fixHead(scrollParent, el, binding.value.top)
      })
    )
    if (binding.value.parent) {
      document.addEventListener('scroll', autoMoveFunObj[uid] = ()=> {
        const dom = el.children[1]
        if(getComputedStyle(dom).position=== 'fixed'){
          const fixtop =
          binding.value.top + scrollParent.getBoundingClientRect().top
          const position = 'fixed'
          doFix(dom, fixtop, position)
        }
      })
    }
  },
  componentUpdated(el) {
    setHeadWidth(el)
  },
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
