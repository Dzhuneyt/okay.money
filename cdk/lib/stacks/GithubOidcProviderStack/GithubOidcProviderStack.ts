import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {GithubActionsIdentityProvider, GithubActionsRole} from "aws-cdk-github-oidc";

export class GithubOidcProviderStack extends Stack {

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);
        const provider = new GithubActionsIdentityProvider(this, 'GithubProvider');

        new GithubActionsRole(this, 'GithubActionsRole', {
            provider: provider,           // reference into the OIDC provider
            owner: 'Dzhuneyt',            // your repository owner (organization or user) name
            repo: 'okay.money',            // your repository name (without the owner name)
            roleName: 'github-actions',
        });
    }
}
