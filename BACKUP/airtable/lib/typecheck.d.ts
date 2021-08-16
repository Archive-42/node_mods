declare type CheckValue = any;
declare function check<Value, Error>(fn: (value: CheckValue) => value is Value, error: Error): (value: Value) => {
    pass: true;
} | {
    pass: false;
    error: Error;
};
declare namespace check {
    var isOneOf: (options: any) => any;
    var isArrayOf: <Value>(itemValidator: (value: any) => value is Value) => (value: any) => value is Value[];
}
export = check;