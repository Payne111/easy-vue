//匹配指令
const directiveReg = /v-\S+=(('\s*[a-z_\$][a-z\d_\$]+\s*')|("\s*[a-z_\$][a-z\d_\$]+\s*"))/gi


// 指令库

const directiveLib = {
    'v-model': {
        bind($scope, broadcastObj, el, prop) {
            el.value = $scope[prop]
            el.oninput = function () {
                $scope[prop] = el.value
            }
            broadcastObj[prop].push(function(val) {
                el.value = val
            })
        }
    },
    'v-on-click': {
        bind($scope, broadcastObj, el, prop) {
            el.onclick = function() {
                $scope[prop] ()
            }
        }
    },
    'v-text': {
        bind($scope, broadcastObj, el, prop) {
            el.innerHTML = $scope[prop]
            broadcastObj[prop].push(function(val) {
                el.innerHTML = val
            })
        }
    }
}

function myVue(opt) {
    this.$scope = {}
    this.broadcastObj = {} //  广播对象

    // 对data进行监听
    for(let key in opt.data) {
        this.broadcastObj[key] = [] //给每个数据建立一个广播队列
        Object.defineProperty(this.$scope, key, {
            get: () => {
                return opt.data[key]
            },
            set: val => {
                opt.data[key] = val
                this.broadcastObj[key].forEach(fn => fn(val))
            }
        })
    }
    for(let key in opt.methods) {
        this.$scope[key] = opt.methods[key]
    }
    //解析指令
    const root = document.querySelectorAll(opt.el)[0]
    const rootInnerHtml = root.innerHTML
    const directives = rootInnerHtml.match(directiveReg)

    //数据绑定
    directives.forEach(d => {
        let [k,v] = d.split('=')
        let els = root.querySelectorAll('[' + d + ']') //获取有指令的元素
        els.forEach(el => {
            el.removeAttribute(k) //删除指令
            directiveLib[k].bind(this.$scope, this.broadcastObj, el, v.replace(/"/g, '')) //数据绑定
        })
    })

}

new myVue({
    el: '#app',
    data: {
        counter: 0,
    },
    methods: {
        add() {
            this.counter ++
        }
    }
})
