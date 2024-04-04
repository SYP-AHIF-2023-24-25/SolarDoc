defmodule SolardocPhoenixWeb.ShareURLController do
  use SolardocPhoenixWeb, :controller
  use PhoenixSwagger, except: [:delete]

  alias SolardocPhoenix.Share
  alias SolardocPhoenix.Share.ShareURL

  action_fallback SolardocPhoenixWeb.FallbackController
  @api_path SolardocPhoenixWeb.v1_api_path()

  def swagger_definitions do
    %{
      #TODO!! add definition for a share_url
      Error: swagger_schema do
        title "Error"
        description "An error"
        properties do
          detail :string, "Error message", required: true
        end
      end,
      Errors: swagger_schema do
        title "Errors"
        description "A list of errors"
        type :array
        items Schema.ref(:Error)
      end
    }
  end

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
