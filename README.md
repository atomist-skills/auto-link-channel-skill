# `atomist/auto-link-channel-skill`

<!---atomist-skill-description:start--->

Link chat channels to GitHub repositories

<!---atomist-skill-description:end--->

---

<!---atomist-skill-readme:start--->

# What it's useful for

Enable ChatOps for all of your GitHub repository activity. This skill will
streamline the process of creating channels, linking them to repositories and
inviting repository contributors to the channels.

When channels are linked to repositories, you get actionable notifications from
the [GitHub Notifications](https://go.atomist.com/catalog/skills/atomist/github-notifications-skill)
skill.

-   Safes you time by setting up ChatOps for your team's GitHub activity
-   Increase visibility into what's happening in your repositories across your
    organization

# Before you get started

Connect and configure this integration:

1. **GitHub**
1. **Slack or Microsoft Teams**

The **GitHub** integration must be configured in order to use this skill. At
least one repository must be selected. The **Slack** or **Microsoft Teams**
integration are required to successfully link channels.

We recommend installing the [GitHub Notifications](https://go.atomist.com/catalog/skills/atomist/github-notifications-skill)
skill in order to receive notifications for your GitHub activity.

# How to configure

1. **Always invite committers**

    With this setting you can control if you want the skill to always invite
    chat users to linked channels when they push to repositories.

1. **Allow committers to opt out**

    Some committers might not want to get invited to channels when they commit
    and push to repositories. GitHub logins or chat user names of such uers can
    be added here to prevent invitations to go out.

1. **Prefix channel names**

    Use this setting to prefix the names of newly created channels for better
    grouping.

    By default, this skill creates channels named after the repository. Manually
    renamed or linked channels will not get renamed.

1. **Determine repository scope**

    By default, this skill will be enabled for all repositories in all
    organizations you have connected.

    To restrict the organizations or specific repositories on which the skill
    will run, you can explicitly choose organization(s) and repositories.

# How to manage linked channels and invite users

1. **Set up the skill**

1. **Commit and push changes to your GitHub repositories**

1. **See how the skill creates channels and invites colleagues who work on the same repositories!**

To create feature requests or bug reports, create an [issue in the repository for this skill](https://github.com/atomist-skills/npm-license-usage-skill/issues).
See the [code](https://github.com/atomist-skills/npm-license-usage-skill) for the skill.

<!---atomist-skill-readme:end--->

---

Created by [Atomist][atomist].
Need Help? [Join our Slack workspace][slack].

[atomist]: https://atomist.com/ "Atomist - How Teams Deliver Software"
[slack]: https://join.atomist.com/ "Atomist Community Slack"
