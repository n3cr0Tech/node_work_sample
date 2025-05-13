import { ThrowErrorMessage } from "../src/utils/errorHandler";

test('ThrowErrorMessage throws error', () => {
    let t = ThrowErrorMessage;   
    expect(t).toThrowError(Error);   
});

test('ThrowErrorMessage output string passed to it', () => {
    expect(() => {
        ThrowErrorMessage('foo-message');
    }).toThrow('foo-message');
});