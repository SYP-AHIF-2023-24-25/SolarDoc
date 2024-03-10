defmodule SolardocPhoenixWeb.PingController do
  use SolardocPhoenixWeb, :controller
  use PhoenixSwagger

  action_fallback SolardocPhoenixWeb.FallbackController

  @api_path SolardocPhoenixWeb.v1_api_path()

  def swagger_definitions do
    %{
      Ping: swagger_schema do
        title "Ping"
        description "A simple ping response"
        properties do
          message :string, "A simple message", required: true
        end
      end
    }
  end

  swagger_path :index do
    get "#{@api_path}/ping"
    produces "application/json"
    summary "Ping the server"
    deprecated false
    response 200, "OK", Schema.ref(:Ping)
  end

  def index(conn, _params) do
    # Return static JSON for now
    json(conn, %{
      message: "pong"
    })
  end
end
