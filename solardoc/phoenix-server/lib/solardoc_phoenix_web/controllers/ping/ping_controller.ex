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
          greeting :string, "A friendly greeting", example: "Hello from Solardoc Phoenix!", required: true
          date :integer, "The current date in milliseconds", example: :os.system_time(:millisecond), required: true
          url :string, "The URL to ping", example: "#{@api_path}/ping", required: true
          ip :string, "The IP address of the client", example: "123.98.21.101", required: true
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
    {ip1, ip2, ip3, ip4} = conn.remote_ip
    json(conn, %{
      greeting: "Hello from Solardoc Phoenix!",
      date: :os.system_time(:millisecond),
      url: "#{@api_path}/ping",
      ip: "#{ip1}.#{ip2}.#{ip3}.#{ip4}"
    })
  end
end
