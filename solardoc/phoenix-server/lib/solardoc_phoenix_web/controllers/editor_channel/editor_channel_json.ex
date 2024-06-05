defmodule SolardocPhoenixWeb.EditorChannelJSON do
  alias SolardocPhoenix.EditorChannels.EditorChannel
  alias SolardocPhoenix.Accounts.User
  alias SolardocPhoenix.Utils

  @doc """
  Renders a list of editor_channels.
  """
  def index(%{editor_channels: editor_channels}) do
    for(editor_channel <- editor_channels, do: channel_data(editor_channel))
  end

  @doc """
  Renders a single editor_channel.
  """
  def show(%{editor_channel: editor_channel}) do
    channel_data(editor_channel)
  end

  defp channel_data(%EditorChannel{} = editor_channel) do
    %{
      id: editor_channel.id,
      name: editor_channel.name,
      description: editor_channel.description,
      creator: user_data(editor_channel.creator),
      active_since: Utils.naive_datetime_to_unix_milliseconds(editor_channel.active_since),
    }
  end

  defp user_data(%User{} = user) do
    %{
      id: user.id,
      username: user.username,
    }
  end
end
