defmodule SolardocPhoenixWeb.V2.ShareURLController do
  use SolardocPhoenixWeb, :controller
  use PhoenixSwagger, except: [:delete]

  alias SolardocPhoenix.Repo
  alias SolardocPhoenix.ShareURLs
  alias SolardocPhoenix.ShareURLs.ShareURL
  alias SolardocPhoenix.Files
  alias SolardocPhoenix.Files.File
  alias SolardocPhoenix.Accounts.User
  alias SolardocPhoenix.EditorChannels
  alias SolardocPhoenix.EditorChannels.EditorChannel

  action_fallback SolardocPhoenixWeb.FallbackController
  @api_path SolardocPhoenixWeb.v2_api_path()

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
      File: swagger_schema do
        title "File"
        description "A file which is owned by a user"
        properties do
          id :string, "File UUID", required: true
          file_name :string, "File name", required: true
          owner_id :string, "Owner id", required: true
          content :string, "File content", required: true
          last_edited :integer, "Last edited in UNIX timestamp milliseconds", required: true
          created :integer, "Creation date in UNIX timestamp milliseconds", required: true
          channel_id :string, "UUID of the channel created for this file, if one exists", required: false
          is_global :boolean, "Whether the file is global or not", required: true
        end
      end,
      EditorChannel: swagger_schema do
        title "EditorChannel"
        description "An editor channel"
        properties do
          id :string, "Editor channel UUID", required: true
          name :string, "Editor channel name", required: true
          description :string, "Editor channel description", required: true
          creator Schema.ref(:UserTrusted), "Editor channel creator", required: true
          active_since :integer, "Editor channel active since in UNIX timestamp milliseconds", required: true
        end
      end,
      ErrorResp: swagger_schema do
        title "ErrorsResp"
        description "A list of errors"
        properties do end
      end
    }
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
    response 400, "Bad Request", Schema.ref(:ErrorResp)
    response 401, "Unauthorized", Schema.ref(:ErrorResp)
  end

  def create(conn, share_url_params) do
    with {:file_exists, %File{} = file} <- {:file_exists, Files.get_file!(share_url_params["file_id"])},
         {:is_owner, true} <- {:is_owner, owner?(conn.assigns.current_user, file)} do
      with {:ok, %ShareURL{} = share_url} <- ShareURLs.create_share_url(share_url_params) do
        conn
        |> put_status(:created)
        |> put_resp_header("location", ~p"/#{@api_path}/share/#{share_url.id}")
        |> render(:show_share, share_url: share_url)
      end
    else
      {:file_exists, _} -> {:error, :not_found}
      {:is_owner, false} -> {:error, :unauthorized}
    end
  end

  swagger_path :show_share do
    get "#{@api_path}/share/{id}"
    produces "application/json"
    summary "Get a single share url"
    deprecated false
    parameter("Authorization", :header, :string, "Bearer", required: true)
    parameters do
      id :path, :string, "Share Url ID", required: true
    end
    response 200, "Ok", Schema.ref(:ShareUrl)
    response 401, "Unauthorized", Schema.ref(:ErrorResp)
    response 404, "Not Found", Schema.ref(:ErrorResp)
  end

  def show_share(conn, %{"id"=> id}) do
    case {:share_url_exists, ShareURLs.get_share_url!(id)} do
      {:share_url_exists, %ShareURL{} = share_url} ->
        render(conn, :show_share, share_url: share_url)
      {:share_url_exists, _} ->
        {:error, :not_found}
    end
  end

  swagger_path :show_file do
    get "#{@api_path}/share/{id}/file"
    produces "application/json"
    summary "Get a file via a share url"
    deprecated false
    parameter("Authorization", :header, :string, "Bearer", required: true)
    parameters do
      id :path, :string, "Share Url ID", required: true
    end
    response 200, "Ok", Schema.ref(:File)
    response 401, "Unauthorized", Schema.ref(:ErrorResp)
    response 404, "Not Found", Schema.ref(:ErrorResp)
  end

  def show_file(conn, %{"id" => id}) do
    with {:share_url_exists, %ShareURL{} = share_url} <- {:share_url_exists, ShareURLs.get_share_url!(id)},
         {:file_exists, %File{} = file} <- {:file_exists, Files.get_file!(share_url.file_id)} do
      render(conn, :show_file, file: file)
    else
      {:share_url_exists, _} -> {:error, :not_found}
      {:file_exists, _} -> {:error, :not_found}
    end
  end

  swagger_path :show_channel do
    get "#{@api_path}/share/{id}/channel"
    produces "application/json"
    summary "Get a channel via a share url"
    deprecated false
    parameter("Authorization", :header, :string, "Bearer", required: true)
    parameters do
      id :path, :string, "Share Url ID", required: true
    end
    response 200, "Ok", Schema.ref(:EditorChannel)
    response 401, "Unauthorized", Schema.ref(:ErrorResp)
    response 404, "Not Found", Schema.ref(:ErrorResp)
  end

  def show_channel(conn, %{"id" => id}) do
    with {:share_url_exists, %ShareURL{} = share_url} <- {:share_url_exists, ShareURLs.get_share_url!(id)},
         {:file_exists, %File{} = file} <- {:file_exists, Files.get_file!(share_url.file_id)},
         {:channel_exists, %EditorChannel{} = editor_channel} <- {:channel_exists, EditorChannels.get_channel!(file.channel_id)} do
      render(
        conn,
        :show_channel,
        editor_channel: editor_channel |> Repo.preload(:creator)
      )
    else
      {:share_url_exists, _} -> {:error, :not_found}
      {:file_exists, _} -> {:error, :not_found}
      {:channel_exists, _} -> {:error, :not_found}
    end
  end

  swagger_path :delete do
    PhoenixSwagger.Path.delete "#{@api_path}/share/{id}"
    summary "Delete a share url"
    deprecated false
    parameter("Authorization", :header, :string, "Bearer", required: true)
    parameters do
      id :path, :string, "Share Url ID", required: true
    end
    response 204, "No Content"
    response 401, "Unauthorized", Schema.ref(:ErrorResp)
    response 404, "Not Found", Schema.ref(:ErrorResp)
  end

  def delete(conn, %{"id" => id}) do
    with {:share_url_exists, %ShareURL{} = share_url} <- {:share_url_exists, ShareURLs.get_share_url!(id)},
         {:ok, %ShareURL{}} <- ShareURLs.delete_share_url(share_url) do
      send_resp(conn, :no_content, "")
    else
      {:share_url_exists, _} -> {:error, :not_found}
      {:error, _} -> {:error, :unauthorized}
    end
  end

  defp owner?(user, file) do
    with %File{} <- file, %User{} <- user do
      user.id == file.owner_id
    end
  end
end
