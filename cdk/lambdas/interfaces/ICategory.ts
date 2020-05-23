interface ICategory {
    id?: string;
    title: string;

    // Since the input is unpredictable, allow any other values
    // to "checked" by the code below without causing compilation errors
    [key: string]: any,
}
