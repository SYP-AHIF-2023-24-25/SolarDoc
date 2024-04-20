defmodule SolardocPhoenixWeb.EditorChannelJSON do
  alias SolardocPhoenix.EditorChannels.EditorChannel
  alias SolardocPhoenix.Accounts.User
  alias SolardocPhoenix.Utils

  @doc """
  Renders a list of editor_channels.
  """
  def index(%{editor_channels: editor_channels}) do
    for(editor_channel <- editor_channels, do: data(editor_channel))
  end

  @doc """
  Renders a single editor_channel.
  """
  def show(%{editor_channel: editor_channel}) do
    data(editor_channel)
  end

  defp data(%EditorChannel{} = editor_channel) do
    %{
      id: editor_channel.id,
      name: editor_channel.name,
      description: editor_channel.description,
      creator: data(editor_channel.creator),
      active_since: Utils.naive_datetime_to_unix_milliseconds(editor_channel.active_since),
    }
  end

  defp data(%User{} = user) do
    %{
      id: user.id,
      username: user.username,
    }
  end
end
