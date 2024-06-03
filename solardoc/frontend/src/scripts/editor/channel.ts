import {type File, getV1EditorChannelsById, type UserPrivate} from '@/services/phoenix/gen/phoenix-rest-service'
import { joinChannel } from '@/scripts/channel/join-channel'
import type {CreateEditorChannel, EditorChannel} from '@/services/phoenix/editor-channel'
import { PhoenixRestError } from '@/services/phoenix/errors'
import {createChannel} from "@/scripts/channel/create-channel";

async function getChannelFromId(channelId: string, token: string): Promise<EditorChannel> {
  let resp: Awaited<ReturnType<typeof getV1EditorChannelsById>>
  try {
    resp = await getV1EditorChannelsById(token, channelId)
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
 * @param user The user to create the channel for.
 * @param token The token to authenticate the request with.
 * @returns The channel that was created or joined.
 * @since 0.7.0
 */
export async function createOrJoinChannelForFile(
  file: File,
  user: UserPrivate,
  token: string
): Promise<EditorChannel> {
  if (file.channel_id) {
    const channel = await getChannelFromId(file.channel_id, token)
    await joinChannel(channel)
    return channel
  } else {
    return await createChannel({
      name: file.file_name,
      description: '',
      password: '',
      file_id: file.id,
    } satisfies CreateEditorChannel)
  }
}
