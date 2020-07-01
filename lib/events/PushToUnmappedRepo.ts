/*
 * Copyright © 2020 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { EventHandler } from "@atomist/skill";
import * as _ from "lodash";
import { PushToUnmappedRepoConfiguration } from "../configuration";
import { PushToUnmappedRepoSubscription } from "../typings/types";

const CreateChannelMutation = `mutation createSlackChannel($teamId: String!, $name: String!) {
  createSlackChannel(chatTeamId: $teamId, name: $name) {
    id
  }
}
`;

interface CreateChannelResponse {
    createSlackChannel: {
        id: string;
    };
}

const AddBotToChannelMutation = `mutation addBotToSlackChannel($teamId: String!, $channelId: String!) {
  addBotToSlackChannel(chatTeamId: $teamId, channelId: $channelId) {
    id
  }
}
`;

const LinkChannelToRepoMutation = `mutation linkSlackChannelToRepo(
  $teamId: String!
  $channelId: String!
  $channelName: String!
  $repo: String!
  $owner: String!
  $providerId: String
) {
  linkSlackChannelToRepo(
    chatTeamId: $teamId
    channelId: $channelId
    channelName: $channelName
    repo: $repo
    owner: $owner
    providerId: $providerId
  ) {
    id
  }
}
`;

const InviteUserToChannelMutation = `mutation inviteUserToSlackChannel(
  $teamId: String!
  $channelId: String!
  $userId: String!
) {
  inviteUserToSlackChannel(
    chatTeamId: $teamId
    channelId: $channelId
    userId: $userId
  ) {
    id
  }
}
`;

/**
 * Event handler to automatically create and map chat channels to repositories
 */
export const handler: EventHandler<PushToUnmappedRepoSubscription, PushToUnmappedRepoConfiguration> = async ctx => {
    const push = ctx.data.Push[0];
    const repo = push.repo;

    const teamId = repo?.org?.chatTeam?.id;
    if (!teamId) {
        return {
            code: 0,
            reason: `No ChatTeam linked to this workspace`,
        };
    }

    const channelIds = [];
    if (repo.channels?.length === 0) {
        const name = repoChannelName(
            ctx.configuration?.[0]?.parameters?.prefix
                ? `${!!ctx.configuration?.[0]?.parameters?.prefix}-${repo.name}`
                : repo.name,
        );

        const channel = await ctx.graphql.mutate<CreateChannelResponse>(CreateChannelMutation, { teamId, name });
        channelIds.push(channel?.createSlackChannel?.id);
        await ctx.graphql.mutate(AddBotToChannelMutation, { teamId, channelId: channelIds[0] });
        // Link repo to channel
        await ctx.graphql.mutate(LinkChannelToRepoMutation, {
            teamId,
            channelId: channelIds[0],
            channelName: name,
            repo: repo.name,
            owner: repo.owner,
            providerId: repo.org.provider.providerId,
        });
    } else {
        channelIds.push(...repo.channels.map(c => c.channelId));
    }

    for (const channelId of channelIds) {
        // Invite committers
        if (ctx.configuration?.[0]?.parameters?.invite) {
            const ignore = ctx.configuration?.[0]?.parameters?.ignore || [];
            const commits = push.commits.filter(c => {
                if (!!c.committer?.login && ignore.includes(c.committer.login)) {
                    return false;
                }
                if (
                    !!c.committer?.person?.chatId?.screenName &&
                    ignore.includes(c.committer.person.chatId.screenName)
                ) {
                    return false;
                }
                return true;
            });
            const userIds = _.uniq(
                commits
                    .filter(c => !!c.committer?.person?.chatId?.userId)
                    .map(c => c.committer?.person?.chatId?.userId),
            );
            for (const userId of userIds) {
                await ctx.graphql.mutate(InviteUserToChannelMutation, { teamId, channelId, userId });
            }
        }
    }
    return {
        code: 0,
        reason: `Linked repository [${repo.owner}/${repo.name}](${repo.url}) to channel and invited committers`,
    };
};

/**
 * Generate valid Slack channel name for a repository name.
 *
 * @param repoName valid GitHub repository name
 * @return valid Slack channel name based on repository name
 */
export function repoChannelName(repoName: string): string {
    return repoName ? repoName.substring(0, 80).replace(/\./g, "_").toLowerCase() : repoName;
}
