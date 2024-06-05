defmodule SolardocPhoenixWeb.ShareURLJSON do
  alias SolardocPhoenix.ShareURLs.ShareURL
  alias SolardocPhoenix.Utils
  alias SolardocPhoenix.Files.File
  alias SolardocPhoenix.Accounts.User
  alias SolardocPhoenix.EditorChannels.EditorChannel

  @doc """
  Renders a list of share_urls.
  """
  def index(%{share_urls: share_urls}) do
    for(share_url <- share_urls, do: share_data(share_url))
  end

  @doc """
  Renders a single share_url.
  """
  def show_file(%{file: file}) do
    file_data(file)
  end

  defp file_data(%File{} = file) do
    %{
      id: file.id,
      file_name: file.file_name,
      last_edited: Utils.naive_datetime_to_unix_milliseconds(file.last_edited),
      content: file.content,
      created: Utils.naive_datetime_to_unix_milliseconds(file.created),
      owner_id: file.owner_id,
      channel_id: file.channel_id
    }
  end

  def show_share(%{share_url: share_url}) do
    share_data(share_url)
  end

  defp share_data(%ShareURL{} = share_url) do
    %{
      id: share_url.id,
      file_id: share_url.file_id,
      issued_at: Utils.naive_datetime_to_unix_milliseconds(share_url.issued_at),
      perms: share_url.perms,
      expires_at: Utils.naive_datetime_to_unix_milliseconds(share_url.expires_at),
      expired: share_url.expired
    }
  end

  def show_channel(%{editor_channel: editor_channel}) do
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
