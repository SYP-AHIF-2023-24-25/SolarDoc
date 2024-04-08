defmodule SolardocPhoenixWeb.ShareURLController do
  use SolardocPhoenixWeb, :controller
  use PhoenixSwagger, except: [:delete]

  alias SolardocPhoenix.Share
  alias SolardocPhoenix.Share.ShareURL
  alias SolardocPhoenix.Files
  alias SolardocPhoenix.Files.File
  alias SolardocPhoenix.Accounts.User

  action_fallback SolardocPhoenixWeb.FallbackController
  @api_path SolardocPhoenixWeb.v1_api_path()

  def swagger_definitions do
    %{
      ShareUrl: swagger_schema do
        title "ShareUrl"
        description "A share URL"
        properties do
          id :string, "Share URL UUID", required: true
          file_id :string, "File that the share URL was issued for", required: true
          expired :boolean, "Expiration state", required: true
          issued_at :integer, "When the share url was issued in UNIX timestamp milliseconds", required: true
          perms :integer, "Byte-formatted Permissions", required: true
          expires_at :integer, "When the share url expires in UNIX timestamp milliseconds", required: true
        end
      end,
      CreateShareUrl: swagger_schema do
        title "CreateShareUrl"
        description "Arguments for creating a share url"
        properties do
          file_id :string, "File UUID", required: true
          perms :integer, "Byte-formatted Permissions", required: true
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

  #swagger_path :index do
  #  get "#{@api_path}/share"
  #  produces "application/json"
  #  summary "List all share urls"
  #  deprecated false
  #  parameter("Authorization", :header, :string, "Bearer", required: true)
  #  response 200, "OK", Schema.ref(:ShareUrl)
  #  response 401, "Unauthorized", Schema.ref(:Errors)
  #end

  def index(conn, _params) do
    share_urls = Share.list_share_urls()
    render(conn, :index, share_urls: share_urls)
  end

  swagger_path :create do
    post "#{@api_path}/share"
    consumes "application/json"
    produces "application/json"
    summary "Create a new share url"
    deprecated false
    parameter("Authorization", :header, :string, "Bearer", required: true)
    parameters do
      share_url :body, Schema.ref(:CreateShareUrl), "Arguments for creating a share url", required: true
    end
    response 201, "Created", Schema.ref(:ShareUrl)
    response 400, "Bad Request", Schema.ref(:Errors)
    response 401, "Unauthorized", Schema.ref(:Errors)
  end
  def create(conn, share_url_params) do

    with {:file_exists, %File{} = file} <- {:file_exists, Files.get_file!(share_url_params["file_id"])},
         {:is_owner, true} <- {:is_owner, is_owner(conn.assigns.current_user, file)} do
      with {:ok, %ShareURL{} = share_url} <- Share.create_share_url(share_url_params) do
        conn
        |> put_status(:created)
        |> put_resp_header("location", ~p"/api/share_urls/#{share_url.id}")
        |> render(:show, share_url: share_url)
      end
    else
      {:file_exists, _} -> {:error, :not_found}
      {:is_owner, false} -> {:error, :unauthorized}
    end
  end

  defp is_owner(user, file) do
    with %File{} <- file, %User{} <- user do
      user.id == file.owner_id
    end
  end

  swagger_path :show do
    get "#{@api_path}/share"
    consumes "application/json"
    produces "application/json"
    summary "Get a single share url"
    deprecated false
    parameter("Authorization", :header, :string, "Bearer", required: true)
    parameters do
      id :path, :string, "Share Url ID", required: true
    end
    response 200, "Ok", Schema.ref(:ShareUrl)
    response 401, "Unauthorized", Schema.ref(:Errors)
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
