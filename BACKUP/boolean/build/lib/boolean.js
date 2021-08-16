"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boolean = void 0;
const boolean = function (value) {
    if (typeof value === 'string') {
        return ['true', 't', 'yes', 'y', 'on', '1'].includes(value.trim().toLowerCase());
    }
    if (typeof value === 'number') {
        return value === 1;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    return false;
};
exports.boolean = boolean;