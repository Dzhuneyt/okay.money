import {PreSignUpTriggerHandler} from "aws-lambda";

export const handler: PreSignUpTriggerHandler = async (event) => {
    // This is required so the POST_CONFIRMATION hook is automatically called
    // regardless if the user is created through email/password OR Google iDP federated login
    event.response.autoConfirmUser = true;
    return event;
}
