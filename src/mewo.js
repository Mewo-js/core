class MewoNode {
    el;
    mountpoint;
    
    constructor(element, mountpoint = document.body) {
        this.el = element;
        this.mountpoint = mountpoint;
    }

    css(obj) {
        for (const key in obj) {
            if (key.match(/[a-z].*[A-Z].*/g)) {
                const starts = key.match(/[A-Z]/g);
                let new_key = key;
                starts.forEach(k => {
                    new_key = new_key.replace(k, `-${k.toLowerCase()}`)
                });
                this.el.style[new_key] = obj[key];
            } else {
                this.el.style[key] = obj[key];
            }
        }
        return this;
    }

    addClass = (...list) => this.class(list);
    removeClass = (...list) => this.class(list, true);
    toggleClass = (...list) => this.class(list, false, true);

    class(list = [], remove = false, toggle = false) {
        if (!list.length)
            return this.el.classList;

        if (remove)
            list.forEach(c => this.el.classList.remove(c));
        else
            list.forEach(c => this.el.classList.add(c));

        if (toggle)
            list.forEach(c => this.el.classList.toggle(c));
        return this;
    }

    attr(name, value = null, remove = false) {
        if (value) {
            this.el.setAttribute(name, value);
            return this;
        }
        if (remove) {
            this.el.removeAttribute(name);
            return this;
        }
        return this.el.getAttribute(name);
    }

    value(value = undefined) {
        if (value != undefined) {
            this.el.value = value;
            return this;
        }
        return this.el.value;
    }

    has(type, name) {
        const attr = this.el.getAttribute(type);
        if (!attr)
            return false;
        return attr.split(" ").includes(name);
    }

    hasAttr(name) {
        return this.el.hasAttribute(name);
    }

    id(id = undefined) {
        if (id != undefined) {
            this.el.id = id;
            return this;
        }
        return this.el.id;
    }

    on(name, handler, ...options) {
        this.el.addEventListener(name, handler.bind(this), ...options);
        return this;
    }

    mount(target = this.mountpoint) {
        if (target instanceof MewoNode) {
            target.el.appendChild(this.el);
            return this;
        }
        target.appendChild(this.el);
        return this;
    }

    premount(target = this.mountpoint) {
        if (target instanceof MewoNode) {
            target.el.insertBefore(this.el, target.el.children[0]);
            return this;
        }
        target.el.insertBefore(this.el, target.children[0]);
        return this;
    }

    text(text) {
        this.el.innerText = text;
        return this;
    }

    toString() {
        return this.el;
    }

    bind(ref, callback=null) {

        if (callback)
            callback.apply(this);
        else
            this.el.innerText = ref.value;

        ref.events.push((parent=this) => {
            if (callback)
                callback.apply(parent);
            else
                this.el.innerText = ref.value;
        });
        return this;
    }

    $() {
        if (jQuery || $)
            return jQuery ? jQuery(this.el) : $(this.el);
        return this.el;
    }
}

export const Mewo = (selector, create = false, base = document.body) => {
    if (selector) {
        if (typeof selector != "string") {
            return new MewoNode(selector);
        }
        let nodes = [];

        if (!create) {
            nodes = base.querySelectorAll(selector);
        }
        if (!nodes.length) {
            nodes = [document.createElement(selector.match(/\w+/)[0])];
        }

        const huro_nodes = [];
        nodes.forEach(node => {
            huro_nodes.push(new MewoNode(node, base));
        });

        if (huro_nodes.length == 1) {
            return huro_nodes[0];
        }

        return huro_nodes;
    } else
        return null;
}

export const MewoConstructor = (target, components={}, setup=false) => {
    if (!setup) {
        for (const key in components) {
            components[key.toUpperCase()] = components[key];
            delete components[key];
        }
    }

    if (target.tagName in components) {
        components[target.tagName].apply(target);
        return;
    }

    for (const child of target.children) {
        MewoConstructor(child, components, true);
    }
}

export class MewoRef {
    val;
    events = [];

    constructor(value = null) {
        this.val = value;
        if (value.constructor == [].constructor) {
            ArrayListener(this.value, (...args) => {
                this.events.forEach(event => {
                    event(...args);
                })
            });
        }
    }

    get value() {
        return this.val;
    }

    set value(value) {
        this.val = value;
        for (const func of this.events) {
            func();
        }
    }
}

const ArrayListener = (arr, callback) => {
   ['pop', 'push', 'reverse', 'shift', 'unshift', 'splice', 'sort'].forEach((m) => {
    arr[m] = function() {
        let res = Array.prototype[m].apply(arr, arguments);
        callback.apply(arr, [m, ...arguments]);
        return res;
    }});
}