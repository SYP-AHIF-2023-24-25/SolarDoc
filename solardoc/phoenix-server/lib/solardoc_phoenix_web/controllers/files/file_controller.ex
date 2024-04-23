defmodule SolardocPhoenixWeb.FileController do
  use SolardocPhoenixWeb, :controller
  use PhoenixSwagger

  alias SolardocPhoenix.Files
  alias SolardocPhoenix.Files.File
  alias SolardocPhoenix.Accounts.User

  action_fallback SolardocPhoenixWeb.FallbackController

  @api_path SolardocPhoenixWeb.v1_api_path()

  def swagger_definitions do
  %{
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
      end
    end,
    Files: swagger_schema do
      title "Files"
      description "A list of files"
      type :array
      items Schema.ref(:File)
    end,
    CreateFile: swagger_schema do
      title "CreateFile"
      description "Arguments for creating a file"
      properties do
        file_name :string, "File name", required: true
        content :string, "File content", required: false
      end
    end,
    UpdateFile: swagger_schema do
      title "UpdateFile"
      description "Arguments for updating a file"
      properties do
        file_name :string, "File name", required: false
        content :string, "File content", required: false
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
    get "#{@api_path}/files"
    produces "application/json"
    summary "List all files owned by the current user"
    deprecated false
    parameter("Authorization", :header, :string, "Bearer", required: true)
    response 200, "OK", Schema.ref(:Files)
    response 401, "Unauthorized", Schema.ref(:Errors)
  end

  def index(conn, _params) do
    files = Files.get_files_for_user(conn.assigns.current_user.id)
    render(conn, :index, files: files)
  end

  swagger_path :create do
    post "#{@api_path}/files"
    consumes "application/json"
    produces "application/json"
    summary "Create a new file"
    parameter("Authorization", :header, :string, "Bearer", required: true)
    parameters do
      file :body, Schema.ref(:CreateFile), "Arguments for creating a file", required: true
    end
    response 201, "Created", Schema.ref(:File)
    response 400, "Bad Request", Schema.ref(:Errors)
    response 401, "Unauthorized", Schema.ref(:Errors)
  end

  def create(conn, file_params) do
    file_params = Map.put(file_params, "owner_id", conn.assigns.current_user.id)
    with {:ok, %File{} = file} <- Files.create_file(file_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/files/#{file}")
      |> render(:show, file: file)
    end
  end

  swagger_path :show do
    get "#{@api_path}/files/{id}"
    produces "application/json"
    summary "Get a single file"
    deprecated false
    parameter("Authorization", :header, :string, "Bearer", required: true)
    parameters do
      id :path, :string, "File ID", required: true
    end
    response 200, "OK", Schema.ref(:File)
    response 401, "Unauthorized", Schema.ref(:Errors)
  end

  def show(conn, %{"id" => id}) do
    with {:file_exists, %File{} = file} <- {:file_exists, Files.get_file!(id)},
         {:is_owner, true} <- {:is_owner, is_owner(conn.assigns.current_user, file)} do
      render(conn, :show, file: file)
    else
      {:file_exists, _} -> {:error, :not_found}
      {:is_owner, false} -> {:error, :unauthorized}
    end
  end

  swagger_path :update do
    put "#{@api_path}/files/{id}"
    produces "application/json"
    summary "Update a single file"
    deprecated false
    parameter("Authorization", :header, :string, "Bearer", required: true)
    parameters do
      id :path, :string, "File ID", required: true
      file :body, Schema.ref(:UpdateFile), "Arguments for updating a file", required: true
    end
    response 200, "OK", Schema.ref(:File)
    response 400, "Bad Request", Schema.ref(:Errors)
    response 401, "Unauthorized", Schema.ref(:Errors)
  end

  def update(conn, file_params) do
    with {:id, id} <- {:id, file_params["id"]},
         {:file_exists, %File{} = file} <- {:file_exists, Files.get_file!(id)},
         {:is_owner, true} <- {:is_owner, is_owner(conn.assigns.current_user, file)},
         {:ok, %File{} = file} <- Files.update_file(file, file_params) do
      render(conn, :show, file: file)
    else
      {:id, _} -> {:error, :not_found}
      {:file_exists, _} -> {:error, :not_found}
      {:is_owner, false} -> {:error, :unauthorized}
      {:error, changeset} -> {:error, changeset}
    end
  end

  swagger_path :delete do
    PhoenixSwagger.Path.delete "#{@api_path}/files/{id}"
    produces "application/json"
    summary "Deletes a file"
    deprecated false
    parameter("Authorization", :header, :string, "Bearer", required: true)
    parameters do
      id :path, :string, "File ID", required: true
    end
    response 204, "No Content"
    response 400, "Bad Request", Schema.ref(:Errors)
    response 401, "Unauthorized", Schema.ref(:Errors)
  end

  def delete(conn, params) do
    with {:id, id} <- {:id, params["id"]},
         {:file_exists, %File{} = file} <- {:file_exists, Files.get_file!(id)},
         {:is_owner, true} <- {:is_owner, is_owner(conn.assigns.current_user, file)},
         {:ok, %File{}} <- Files.delete_file(file) do
        send_resp(conn, :no_content, "")
    else
      {:id, _} -> {:error, :not_found}
      {:file_exists, _} -> {:error, :not_found}
      {:is_owner, false} -> {:error, :unauthorized}
      {:error, changeset} -> {:error, changeset}
    end
  end

  defp is_owner(user, file) do
    with %File{} <- file, %User{} <- user do
      user.id == file.owner_id
    end
  end
end
