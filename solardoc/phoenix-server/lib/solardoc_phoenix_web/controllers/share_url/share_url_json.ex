defmodule SolardocPhoenixWeb.ShareURLJSON do
  alias SolardocPhoenix.Share.ShareURL
  alias SolardocPhoenix.Utils
  alias SolardocPhoenix.Files.File

  @doc """
  Renders a list of share_urls.
  """
  def index(%{share_urls: share_urls}) do
    %{data: for(share_url <- share_urls, do: share_data(share_url))}
  end

  @doc """
  Renders a single share_url.
  """
  def show_file(%{file: file}) do
    %{data: file_data(file)}
  end

  defp file_data(%File{} = file) do
    %{
      id: file.id,
      file_name: file.file_name,
      last_edited: Utils.naive_datetime_to_unix_milliseconds(file.last_edited),
      content: file.content,
      created: file.created,
      owner_id: file.owner_id
    }
  end

  def show(%ShareURL{} = share_url) do
    %{data: share_data(share_url)}
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
end
