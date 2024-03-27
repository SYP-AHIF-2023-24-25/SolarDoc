defmodule SolardocPhoenixWeb.ShareURLJSON do
  alias SolardocPhoenix.Share.ShareURL

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
      file: share_url.file,
      issued_at: share_url.issued_at,
      perms: share_url.perms,
      expires_at: share_url.expires_at,
      expired: share_url.expired
    }
  end
end
