defmodule SolardocPhoenixWeb.EditorChannelJSON do
  alias SolardocPhoenix.EditorChannels.EditorChannel
  alias SolardocPhoenix.Accounts.User

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
      active_since: if editor_channel.active_since do
        editor_channel.active_since |> DateTime.from_naive!("Etc/UTC") |> DateTime.to_unix(:millisecond)
      else
        nil
      end,
    }
  end

  defp data(%User{} = user) do
    %{
      id: user.id,
      username: user.username,
    }
  end
end
