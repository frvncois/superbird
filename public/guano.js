(function () {
    console.log('[Guano] Splattered and scanning for targets 💩🕊️')
  
    const logScrollPosition = () => {
      const scrollX = window.scrollX || document.documentElement.scrollLeft
      const scrollY = window.scrollY || document.documentElement.scrollTop
      console.log('[Guano] Scroll Position:', { scrollX, scrollY })
    }
  
    const logMousePosition = (e) => {
      console.log('[Guano] Mouse Position:', { x: e.clientX, y: e.clientY })
    }
  
    document.addEventListener('click', function (e) {
      if (!(e.metaKey || e.ctrlKey)) return
  
      logScrollPosition()
      logMousePosition(e)
  
      e.preventDefault()
      e.stopPropagation()
  
      const mouseX = e.clientX
      const mouseY = e.clientY
      const scrollX = window.scrollX || document.documentElement.scrollLeft
      const scrollY = window.scrollY || document.documentElement.scrollTop
  
      const adjustedX = mouseX + scrollX
      const adjustedY = mouseY + scrollY 
  
      const message = {
        type: 'guano/target-acquired',
        selector: getUniqueSelector(e.target),
        page_url: window.location.href,
        rect: {
          top: adjustedY,
          left: adjustedX,
          width: 10,
          height: 10,
          scrollX,
          scrollY
        },
        mouseInViewport: {
          x: mouseX,
          y: mouseY
        }
      }
      
  
      window.parent.postMessage(message, '*')
      console.log('[Guano] element selected:', message)
    }, true)
  
    window.addEventListener('message', (event) => {
      const message = event.data
  
      if (message.type === 'guano/target-acquired') {
        const pin = document.createElement('div')
        pin.style.position = 'absolute'
        pin.style.top = `${message.rect.top - 8}px`
        pin.style.left = `${message.rect.left - 8}px`
        pin.style.width = '1rem'
        pin.style.height = '1rem'
        pin.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'
        pin.style.borderRadius = '50%'
        pin.style.cursor = 'pointer'
        pin.dataset.selector = message.selector
        pin.dataset.url = message.page_url
  
        document.body.appendChild(pin)
      }
    })
  
    function getUniqueSelector(el) {
      if (el.id) return `#${el.id}`
      if (el.className && typeof el.className === 'string') {
        return `${el.tagName.toLowerCase()}.${el.className.trim().split(/\s+/).join('.')}`
      }
      return el.tagName.toLowerCase()
    }
  })()
  