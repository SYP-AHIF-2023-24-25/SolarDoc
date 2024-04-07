defmodule SolardocPhoenixWeb.FileController do
  use SolardocPhoenixWeb, :controller
  use PhoenixSwagger

  alias SolardocPhoenix.Files
  alias SolardocPhoenix.Files.File
  alias SolardocPhoenix.Accounts
  alias SolardocPhoenix.Accounts.User

  action_fallback SolardocPhoenixWeb.FallbackController

  @api_path SolardocPhoenixWeb.v1_api_path()

  def swagger_definitions do
  %{
    File: swagger_schema do
      title "File"
      description "A file which is owned by a user"
      properties do
        id :string, "File UUID", required: false
        file_name :string, "File name", required: true
        owner_id :string, "Owner id", required: false
        last_edited :integer, "last edited", required: false
        created :integer, "creation date", required: false
      end
    end,
    Message: swagger_schema do
      title "Message"
      description "A message"
      properties do
        message :string, "A message", required: true
      end
    end,
    Files: swagger_schema do
      title "Files"
      description "A list of files"
      type :array
      items Schema.ref(:File)
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
      file :body, Schema.ref(:File), "file attributes"
    end
    response 201, "Created", Schema.ref(:File)
    response 400, "Bad Request", Schema.ref(:Errors)
  end

  def create(conn,file_params) do
    file_params = Map.put(file_params, "owner_id", conn.assigns.current_user.id)
    file_params = Map.put(file_params, "created", DateTime.utc_now())
    file_params = Map.put(file_params, "last_edited", DateTime.utc_now())
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
    file = Files.get_file!(id)
    with true <- is_owner(conn.assigns.current_user, file) do
      render(conn, :show, file: file)
    else
      false -> {:error, :Unauthorized}
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
      file :body, Schema.ref(:File), "file attributes", required: true
    end
    parameter("file", :body, Schema.ref(:File), "file attributes", required: true)
    response 200, "OK", Schema.ref(:File)
    response 400, "Bad Request", Schema.ref(:Errors)
    response 401, "Unauthorized", Schema.ref(:Errors)
  end

  def update(conn,id,file_params) do
    file = Files.get_file!(id)
    file_params = Map.put(file_params, "last_edited", DateTime.utc_now())
    with true <- is_owner(conn.assigns.current_user, file),
         {:ok, %File{} = file} <- Files.update_file(file, file_params) do
      render(conn, :show, file: file)
    else
      :error -> {:error, :Unauthorized}
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
    response 200, "OK", Schema.ref(:Message)
    response 204, "No Content", Schema.ref(:Message)
    response 400, "Bad Request", Schema.ref(:Errors)
    response 401, "Unauthorized", Schema.ref(:Errors)
  end

  def delete(conn, %{"id" => id}) do
    file = Files.get_file!(id)

    with true <- is_owner(conn.assigns.current_user, file),
         {:ok, %File{}} <- Files.delete_file(file) do
        send_resp(conn, :no_content, "")
    else
      :error -> {:error, :Unauthorized}
    end
  end

  defp is_owner(user, file) do
    with %File{} <- file, %User{} <- user do
      user.id == file.owner_id
    end
  end
end