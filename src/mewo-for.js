import { Mewo } from "./mewo.js";

export class MewoFor {
    template;
    mnt_target;
    element;

    constructor(template, target, type="div") {
        this.template = template;
        this.mnt_target = target;
        this.element = Mewo(type, true);
    }

    bind(ref) {
        ref.value.forEach(item => {
            this.template(item).mount(this.element.el);
        });

        ref.events.push((...args) => {
            switch (args[0]) {
                case "push":
                    this.template(args[1]).mount(this.element.el);
                    break;
                case "pop":
                    this.element.el.removeChild(this.element.el.lastChild);
                    break;
                case "shift":
                    this.element.el.removeChild(this.element.el.firstChild);
                    break;
                case "unshift":
                    this.template(args[1]).mount(this.element.el, this.element.el.firstChild);
                    break;
                case "splice":
                    const [start, deleteCount, ...items] = args.slice(1);
                    const children = this.element.el.children;
                    for (let i = 0; i < deleteCount; i++) {
                        this.element.el.removeChild(children[start]);
                    }
                    for (let i = 0; i < items.length; i++) {
                        this.template(items[i]).mount(this.element.el, children[start + i]);
                    }
                    break;
                case "sort":
                    this.element.el.innerHTML = "";
                    ref.value.forEach(item => {
                        this.template(item).mount(this.element.el);
                    });
                    break;
                case "reverse":
                    this.element.el.innerHTML = "";
                    ref.value.forEach(item => {
                        this.template(item).mount(this.element.el);
                    });
                    break;
            }
        })
        return this;
    }

    mount() {
        this.element.mount(this.mnt_target);
        return this;
    }
}