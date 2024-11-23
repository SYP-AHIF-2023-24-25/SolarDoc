import {
  type File,
  getV2EditorChannelsById,
  getV2ShareByIdChannel,
} from '@/services/phoenix/gen/phoenix-rest-service'
import { joinChannel } from '@/scripts/channel/join-channel'
import type { CreateEditorChannel, EditorChannel } from '@/services/phoenix/editor-channel'
import { PhoenixRestError } from '@/services/phoenix/errors'
import { createChannel } from '@/scripts/channel/create-channel'

/**
 * Get a channel from its ID or its ShareURL ID.
 * @param channelOrShareURLId The ID of the channel or the ShareURL ID.
 * @param token The token to authenticate the request with.
 * @param isShared Whether the channel is accessed through a ShareURL.
 * @returns The channel which was found for the given ID.
 * @since 0.7.0
 */
async function getChannelFromId(
  channelOrShareURLId: string,
  token: string,
  isShared: boolean = false,
): Promise<EditorChannel> {
  let resp: Awaited<ReturnType<typeof getV2EditorChannelsById>>
  try {
    resp = isShared
      ? await getV2ShareByIdChannel(token, channelOrShareURLId)
      : await getV2EditorChannelsById(token, channelOrShareURLId)
  } catch (e) {
    throw new PhoenixRestError(
      'Error getting channel',
      500,
      'Please try again later. If the problem persists, contact the developers.',
    )
  }

  if (resp.status === 200) {
    return resp.data
  } else {
    throw new PhoenixRestError(
      'Error getting channel',
      resp.status,
      'Failed to find channel for file. Please reload the page and try again. If the problem persists, contact the developers.',
      'PhoenixRestError',
      { hideErrorCode: true },
    )
  }
}

/**
 * Create a channel for a file if it doesn't exist, or join the channel if it does.
 * @param file The file to create or join a channel for.
 * @param token The token to authenticate the request with.
 * @param shareURLID The ShareURL ID through which the channel can be requested.
 * @returns The channel that was created or joined.
 * @since 0.7.0
 */
export async function createOrJoinChannelForFile(
  file: File,
  token: string,
  shareURLID?: string,
): Promise<EditorChannel> {
  let channel_id = file.channel_id
  if (!channel_id) {
    channel_id = (
      await createChannel({
        name: file.file_name,
        description: '',
        password: '',
        file_id: file.id,
      } satisfies CreateEditorChannel)
    ).id
  }
  const channel = await getChannelFromId(shareURLID ?? channel_id, token, shareURLID !== undefined)
  await joinChannel(channel)
  return channel
}
