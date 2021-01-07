export interface ITransaction {
    id?: string;
    description: string,
    sum: number,
    type: "expense" | "income",
    account_id: string,
    category_id: string,

    // Since the input is unpredictable, allow any other values
    // to "checked" by the code below without causing compilation errors
    [key: string]: any,
}
