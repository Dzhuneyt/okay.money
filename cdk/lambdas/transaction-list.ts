export const handler = async (event: any) => {
    console.log('Lambda called')
    console.log(event)
    return {
        statusCode: 200,
        body: "Hello body",
    }
}
