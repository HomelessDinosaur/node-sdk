"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentSnapshot = void 0;
class DocumentSnapshot {
    constructor(ref, content) {
        this.ref = ref;
        this.content = content;
    }
    get id() {
        return this.ref.id;
    }
}
exports.DocumentSnapshot = DocumentSnapshot;
