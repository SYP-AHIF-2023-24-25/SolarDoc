defmodule SolardocPhoenixWeb.FilePermissionController do
  use SolardocPhoenixWeb, :controller
  use PhoenixSwagger

  alias SolardocPhoenix.Permissions
  alias SolardocPhoenix.Permissions.FilePermission
  alias SolardocPhoenix.Files
  alias SolardocPhoenix.Files.File
  alias SolardocPhoenix.Accounts.User


  action_fallback SolardocPhoenixWeb.FallbackController
  @api_path SolardocPhoenixWeb.v1_api_path()

  def swagger_definitions do
    %{
      FilePermission: swagger_schema do
        title "FilePermissions"
        description "The permissions for each user having access to the file via a share-url"
        properties do
          id :string, "The Permission entries UUID", required: true
          file_id :string, "The files UUID", required: true
          user_id :string, "The UUID of the user to whom the permission belongs", required: true
          permission :integer, "The permission the user has for the file (none/read/read-write)", required: true
        end
      end,
      CreateFilePermission: swagger_schema do
        title "CreateFilePermissions"
        description "Creates a new permission entry for a user"
        properties do
          file_id :string, "File UUID", required: true
          permission :integer, "Byte-formatted Permissions", required: true
          user_id :string, "The users UUID", required: true
        end
      end,
      UpdatePermission: swagger_schema do
        title "UpdateFilePermissions"
        description "Arguments for updating a file permission"
        properties do
          file_id :string, "File UUID", required: true
          permission :integer, "New permission", required: true
          user_id :string, "User UUID", required: true
        end
      end,
      GetPermissionForUser: swagger_schema do
        title "GetPermissionForUser"
        description "Gets the permissions for one file from one specific user"
        properties do
          file_id :string, "File UUID", required: true
          user_id :string, "User UUID", required: true
        end
      end,
      ErrorResp: swagger_schema do
        title "ErrorsResp"
        description "A list of errors"
        properties do end
      end
    }
  end


  def index(conn, _params) do
    file_permissions = Permissions.list_file_permissions()
    render(conn, :index, file_permissions: file_permissions)
  end

  swagger_path :create do
    post "#{@api_path}/file/permission"
    consumes "application/json"
    produces "application/json"
    summary "Create a new file permission"
    deprecated false
    parameter("Authorization", :header, :string, "Bearer", required: true)
    parameters do
      file_permission_params :body, Schema.ref(:CreateFilePermission), "Arguments for creating a file permission", required: true
    end
    response 201, "Created", Schema.ref(:FilePermission)
    response 400, "Bad Request", Schema.ref(:ErrorResp)
    response 401, "Unauthorized", Schema.ref(:ErrorResp)
  end
  def create(conn,  file_permission_params) do
    with {:file_exists, %File{} = file} <- {:file_exists, Files.get_file!(file_permission_params["file_id"])} do
      with {:ok, %FilePermission{} = file_permission} <- Permissions.create_file_permission(file_permission_params) do
        conn
        |> put_status(:created)
        |> put_resp_header("location", ~p"/#{@api_path}/file/permissions/#{file_permission.id}")
        |> render(:show, file_permission: file_permission)
      end
    else
      {:file_exists, _} -> {:error, :not_found}
    end
  end

  swagger_path :show do
    get "#{@api_path}/file/permission/{id}"
    produces "application/json"
    summary "Get a single file permission"
    deprecated false
    parameter("Authorization", :header, :string, "Bearer", required: true)
    parameters do
      id :path, :string, "File permission ID", required: true
    end
    response 200, "Ok", Schema.ref(:FilePermission)
    response 401, "Unauthorized", Schema.ref(:ErrorResp)
    response 404, "Not Found", Schema.ref(:ErrorResp)
  end
  def show(conn, %{"id" => id}) do
    case {:file_permission_exists, Permissions.get_file_permission!(id)} do
      {:file_permission_exists, %FilePermission{} = file_permission} ->
        render(conn, :show, file_permission: file_permission)
      {:file_permission_exists,_} ->
        {:error, :not_found}
    end
  end

  swagger_path :update do
    put "#{@api_path}/file/permission/{id}"
    produces "application/json"
    summary "Update a single file"
    deprecated false
    parameter("Authorization", :header, :string, "Bearer", required: true)
    parameters do
      id :path, :string, "File permission ID", required: true
      file_permission :body, Schema.ref(:UpdatePermission), "Arguments for updating a file permission", required: true
    end
    response 200, "OK", Schema.ref(:FilePermission)
    response 400, "Bad Request", Schema.ref(:ErrorResp)
    response 401, "Unauthorized", Schema.ref(:ErrorResp)
    response 404, "Not Found", Schema.ref(:ErrorResp)
  end
  def update(conn,  file_permission_params) do
    with {:id, id} <- {:id, file_permission_params["id"]},
         {:file_permission_exists, %FilePermission{} = file_permission} <- {:file_permission_exists, Permissions.get_file_permission!(id)},
         {:file_exists, %File{} = file} <- {:file_exists, Files.get_file!(file_permission_params["file_id"])},
         {:is_owner, true} <- {:is_owner, owner?(conn.assigns.current_user, file)},
         {:ok, %FilePermission{} = file_permission} <- Permissions.update_file_permission(file_permission, file_permission_params) do
      render(conn, :show, file_permission: file_permission)
    else
      {:id, _} -> {:error, :not_found}
      {:file_permission_exists, _} -> {:error, :not_found}
      {:file_exists, _} -> {:error, :not_found}
      {:is_owner, false} -> {:error, :unauthorized}
      {:error, changeset} -> {:error, changeset}
    end
  end

  swagger_path :show_permission_for_user do
    get "#{@api_path}/file/{file_id}/permission/{user_id}"
    produces "application/json"
    summary "Gets the permissions for one file from one specific user"
    deprecated false
    parameter("Authorization", :header, :string, "Bearer", required: true)
    parameter("file_id", :path, :string, "File ID", required: true)
    parameter("user_id", :path, :string, "User ID", required: true)
    response 200, "OK", Schema.ref(:FilePermission)
    response 400, "Bad Request", Schema.ref(:ErrorResp)
    response 401, "Unauthorized", Schema.ref(:ErrorResp)
    response 404, "Not Found", Schema.ref(:ErrorResp)
  end

  def show_permission_for_user(conn, %{"file_id" => file_id, "user_id" => user_id}) do
    with %FilePermission{} = file_permission <- Permissions.get_file_permission_by_user_file!(user_id, file_id) do
      render(conn, :show, file_permission: file_permission)
    else
      nil ->
        conn
        |> put_status(:not_found)
        |> render("error.json", message: "File permission not found")
    end
  end
  #def delete(conn, %{"id" => id}) do
  #  file_permission = Permissions.get_file_permission!(id)
  #
  #  with {:ok, %FilePermission{}} <- Permissions.delete_file_permission(file_permission) do
  #  send_resp(conn, :no_content, "")
  #  end
  #end

  defp owner?(user, file) do
    with %File{} <- file, %User{} <- user do
      user.id == file.owner_id
    end
  end
end
