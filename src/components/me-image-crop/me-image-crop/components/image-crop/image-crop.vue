<template>
  <div ref='meImageCrop' class='meImageCrop'>
    <!--画布--><canvas class='meImageCrop-canvas'></canvas>
    <!--操作按钮-->
    <div class='meImageCrop-btns' :style='{top:buttonTop+"px",right:buttonRight+"px"}'>
      <!--旋转-->
      <div v-if='showBtn && is_pc()' class='meImageCrop-btn meImageCrop-btn-rotate'>
        <slot name='rotate'>
          <span :style='{fontSize:buttonSize+"px",color:"#DAA520"}' class='meImageCrop-iconfont meImageCrop-icon-rotate2' alt=""> </span>
        </slot>
      </div>
      <!--取消-->
      <div v-if='showBtn' @click='cancelCrop' class='meImageCrop-btn'>
        <slot name='cancel'>
          <span :style='{fontSize:buttonSize+"px",color:"#E56149"}' class='meImageCrop-iconfont meImageCrop-icon-cancel' alt=""></span>
        </slot>
      </div>
      <!--确认-->
      <div v-if='showBtn' @click='confirmCrop' class='meImageCrop-btn'>
        <slot name='confirm'>
          <span :style='{fontSize:buttonSize+"px",color:"#45C189"}' class='meImageCrop-iconfont meImageCrop-icon-sure' alt=""></span>
        </slot>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'me-image-crop',
    props: {
      imageSrc: {
        type: String,
        required: true,
      },
      showBtn: {
        type: Boolean,
        default: true,
      },
      outType: {
        type: String,
        default: 'base64',
      }
    },
    data() {
      return {
        browser: '',
        wt: null,
        canvas: null,
        ctx: null,
        canvasWidth: 0,
        canvasHeight: 0,
        cropFrameSize: 0,
        buttonTop: 0,
        buttonRight: 0,
        buttonSize: 30,
        waitingAni: {
          size: 5,
          colors: ['#e2e2e2', '#a2a2a2', '#a2a2a2'],
          timer: 0,
          start: false,
        },
        img: null,
        imgNaturalWidth: 0,
        imgNaturalHeight: 0,
        scale: 1,
        scaleRate: 0.,
        position: {
          x: 0,
          y: 0
        },
        rotateAngle: 0,
        AnimationFrameId: '',
      }
    },
    created() {
      this.wt = this.watchTouch()
      this.wt.watch()
      try {
        window.addEventListener('touchmove', this.forbidPageScale, {
          passive: false
        })
      } catch(err) {
        window.addEventListener('touchmove', this.forbidPageScale)
      }
      if(this.is_pc()) {
        let browser = ''
        let userAgent = window.navigator.userAgent.toLowerCase()
        if(userAgent.indexOf('trident/7.0') > -1) {
          browser = 'ie'
        } else if(userAgent.indexOf('opera') > -1) {
          browser = 'opera'
        } else if(userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1) {
          browser = 'safari'
        } else if(userAgent.indexOf('chrome') > -1) {
          browser = 'chrome'
        } else if(userAgent.indexOf('firefox') > -1) {
          browser = 'firefox'
        }
        this.browser = browser
      }
      this.$nextTick(() => {
        Promise.all([this.initCanvas(), this.imgLoad()]).then(() => {
          this.scaleImg()
          this.translateImg()
          this.rotateImg()
        })
        this.AnimationFrameId = window.requestAnimationFrame(this.draw)
      })
    },
    watch: {
      showBtn(newVal, oldVal) {
        if(newVal) {
          this.$nextTick(this.rotateImg_pc)
        }
      }
    },
    methods: {
      forbidPageScale(event) {
        event = event || window.event
        event.preventDefault()
      },
      is_pc() {
        let arr = ["android", "iphone", "symbianOS", "windows phone", "ipad", "ipod"]
        let userAgent = window.navigator.userAgent.toLowerCase()
        let bool = true
        for(let i = 0; i < arr.length; i++) {
          if(userAgent.indexOf(arr[i]) >= 0) {
            bool = false
          }
        }
        return bool
      },
      watchTouch() {
        let touchMap = new Map()
        const touchstart = (event) => {
          touchMap.set(event.changedTouches[0].identifier, event.changedTouches[0])
        }
        const touchmove = (event) => {
          Array.from(event.touches).map(item => {
            touchMap.has(item.identifier) && touchMap.set(item.identifier, item)
          })
        }
        const touchend = (event) => {
          touchMap.delete(event.changedTouches[0].identifier)
        }
        const touchcancel = (event) => {
          touchMap.clear()
        }
        return {
          watch() {
            window.addEventListener('touchstart', touchstart, true)
            window.addEventListener('touchmove', touchmove, true)
            window.addEventListener('touchend', touchend, true)
            window.addEventListener('touchcancel', touchcancel, true)
          },
          dispose() {
            window.removeEventListener('touchstart', touchstart)
            window.removeEventListener('touchmove', touchmove)
            window.removeEventListener('touchend', touchend)
            window.removeEventListener('touchcancel', touchcancel)
          },
          touchMap
        }
      },
      initCanvas() {
        let height = window.getComputedStyle(this.$refs['meImageCrop'], null).getPropertyValue('height')
        let width = window.getComputedStyle(this.$refs['meImageCrop'], null).getPropertyValue('width')
        this.canvasHeight = parseInt(height)
        this.canvasWidth = parseInt(width)
        this.canvas = this.$refs['meImageCrop'].querySelector('.meImageCrop-canvas')
        this.canvas.height = this.canvasHeight
        this.canvas.width = this.canvasWidth
        this.ctx = this.canvas.getContext('2d')
        this.cropFrameSize = this.canvasWidth < this.canvasHeight ? this.canvasWidth * 0.7 : this.canvasHeight * 0.7
        this.buttonTop = this.canvasHeight / 30 > 30 ? 30 : (this.canvasHeight / 30 < 20 ? 20 : (this.canvasHeight / 30))
        this.buttonRight = ((this.canvasWidth - this.cropFrameSize) / 2 - this.buttonSize) / 2
        this.buttonRight = this.buttonRight > 30 ? 30 : (this.buttonRight < 10 ? 10 : this.buttonRight)
        this.position.x = this.canvasWidth / 2
        this.position.y = this.canvasHeight / 2
        return Promise.resolve()
      },
      imgLoad() {
        let promise = new Promise((resolve, reject) => {
          this.img = document.createElement('img')
          this.img.src = this.imageSrc
          this.img.onload = () => {
            this.imgNaturalWidth = this.img.naturalWidth
            this.imgNaturalHeight = this.img.naturalHeight
            let widthRate = this.canvasWidth / this.imgNaturalWidth
            let heightRate = this.canvasHeight / this.imgNaturalHeight
            if(widthRate < heightRate) {
              this.scale = widthRate
            } else {
              this.scale = heightRate
            }
            resolve()
          }
        })
        return promise
      },
      drawCropFrame() {
        let canvasTerminals = [{
          x: 0,
          y: 0,
        }, {
          x: this.canvasWidth,
          y: 0,
        }, {
          x: this.canvasWidth,
          y: this.canvasHeight,
        }, {
          x: 0,
          y: this.canvasHeight,
        }]
        let cropFrameTerminals = [{
          x: parseInt(this.canvasWidth / 2 - (this.cropFrameSize / 2)) + 0.5,
          y: parseInt(this.canvasHeight / 2 - (this.cropFrameSize / 2)) + 0.5,
        }, {
          x: parseInt(this.canvasWidth / 2 + (this.cropFrameSize / 2)) + 0.5,
          y: parseInt(this.canvasHeight / 2 - (this.cropFrameSize / 2)) + 0.5,
        }, {
          x: parseInt(this.canvasWidth / 2 + (this.cropFrameSize / 2)) + 0.5,
          y: parseInt(this.canvasHeight / 2 + (this.cropFrameSize / 2)) + 0.5,
        }, {
          x: parseInt(this.canvasWidth / 2 - (this.cropFrameSize / 2)) + 0.5,
          y: parseInt(this.canvasHeight / 2 + (this.cropFrameSize / 2)) + 0.5,
        }]
        this.ctx.save()
        this.ctx.fillStyle = 'rgba(0,0,0,0.35)'
        this.ctx.beginPath()
        this.ctx.moveTo(canvasTerminals[0].x, canvasTerminals[0].y)
        this.ctx.lineTo(cropFrameTerminals[0].x, cropFrameTerminals[0].y)
        this.ctx.lineTo(cropFrameTerminals[1].x, cropFrameTerminals[1].y)
        this.ctx.lineTo(cropFrameTerminals[2].x, cropFrameTerminals[2].y)
        this.ctx.lineTo(cropFrameTerminals[3].x, cropFrameTerminals[3].y)
        this.ctx.lineTo(cropFrameTerminals[0].x, cropFrameTerminals[0].y)
        this.ctx.lineTo(canvasTerminals[0].x, canvasTerminals[0].y)
        this.ctx.lineTo(canvasTerminals[3].x, canvasTerminals[3].y)
        this.ctx.lineTo(canvasTerminals[2].x, canvasTerminals[2].y)
        this.ctx.lineTo(canvasTerminals[1].x, canvasTerminals[1].y)
        this.ctx.fill()
        this.ctx.restore()
        this.ctx.save()
        this.ctx.strokeStyle = '#fff'
        this.ctx.lineWidth = 1
        this.ctx.beginPath()
        this.ctx.moveTo(cropFrameTerminals[0].x, cropFrameTerminals[0].y)
        this.ctx.lineTo(cropFrameTerminals[1].x, cropFrameTerminals[1].y)
        this.ctx.lineTo(cropFrameTerminals[2].x, cropFrameTerminals[2].y)
        this.ctx.lineTo(cropFrameTerminals[3].x, cropFrameTerminals[3].y)
        this.ctx.closePath()
        this.ctx.stroke()
        this.ctx.restore()
      },
      scaleImg() {
        let scaleStart = false
        let touchLength
        let touch1Id
        let touch2Id
        let _scale
        const enableScale = (event) => {
          if(scaleStart) return
          event = event || window.event
          if(this.is_pc()) {
            scaleStart = true
          } else {
            let targetTouches = []
            let touches = [...this.wt.touchMap.values()]
            touches.map(item => {
              if(item.target === this.$refs['meImageCrop'].querySelector('.meImageCrop-canvas')) {
                targetTouches.push(item)
              }
            })
            if(targetTouches.length === 2 && scaleStart === false) {
              scaleStart = true
              _scale = this.scale
              touch1Id = targetTouches[0].identifier
              touch2Id = targetTouches[1].identifier
              let x1 = targetTouches[0].clientX
              let y1 = targetTouches[0].clientY
              let x2 = targetTouches[1].clientX
              let y2 = targetTouches[1].clientY
              touchLength = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
            }
          }
        }
        const scaling = (event) => {
          if(this.is_pc()) {
            let canvas = document.querySelector('.meImageCrop-canvas')
            if(canvas && (canvas.contains(event.target) || canvas === event.target) && !this.scaleStart) {
              scaleStart = true
            }
          }
          if(!scaleStart) return
          event = event || window.event
          if(this.is_pc()) {
            let direction = ''
            if(this.browser === 'firefox') {
              if(event.detail < 0) {
                direction = 'up'
              } else {
                direction = 'down'
              }
            } else {
              if(event.wheelDelta > 0) {
                direction = 'up'
              } else {
                direction = 'down'
              }
            }
            if(direction === 'up') {
              this.scale = this.scale * 1.1
            } else {
              this.scale = this.scale * 0.9
            }
          } else {
            let _touch1, _touch2
            for(let i = 0; i < event.touches.length; i++) {
              if(event.touches[i].identifier === touch1Id) _touch1 = event.touches[i]
              if(event.touches[i].identifier === touch2Id) _touch2 = event.touches[i]
            }
            if(!(_touch1 && _touch2)) return
            let x1 = _touch1.clientX
            let y1 = _touch1.clientY
            let x2 = _touch2.clientX
            let y2 = _touch2.clientY
            let _touchLength = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
            this.scale = _scale * (_touchLength / touchLength)
          }
        }
        const disableScale = (event) => {
          if(!scaleStart) return
          event = event || window.event
          if(this.is_pc()) {
            scaleStart = false
            touchLength = undefined
            touch1Id = undefined
            touch2Id = undefined
            _scale = undefined
          } else {
            let _touch1, _touch2
            for(let i = 0; i < event.touches.length; i++) {
              if(event.touches[i].identifier === touch1Id) _touch1 = event.touches[i]
              if(event.touches[i].identifier === touch2Id) _touch2 = event.touches[i]
            }
            if(event.type === 'touchcancel' || !(_touch1 && _touch2)) {
              scaleStart = false
              touchLength = undefined
              touch1Id = undefined
              touch2Id = undefined
              _scale = undefined
            }
          }
        }
        this.canvas.addEventListener('mouseover', enableScale)
        window.addEventListener('DOMMouseScroll', scaling)
        window.addEventListener('mousewheel', scaling)
        this.canvas.addEventListener('mouseout', disableScale)
        this.canvas.addEventListener('touchmove', enableScale)
        this.canvas.addEventListener('touchmove', scaling)
        document.addEventListener('touchend', disableScale)
        document.addEventListener('touchcancel', disableScale)
        this._disposeScale = () => {
          this.canvas.removeEventListener('mouseenter', enableScale)
          window.removeEventListener('DOMMouseScroll', scaling)
          window.removeEventListener('mousewheel', scaling)
          this.canvas.removeEventListener('mouseleave', disableScale)
          this.canvas.removeEventListener('touchmove', enableScale)
          this.canvas.removeEventListener('touchmove', scaling)
          document.removeEventListener('touchend', disableScale)
          document.removeEventListener('touchcancel', disableScale)
        }
      },
      translateImg() {
        let translateStart = false
        let touchId
        let touchPosition = {
          x: 0,
          y: 0
        }
        let _position = {
          x: 0,
          y: 0
        }
        const enableTranslate = (event) => {
          if(translateStart) return
          event = event || window.event
          if(this.is_pc()) {
            translateStart = true
            _position.x = this.position.x
            _position.y = this.position.y
            touchPosition.x = event.clientX
            touchPosition.y = event.clientY
          } else {
            let targetTouches = []
            let touches = [...this.wt.touchMap.values()]
            touches.map(item => {
              if(item.target === this.$refs['meImageCrop'].querySelector('.meImageCrop-canvas')) {
                targetTouches.push(item)
              }
            })
            if(targetTouches.length === 1 && touches.length === 1 && translateStart === false) {
              translateStart = true
              _position.x = this.position.x
              _position.y = this.position.y
              touchId = targetTouches[0].identifier
              touchPosition.x = targetTouches[0].clientX
              touchPosition.y = targetTouches[0].clientY
            }
          }
        }
        const translating = (event) => {
          if(!translateStart) return
          event = event || window.event
          if(this.is_pc()) {
            let offsetX = event.clientX - touchPosition.x
            let offsetY = event.clientY - touchPosition.y
            this.position.x = _position.x + offsetX
            this.position.y = _position.y + offsetY
          } else {
            let _touch
            for(let i = 0; i < event.touches.length; i++) {
              if(event.touches[i].identifier === touchId) _touch = event.touches[i]
            }
            if(!_touch) return
            let offsetX = _touch.clientX - touchPosition.x
            let offsetY = _touch.clientY - touchPosition.y
            this.position.x = _position.x + offsetX
            this.position.y = _position.y + offsetY
          }
        }
        const disableTranslate = (event) => {
          if(!translateStart) return
          translateStart = false
          _position.x = 0
          _position.y = 0
          touchPosition.x = 0
          touchPosition.y = 0
          touchId = undefined
        }
        this.canvas.addEventListener('mousemove', translating)
        this.canvas.addEventListener('mousedown', enableTranslate)
        document.addEventListener('mouseup', disableTranslate)
        document.addEventListener('mousecancel', disableTranslate)
        this.canvas.addEventListener('touchmove', enableTranslate)
        this.canvas.addEventListener('touchmove', translating)
        document.addEventListener('touchend', disableTranslate)
        document.addEventListener('touchcancel', disableTranslate)
        document.addEventListener('touchstart', disableTranslate)
        this._disposeTranslate = () => {
          this.canvas.removeEventListener('mousemove', translating)
          this.canvas.removeEventListener('click', enableTranslate)
          document.removeEventListener('mouseup', disableTranslate)
          document.removeEventListener('mousecancel', disableTranslate)
          this.canvas.removeEventListener('touchmove', enableTranslate)
          this.canvas.removeEventListener('touchmove', translating)
          document.removeEventListener('touchend', disableTranslate)
          document.removeEventListener('touchcancel', disableTranslate)
          document.removeEventListener('touchstart', disableTranslate)
        }
      },
      rotateImg() {
        if(this.is_pc() && this.showBtn) {
          this.rotateImg_pc()
        } else {
          this.rotateImg_mobile()
        }
      },
      rotateImg_pc() {
        let el = this.$refs.meImageCrop.querySelector('.meImageCrop-btn-rotate')
        if(!el) {
          return
        }
        let firstLongtab = true
        let direc = true
        el.addEventListener('click', () => {
          if(direc) {
            this.rotateAngle++
          } else {
            this.rotateAngle--
          }
        })

        function longtabEvent(dom) {
          if(!(dom instanceof HTMLElement || dom === window)) return
          let events = {}
          let status = 0
          let timer, longtabingTimer
          dom.addEventListener('mousedown', () => {
            status = 0
            window.addEventListener('click', notLongtab)
            window.addEventListener('mouseup', notLongtab)
            window.addEventListener('mousecancel', notLongtab)
            timer = setTimeout(() => {
              window.removeEventListener('click', notLongtab)
              window.removeEventListener('mouseup', notLongtab)
              window.removeEventListener('mousecancel', notLongtab)
              if(status === 0) {
                status = 2
                longtabstart()
                longtabingTimer = setInterval(() => {
                  longtabing()
                }, 50)
                window.addEventListener('click', longtabover)
                window.addEventListener('mouseup', longtabover)
                window.addEventListener('mousecancel', longtabover)
              }
            }, 500)
          })

          function notLongtab(event) {
            status = 1
            window.removeEventListener('click', notLongtab)
            window.removeEventListener('mouseup', notLongtab)
            window.removeEventListener('mousecancel', notLongtab)
            timer && clearTimeout(timer)
          }

          function longtabstart() {
            if(events.longtabstart) {
              events.longtabstart.map((item) => {
                item()
              })
            }
          }

          function longtabing() {
            if(events.longtabing) {
              events.longtabing.map((item) => {
                item()
              })
            }
          }

          function longtabover(event) {
            window.removeEventListener('click', longtabover)
            window.removeEventListener('mouseup', longtabover)
            window.removeEventListener('mousecancel', longtabover)
            longtabingTimer && clearInterval(longtabingTimer)
            if(events.longtabover) {
              events.longtabover.map((item) => {
                item()
              })
            }
          }

          function addEventListener(event, callback) {
            events[event] ? events[event].push(callback) : events[event] = [callback]
          }
          return {
            addEventListener
          }
        }
        let longtab = longtabEvent(el)
        longtab.addEventListener('longtabstart', () => {
          if(firstLongtab) {
            firstLongtab = false
            return
          }
          direc = !direc
        })
        longtab.addEventListener('longtabing', () => {
          if(direc) {
            this.rotateAngle += 3
          } else {
            this.rotateAngle += -3
          }
        })
      },
      rotateImg_mobile() {
        let rotateStart = false
        let rotateAngle = null
        let touch1Id, touch2Id
        let startVector = {
          x: null,
          y: null
        }
        const enableRotate = (event) => {
          if(rotateStart) return
          event = event || window.event
          let targetTouches = []
          let touches = [...this.wt.touchMap.values()]
          touches.map(item => {
            if(item.target === this.$refs['meImageCrop'].querySelector('.meImageCrop-canvas')) {
              targetTouches.push(item)
            }
          })
          if(targetTouches.length === 2 && rotateStart === false) {
            rotateStart = true
            rotateAngle = this.rotateAngle
            touch1Id = targetTouches[0].identifier
            touch2Id = targetTouches[1].identifier
            startVector.x = targetTouches[1].clientX - targetTouches[0].clientX
            startVector.y = targetTouches[1].clientY - targetTouches[0].clientY
          }
        }
        const rotating = (event) => {
          if(!rotateStart) return
          event = event || window.event
          let _touch1, _touch2
          for(let i = 0; i < event.touches.length; i++) {
            if(event.touches[i].identifier === touch1Id) _touch1 = event.touches[i]
            if(event.touches[i].identifier === touch2Id) _touch2 = event.touches[i]
          }
          if(!(_touch1 && _touch2)) return

          let endVector = {
            x: null,
            y: null
          }
          endVector.x = _touch2.clientX - _touch1.clientX
          endVector.y = _touch2.clientY - _touch1.clientY
          let angle = Math.acos((startVector.x * endVector.x + startVector.y * endVector.y) / (Math.sqrt(startVector.x * startVector.x + startVector.y * startVector.y) * Math.sqrt(endVector.x * endVector.x + endVector.y * endVector.y)))
          angle = (180 / Math.PI * angle)
          if(Number.isNaN(angle)) return
          let vectorProduct_z = (startVector.x * endVector.y - startVector.y * endVector.x)
          if(vectorProduct_z >= 0) {
            this.rotateAngle = rotateAngle + angle
          } else {
            this.rotateAngle = rotateAngle - angle
          }
        }
        const disableRotate = (event) => {
          if(!rotateStart) return
          event = event || window.event
          let _touch1, _touch2
          for(let i = 0; i < event.touches.length; i++) {
            if(event.touches[i].identifier === touch1Id) _touch1 = event.touches[i]
            if(event.touches[i].identifier === touch2Id) _touch2 = event.touches[i]
          }
          if(event.type === 'touchcancel' || !(_touch1 && _touch2)) {
            rotateStart = false
            startVector.x = null
            startVector.y = null
            touch1Id = null
            touch2Id = null
            rotateAngle = null
          }
        }
        this.canvas.addEventListener('touchstart', enableRotate)
        this.canvas.addEventListener('touchmove', rotating)
        document.addEventListener('touchend', disableRotate)
        document.addEventListener('touchcancel', disableRotate)
        this._disposeRotate = () => {
          this.canvas.removeEventListener('touchstart', enableRotate)
          this.canvas.removeEventListener('touchmove', rotating)
          document.removeEventListener('touchend', disableRotate)
          document.removeEventListener('touchcancel', disableRotate)
        }
      },
      cancelCrop() {
        this.$emit('cancel-crop-image')
      },
      confirmCrop() {
        if(this.waitingAni.start) return
        this.startWaitingAni()
        let point = {
          x: parseInt(this.canvasWidth / 2 - ((this.cropFrameSize - 2) / 2)) + 0.5,
          y: parseInt(this.canvasHeight / 2 - ((this.cropFrameSize - 2) / 2)) + 0.5,
        }
        let imageData = this.ctx.getImageData(point.x, point.y, this.cropFrameSize - 2, this.cropFrameSize - 2)
        let canvas1 = document.createElement('canvas')
        canvas1.width = this.cropFrameSize
        canvas1.height = this.cropFrameSize
        let ctx1 = canvas1.getContext('2d')
        ctx1.putImageData(imageData, 0, 0)
        if(this.outType === 'base64') {
          this.closeWaitingAni()
          this.$emit('confirm-crop-image', canvas1.toDataURL())
        } else {
          canvas1.toBlob((blob) => {
            this.closeWaitingAni()
            this.$emit('confirm-crop-image', blob)
          }, 'image/jpg', 1)
        }
      },
      getImage(callback) {
        let point = {
          x: parseInt(this.canvasWidth / 2 - ((this.cropFrameSize - 2) / 2)) + 0.5,
          y: parseInt(this.canvasHeight / 2 - ((this.cropFrameSize - 2) / 2)) + 0.5,
        }
        let imageData = this.ctx.getImageData(point.x, point.y, this.cropFrameSize - 2, this.cropFrameSize - 2)
        let canvas1 = document.createElement('canvas')
        canvas1.width = this.cropFrameSize
        canvas1.height = this.cropFrameSize
        let ctx1 = canvas1.getContext('2d')
        ctx1.putImageData(imageData, 0, 0)
        if(this.outType === 'base64') {
          this.closeWaitingAni()
          return canvas1.toDataURL()
        } else {
          this.closeWaitingAni()
          canvas1.toBlob(callback, 'image/jpg', 1)
        }
      },
      startWaitingAni() {
        this.waitingAni.start = true
        this.waitingAni.timer = setInterval(() => {
          let color = this.waitingAni.colors[2]
          this.waitingAni.colors.splice(2, 1)
          this.waitingAni.colors.unshift(color)
        }, 250)
      },
      closeWaitingAni() {
        this.waitingAni.start = false
        clearInterval(this.waitingAni.timer)
      },
      draw() {
        if(!(this.canvas && this.img)) return
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
        this.ctx.save()
        let x = this.position.x - (this.imgNaturalWidth * this.scale / 2)
        let y = this.position.y - (this.imgNaturalHeight * this.scale / 2)
        let width = this.imgNaturalWidth * this.scale
        let height = this.imgNaturalHeight * this.scale
        this.ctx.translate(this.position.x, this.position.y)
        this.ctx.rotate(this.rotateAngle * (Math.PI / 180))
        this.ctx.drawImage(this.img, -width / 2, (-height / 2), width, height)
        this.ctx.restore()
        this.drawCropFrame()
        if(this.waitingAni.start) {
          for(let i = 0; i < this.waitingAni.colors.length; i++) {
            this.ctx.save()
            this.ctx.fillStyle = this.waitingAni.colors[i]
            this.ctx.beginPath()
            let x, y
            if(i === 0) {
              x = this.canvasWidth / 2 - 15
              y = this.canvasHeight / 2
            } else if(i === 1) {
              x = this.canvasWidth / 2
              y = this.canvasHeight / 2
            } else {
              x = this.canvasWidth / 2 + 15
              y = this.canvasHeight / 2
            }
            this.ctx.arc(x, y, this.waitingAni.size, 0, Math.PI * 2, true)
            this.ctx.fill()
            this.ctx.restore()
          }
        }
        this.AnimationFrameId = window.requestAnimationFrame(this.draw)
      },
    },
    mounted() {},
    beforeDestroy() {
      this.wt.dispose()
      window.removeEventListener('touchmove', this.forbidPageScale)
      window.cancelAnimationFrame(this.AnimationFrameId)
      this._disposeScale()
      this._disposeTranslate() 
      !this.is_pc() && this._disposeRotate()
      this.closeWaitingAni()
    }
  }
</script>
<style lang='scss'>
  @import "./iconfont/iconfont.css";
  .meImageCrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
    .meImageCrop-canvas {
      width: 100%;
      height: 100%;
      background-color: rgb(250, 250, 250);
      background-image: linear-gradient( 45deg, rgb(224, 224, 224) 25%, transparent 25%, transparent 75%, rgb(224, 224, 224) 75%), linear-gradient( 45deg, rgb(224, 224, 224) 25%, transparent 25%, transparent 75%, rgb(224, 224, 224) 75%);
      background-size: 36px 36px;
      background-position: 0px 0px, 18px 18px;
    }
    .meImageCrop-btns {
      position: absolute;
      .meImageCrop-btn {
        display: inline-block;
        vertical-align: middle;
        margin-left: 15px;
        background-size: 100%100%;
        cursor: pointer;
      }
    }
  }
</style>