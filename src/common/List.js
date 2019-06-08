/*
 * Copyright (c) 2018. 老脸叔叔创建，版权归老脸叔叔所有
 */
let _values = Symbol('List中的数据数组');
export default class List {

    constructor() {
        this[_values] = [];
    }

    get length() {
        return this[_values].length;
    }

    get size() {
        return this.length;
    }

    get array() {
        return this[_values];
    }

    exchangePosition(index1, index2) {
        if (index1 == index2) return;
        let temp = this[_values][index1];
        this[_values][index1] = this[_values][index2];
        this[_values][index2] = temp;
    }

    set(index, value) {
        if (index >= this.size) {
            return;
        }
        this[_values][index] = value;
    }

    isEmpty() {
        return (this.size === 0);
    }

    get(index) {
        return this[_values][index];
    }

    addAll(list) {
        for (let j = 0; j < list.length; j++) {
            let value = null;
            if (list instanceof Array) {
                value = list[j];
            } else {
                value = list.get(j);
            }
            if (value != null)
                this.add(value);
        }
    }

    indexOf(value) {
        return this[_values].indexOf(value);
    }

    add(value) {
        this[_values].push(value);
    }

    push(value) {
        this[_values].push(value);
    }

    pop() {
        this[_values].pop();
    }

    insert(value, index) {
        this[_values].splice(index, 0, value);
    }

    delete(index) {
        if (index >= 0 && index < this[_values].length)
            this[_values].splice(index, 1);
    }

    remove(value) {
        for (let i = 0; i < this.length; i++) {
            if (this.get(i) == value) {
                this[_values].splice(i, 1);
                return true;
            }
        }
        return false;
    }

    sort(condition) {
        function exchange(array, index, index2) {
            let temp = array[index];
            array[index] = array[index2];
            array[index2] = temp;
        }

        for (let i = 0; i < this[_values].length; i++) {
            for (let j = 0; j < this[_values].length - 1 - i; j++) {
                if (condition) {
                    if (condition(this[_values][j], this[_values][j + 1])) {
                        exchange(this[_values], j, j + 1)
                    }
                } else {
                    if (this[_values][j] > this[_values][j + 1]) {
                        exchange(this[_values], j, j + 1)
                    }
                }
            }
        }
    }


    forEach(callback){
        this[_values].forEach(callback);
    }

    contains(value) {
        for (let i = 0; i < this.length; i++) {
            var v = this.get(i);
            if (v == value) return true;
        }
        return false;
    }

    clean(flag) {
        if (flag) {
            this[_values] = [];
        } else {
            this[_values].length = 0;
        }
    }
}