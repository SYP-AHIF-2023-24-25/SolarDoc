defmodule SolardocPhoenixWeb.ShareURLController do
  use SolardocPhoenixWeb, :controller
  use PhoenixSwagger, except: [:delete]

  alias SolardocPhoenix.Share
  alias SolardocPhoenix.Share.ShareURL

  action_fallback SolardocPhoenixWeb.FallbackController
  @api_path SolardocPhoenixWeb.v1_api_path()

  def swagger_definitions do
    %{
      ShareUrl: swagger_schema do
        title "ShareUrl"
        description "A share url"
        properties do
          id :string, "Share url UUID", required: true
          file Schema.ref(:File), "File", required: true
          expired :boolean, "Is the share url expired", required: true
          issued_at :integer, "When the share url was issued in milliseconds", required: true
          perms :integer, "Permissions", required: true
          expires_at :integer, "When the share url expires in milliseconds", required: true
        end
      end,
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

  swagger_path :index do
    get "#{@api_path}/share_urls"
    produces "application/json"
    summary "list all share urls"
    deprecated false
    parameter("Authorization", :header, :string, "Bearer", required: true)
    response 200, "OK", Schema.ref(:ShareUrl)
    response 401, "Unauthorized", Schema.ref(:Errors)
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

  def delete(conn, %{"id" => id}) do
    share_url = Share.get_share_url!(id)

    with {:ok, %ShareURL{}} <- Share.delete_share_url(share_url) do
      send_resp(conn, :no_content, "")
    end
  end
end
