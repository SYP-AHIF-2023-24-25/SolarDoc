defmodule SolardocPhoenixWeb.EditorChannelController do
  use SolardocPhoenixWeb, :controller
  use PhoenixSwagger, except: [:delete]

  alias SolardocPhoenix.EditorChannels
  alias SolardocPhoenix.EditorChannels.EditorChannel

  action_fallback SolardocPhoenixWeb.FallbackController

  @api_path SolardocPhoenixWeb.v1_api_path()

  def swagger_definitions do
  %{
    UserTrusted: swagger_schema do
      title "UserTrusted"
      description "A user which data can be accessed by trusted users i.e. an in between of public and private data"
      properties do
        id :string, "User UUID", required: true
        username :string, "User username", required: true
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
        active_since :integer, "Editor channel active since in milliseconds", required: true
      end
    end,
    EditorChannels: swagger_schema do
      title "EditorChannels"
      description "A list of editor channels"
      type :array
      items Schema.ref(:EditorChannel)
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
    get "#{@api_path}/editor_channels"
    produces "application/json"
    summary "List all currently running editor channels"
    deprecated false
    parameter("Authorization", :header, :string, "Bearer", required: true)
    response 200, "OK", Schema.ref(:EditorChannels)
    response 401, "Unauthorized", Schema.ref(:Errors)
  end

  def index(conn, _params) do
    editor_channels = EditorChannels.list_editor_channels()
    render(conn, :index, editor_channels: editor_channels)
  end

  swagger_path :show do
    get "#{@api_path}/editor_channels/{id}"
    produces "application/json"
    summary "Get a single editor channel"
    deprecated false
    parameter("Authorization", :header, :string, "Bearer", required: true)
    parameters do
      id :path, :string, "Editor channel ID", required: true
    end
    response 200, "OK", Schema.ref(:EditorChannel)
    response 401, "Unauthorized", Schema.ref(:Errors)
  end

  def show(conn, %{"id" => id}) do
    editor_channel = EditorChannels.get_editor_channel!(id)
    render(conn, :show, editor_channel: editor_channel)
  end

# TODO! Implement and check whether the use is the creator of the channel
#  swagger_path :update do
#    put "#{@api_path}/editor_channels/:id"
#    produces "application/json"
#    summary "Update a single editor channel"
#    deprecated false
#    parameter("Authorization", :header, :string, "Bearer", required: true)
#    parameters do
#      id :path, :integer, "Editor channel ID", required: true
#      editor_channel :body, Schema.ref(:EditorChannel), "Editor channel attributes", required: true
#    end
#    response 200, "OK", Schema.ref(:EditorChannel)
#    response 400, "Bad Request", Schema.ref(:Errors)
#    response 401, "Unauthorized", Schema.ref(:Errors)
#  end
#
#  def update(conn, %{"id" => id, "editor_channel" => editor_channel_params}) do
#    editor_channel = EditorChannels.get_editor_channel!(id)
#
#    with {:ok, %EditorChannel{} = editor_channel} <- EditorChannels.update_editor_channel(editor_channel, editor_channel_params) do
#      render(conn, :show, editor_channel: editor_channel)
#    end
#  end
end
