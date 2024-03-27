defmodule SolardocPhoenixWeb.ShareURLController do
  use SolardocPhoenixWeb, :controller

  alias SolardocPhoenix.Share
  alias SolardocPhoenix.Share.ShareURL

  action_fallback SolardocPhoenixWeb.FallbackController

  def index(conn, _params) do
    share_urls = Share.list_share_urls()
    render(conn, :index, share_urls: share_urls)
  end

  def create(conn, %{"share_url" => share_url_params}) do
    with {:ok, %ShareURL{} = share_url} <- Share.create_share_url(share_url_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/share_urls/#{share_url}")
      |> render(:show, share_url: share_url)
    end
  end

  def show(conn, %{"id" => id}) do
    share_url = Share.get_share_url!(id)
    render(conn, :show, share_url: share_url)
  end

  def update(conn, %{"id" => id, "share_url" => share_url_params}) do
    share_url = Share.get_share_url!(id)

    with {:ok, %ShareURL{} = share_url} <- Share.update_share_url(share_url, share_url_params) do
      render(conn, :show, share_url: share_url)
    end
  end

  def delete(conn, %{"id" => id}) do
    share_url = Share.get_share_url!(id)

    with {:ok, %ShareURL{}} <- Share.delete_share_url(share_url) do
      send_resp(conn, :no_content, "")
    end
  end
end
