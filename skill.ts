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

import {
	Category,
	parameter,
	ParameterType,
	resourceProvider,
	skill,
} from "@atomist/skill";
import { PushToUnmappedRepoConfiguration } from "./lib/configuration";

export const Skill = skill<PushToUnmappedRepoConfiguration & { repos: any }>({
	name: "auto-link-channel-skill",
	namespace: "atomist",
	displayName: "Auto-Link Chat Channels",
	description: "Link chat channels to GitHub repositories",
	categories: [Category.Chat],

	runtime: {
		memory: 512,
		timeout: 60,
	},

	resourceProviders: {
		github: resourceProvider.gitHub({ minRequired: 1 }),
		chat: resourceProvider.chat({ minRequired: 1 }),
	},

	parameters: {
		invite: {
			type: ParameterType.Boolean,
			displayName: "Invite committers",
			description: "Invite committers to linked channel",
			required: true,
		},
		ignore: {
			type: ParameterType.StringArray,
			displayName: "Ignore committers",
			description:
				"List committers who should not get invited to linked channels (can be chat user names or GitHub logins)",
			required: false,
		},
		prefix: {
			type: ParameterType.String,
			displayName: "Channel prefix",
			description: "Prefix for newly created linked channels",
			required: false,
		},
		repos: parameter.repoFilter({ required: false }),
	},
});
