import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {GithubActionsIdentityProvider, GithubActionsRole} from "aws-cdk-github-oidc";

export class GithubOidcProviderStack extends Stack {

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);
        const provider = new GithubActionsIdentityProvider(scope, 'GithubProvider');

        new GithubActionsRole(scope, 'UploadRole', {
            provider: provider,           // reference into the OIDC provider
            owner: 'octo-org',            // your repository owner (organization or user) name
            repo: 'octo-repo',            // your repository name (without the owner name)
            filter: 'ref:refs/tags/v*',   // JWT sub suffix filter, defaults to '*'
        });
    }
}
