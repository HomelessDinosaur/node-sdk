import { DocumentRef, DocumentStructure } from './document-ref';
export declare class DocumentSnapshot<T extends DocumentStructure> {
    readonly ref: DocumentRef<T>;
    readonly content: T;
    constructor(ref: DocumentRef<T>, content: T);
    get id(): string;
}
