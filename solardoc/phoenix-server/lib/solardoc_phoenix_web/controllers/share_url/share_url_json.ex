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
      issued_at: if share_url.issued_at do
        share_url.issued_at |> DateTime.from_naive!("Etc/UTC") |> DateTime.to_unix(:millisecond)
      else
        nil
      end,
      perms: share_url.perms,
      expires_at: if share_url.expires_at do
        share_url.expires_at |> DateTime.from_naive!("Etc/UTC") |> DateTime.to_unix(:millisecond)
      else
        nil
      end,
      expired: share_url.expired
    }
  end
end
