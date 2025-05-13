export function ThrowErrorMessage(errorMsg: string): never{
    throw new Error(errorMsg);
}