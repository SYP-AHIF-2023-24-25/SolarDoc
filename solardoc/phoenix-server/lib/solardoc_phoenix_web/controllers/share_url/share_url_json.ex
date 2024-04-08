defmodule SolardocPhoenixWeb.ShareURLJSON do
  alias SolardocPhoenix.Share.ShareURL
  alias SolardocPhoenix.Utils

  @doc """
  Renders a list of share_urls.
  """
  def index(%{share_urls: share_urls}) do
    %{data: for(share_url <- share_urls, do: data(share_url))}
  end

  @doc """
  Renders a single share_url.
  """
  def show(%{share_url: share_url}) do
    %{data: data(share_url)}
  end

  defp data(%ShareURL{} = share_url) do
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
