## Before you get started

Connect and configure these integrations:

1.  [**GitHub**][github] _(required)_
2.  [**Slack**][slack] or [**Microsoft Teams**][msteams] _(required)_

[github]: https://go.atomist.com/catalog/integration/github "GitHub Integration"
[slack]: https://go.atomist.com/catalog/integration/slack "Slack Integration"
[msteams]:
    https://go.atomist.com/catalog/integration/microsoft-teams
    "Microsoft Teams Integration"

We recommend installing the
[GitHub Notifications](https://go.atomist.com/catalog/skills/atomist/github-notifications-skill)
skill in order to receive notifications for your GitHub activity.

## How to configure

1.  **Always invite committers**

    With this setting you can control if you want the skill to always invite
    chat users to linked channels when they push to repositories.

1.  **Allow committers to opt out**

    Some committers might not want to get invited to channels when they commit
    and push to repositories. GitHub logins or chat user names of such uers can
    be added here to prevent invitations to go out.

1.  **Prefix channel names**

    Use this setting to prefix the names of newly created channels for better
    grouping.

    By default, this skill creates channels named after the repository. Manually
    renamed or linked channels will not get renamed.

1.  **Determine repository scope**

    ![Repository filter](docs/images/repo-filter.png)

    By default, this skill will be enabled for all repositories in all
    organizations you have connected.

    To restrict the organizations or specific repositories on which the skill
    will run, you can explicitly choose organizations and repositories.

1.  **Activate the skill**

    ![Enable skill](docs/images/enable.png)

    Save your configuration and activate the skill by clicking the "Enable
    skill" button.
