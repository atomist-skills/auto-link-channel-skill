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
import {
	AddBotToChannelMutation,
	AddBotToChannelMutationVariables,
	CreateChannelMutation,
	CreateChannelMutationVariables,
	InviteUserToChannelMutation,
	InviteUserToChannelMutationVariables,
	LinkChannelToRepoMutation,
	LinkChannelToRepoMutationVariables,
	PushToUnmappedRepoSubscription,
} from "../typings/types";

/**
 * Event handler to automatically create and map chat channels to repositories
 */
export const handler: EventHandler<
	PushToUnmappedRepoSubscription,
	PushToUnmappedRepoConfiguration
> = async ctx => {
	const push = ctx.data.Push[0];
	const repo = push.repo;

	const teamId = repo?.org?.chatTeam?.id;
	if (!teamId) {
		return {
			code: 0,
			reason: `No ChatTeam linked to this workspace`,
		};
	}

	const channelIds: Array<{ id: string; name: string }> = [];
	if (repo.channels?.length === 0) {
		const name = repoChannelName(
			ctx.configuration?.parameters?.prefix
				? `${!!ctx.configuration?.parameters?.prefix}-${repo.name}`
				: repo.name,
		);

		const channel = await ctx.graphql.mutate<
			CreateChannelMutation,
			CreateChannelMutationVariables
		>("createChannel.graphql", { teamId, name });
		await ctx.audit.log(`Created or updated channel '${name}'`);
		channelIds.push({ id: channel?.createSlackChannel?.id, name });

		// For slack we need to invite the bot; this can be skipped for MSTeams
		if (push?.repo?.org?.chatTeam?.provider === "slack") {
			await ctx.graphql.mutate<
				AddBotToChannelMutation,
				AddBotToChannelMutationVariables
			>("addBotToChannel.graphql", {
				teamId,
				channelId: channelIds[0].id,
			});
			await ctx.audit.log(`Invite @atomist bot to channel '${name}'`);
		}

		// Link repo to channel
		await ctx.graphql.mutate<
			LinkChannelToRepoMutation,
			LinkChannelToRepoMutationVariables
		>("linkChannelToRepo.graphql", {
			teamId,
			channelId: channelIds[0].id,
			channelName: name,
			repo: repo.name,
			owner: repo.owner,
			providerId: repo.org.provider.providerId,
		});
		await ctx.audit.log(
			`Linked repository '${repo.owner}/${repo.name}' to channel '${name}'`,
		);
	} else {
		channelIds.push(
			...repo.channels.map(c => ({ id: c.channelId, name: c.name })),
		);
	}

	for (const channelId of channelIds) {
		// Invite committers
		if (ctx.configuration?.parameters?.invite) {
			const ignore = ctx.configuration?.parameters?.ignore || [];
			const commits = push.commits.filter(c => {
				if (
					!!c.committer?.login &&
					ignore.includes(c.committer.login)
				) {
					return false;
				}
				if (
					!!c.committer?.person?.chatId?.screenName &&
					ignore.includes(c.committer?.person?.chatId?.screenName)
				) {
					return false;
				}
				return true;
			});
			const userIds: Array<{ id: string; name: string }> = _.uniq(
				commits
					.filter(c => !!c.committer?.person?.chatId?.userId)
					.map(c => ({
						id: c.committer?.person?.chatId?.userId,
						name: c.committer?.login,
					})),
			);
			for (const userId of userIds) {
				await ctx.graphql.mutate<
					InviteUserToChannelMutation,
					InviteUserToChannelMutationVariables
				>("inviteUserToChannel.graphql", {
					teamId,
					channelId: channelId.id,
					userId: userId.id,
				});
				await ctx.audit.log(
					`Invited user '${userId.name}' to channel '${channelId.name}'`,
				);
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
	return repoName
		? repoName.substring(0, 80).replace(/\./g, "_").toLowerCase()
		: repoName;
}
